import { mutation, query } from "./_generated/server";

import { v } from "convex/values";
import { requireAuth } from "./users";

export const listReminderPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    return ctx.db.query("reminderPreferences").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});

export const upsertReminderPreferences = mutation({
  args: {
    morningEnabled: v.optional(v.boolean()),
    eveningEnabled: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(ctx as any);
    const now = Date.now();
    const existing = await ctx.db.query("reminderPreferences").withIndex("by_userId", (q) => q.eq("userId", userId)).first();
    if (existing) {
      return ctx.db.patch(existing._id, { ...args, updatedAt: now });
    }
    return ctx.db.insert("reminderPreferences", { userId, ...args, updatedAt: now });
  },
});

export const listPracticeSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    return ctx.db.query("practiceSessions").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});

export const createPracticeSession = mutation({
  args: {
    contemplationId: v.string(),
    reachedPracticeStep: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(ctx as any);
    return ctx.db.insert("practiceSessions", {
      userId,
      contemplationId: args.contemplationId,
      completedAt: Date.now(),
      reachedPracticeStep: args.reachedPracticeStep ?? false,
    });
  },
});
