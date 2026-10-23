import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Helper: returns the authenticated user's identity or throws. */
export function requireAuth(ctx: { auth: { getUserIdentity: () => { userId?: string | null } } }) {
  const identity = ctx.auth.getUserIdentity();
  if (!identity?.userId) {
    throw new Error("Authentication required");
  }
  return identity.userId;
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    const profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    return profile;
  },
});

export const upsertProfile = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(ctx as any);
    const now = Date.now();
    const existing = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (existing) {
      return ctx.db.patch(existing._id, { ...args, updatedAt: now });
    }
    return ctx.db.insert("profiles", { userId, ...args, createdAt: now, updatedAt: now });
  },
});
