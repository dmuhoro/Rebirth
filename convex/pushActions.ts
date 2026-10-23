"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { WebPushError, sendNotification, setVapidDetails } from "web-push";

export const sendTestNotification = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required.");

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    if (!publicKey || !privateKey || !subject) {
      throw new Error("Web Push delivery is not configured.");
    }

    setVapidDetails(subject, publicKey, privateKey);
    const subscriptions = await ctx.runQuery(internal.push.listForUser, {
      userId,
    });
    if (subscriptions.length === 0) {
      throw new Error("Enable notifications on this device before sending a test.");
    }

    let delivered = 0;
    for (const subscription of subscriptions) {
      try {
        await sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify({
            title: "Rebirth",
            body: "Notifications are enabled on this device.",
            url: "/",
          }),
          { TTL: 60 },
        );
        delivered++;
      } catch (error) {
        if (error instanceof WebPushError && [404, 410].includes(error.statusCode)) {
          await ctx.runMutation(internal.push.removeById, {
            id: subscription._id,
          });
          continue;
        }
        throw error;
      }
    }
    if (delivered === 0) {
      throw new Error("No active notification subscription remains on this account.");
    }
    return { delivered };
  },
});
