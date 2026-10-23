import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";

function validatePushEndpoint(endpoint: string): void {
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error("Invalid push subscription endpoint.");
  }

  const host = url.hostname.toLowerCase();
  const supportedHost =
    host === "fcm.googleapis.com" ||
    host === "updates.push.services.mozilla.com" ||
    host === "web.push.apple.com" ||
    host.endsWith(".notify.windows.com");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !supportedHost
  ) {
    throw new Error("Unsupported push subscription endpoint.");
  }
}

export const saveSubscription = mutation({
  args: {
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    validatePushEndpoint(args.endpoint);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId_endpoint", (q) =>
        q.eq("userId", userId).eq("endpoint", args.endpoint),
      )
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        p256dh: args.p256dh,
        auth: args.auth,
        updatedAt: now,
      });
      return existing._id;
    }
    return ctx.db.insert("pushSubscriptions", {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const removeSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId_endpoint", (q) =>
        q.eq("userId", userId).eq("endpoint", args.endpoint),
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const listForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("pushSubscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect(),
});

export const removeById = internalMutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
