import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const profile = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (profile) return profile;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      userId,
      email: "email" in user ? user.email : undefined,
      name: "name" in user ? user.name : undefined,
      imageUrl: "image" in user ? user.image : undefined,
    };
  },
});

export const upsertProfile = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    const existing = await ctx.db.query("profiles").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (existing) {
      return ctx.db.patch(existing._id, { ...args, updatedAt: now });
    }
    return ctx.db.insert("profiles", { userId, ...args, createdAt: now, updatedAt: now });
  },
});
