import { mutation, query } from "./_generated/server";

import { v } from "convex/values";
import { requireAuth } from "./users";

export const upsertLessonProgress = mutation({
  args: {
    lessonId: v.string(),
    percentage: v.number(),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = requireAuth(ctx as any);
    const now = Date.now();
    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("lessonId"), args.lessonId))
      .first();
    if (existing) {
      return ctx.db.patch(existing._id, {
        percentage: args.percentage,
        completed: args.completed ?? false,
        updatedAt: now,
      });
    }
    return ctx.db.insert("lessonProgress", {
      userId,
      lessonId: args.lessonId,
      percentage: args.percentage,
      completed: args.completed ?? false,
      updatedAt: now,
    });
  },
});

export const listLessonProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    return ctx.db.query("lessonProgress").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});

export const toggleBookmark = mutation({
  args: { scriptureId: v.string() },
  handler: async (ctx, args) => {
    const userId = requireAuth(ctx as any);
    const existing = await ctx.db
      .query("scriptureBookmarks")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("scriptureId"), args.scriptureId))
      .first();
    if (existing) {
      return ctx.db.delete(existing._id);
    }
    return ctx.db.insert("scriptureBookmarks", {
      userId,
      scriptureId: args.scriptureId,
      createdAt: Date.now(),
    });
  },
});

export const listBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    return ctx.db.query("scriptureBookmarks").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});
