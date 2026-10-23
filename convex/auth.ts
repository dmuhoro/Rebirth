import { convexAuth } from "@convex-dev/auth/server";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";

/**
 * Rebirth Convex Auth (Phase 3).
 *
 * Providers: Google OAuth and passwordless email links.
 *
 * Environment variables (set in Convex dashboard → Settings → Authentication):
 *   AUTH_SECRET           — random string that signs auth tokens (REQUIRED)
 *   AUTH_GOOGLE_ID        — Google OAuth client ID
 *   AUTH_GOOGLE_SECRET    — Google OAuth client secret
 *   RESEND_API_KEY        — Resend API key (required in production)
 *   EMAIL_FROM            — from address for magic links
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Email({
      sendVerificationRequest: async ({ identifier, url }) => {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.EMAIL_FROM;
        if (!apiKey || !from) {
          if (process.env.EMAIL_LINK_DEV_MODE === "true") {
            console.info(`[Rebirth Auth] Development magic link: ${url}`);
            return;
          }
          throw new Error("Email sign-in is not configured.");
        }

        const safeUrl = url.replace(/[&<>"']/g, (character) => {
          const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return entities[character];
        });
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [identifier],
            subject: "Your Rebirth sign-in link",
            html: `<p>Use this secure link to sign in to Rebirth:</p><p><a href="${safeUrl}">Sign in to Rebirth</a></p><p>If you didn't request this link, you can ignore this email.</p>`,
          }),
        });
        if (!response.ok) {
          throw new Error(`Email provider rejected magic link (${response.status}).`);
        }
      },
    }),
  ],
});
