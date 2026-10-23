import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";

export const getCloudSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const [journalEntries, lessonProgress, bookmarks] = await Promise.all([
      ctx.db
        .query("journalEntries")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("lessonProgress")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("scriptureBookmarks")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
    ]);
    return { journalEntries, lessonProgress, bookmarks };
  },
});

export const importLocalData = mutation({
  args: {
    journalEntries: v.array(
      v.object({
        id: v.string(),
        timestamp: v.number(),
        feelings: v.string(),
        theme: v.string(),
        emotionTag: v.string(),
        guidance: v.any(),
        isFavorite: v.boolean(),
      }),
    ),
    lessonProgress: v.array(
      v.object({
        lessonId: v.string(),
        percentage: v.number(),
      }),
    ),
    bookmarkedScriptureIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    let importedJournals = 0;
    let importedProgress = 0;
    let importedBookmarks = 0;

    for (const entry of args.journalEntries) {
      const existing = await ctx.db
        .query("journalEntries")
        .withIndex("by_userId_localId", (q) =>
          q.eq("userId", userId).eq("localId", entry.id),
        )
        .first();
      if (!existing) {
        await ctx.db.insert("journalEntries", {
          userId,
          localId: entry.id,
          feelings: entry.feelings,
          theme: entry.theme,
          emotionTag: entry.emotionTag,
          guidance: entry.guidance,
          isFavorite: entry.isFavorite,
          createdAt: entry.timestamp,
          updatedAt: now,
          synced: true,
        });
        importedJournals++;
      }
    }

    for (const progress of args.lessonProgress) {
      const existing = await ctx.db
        .query("lessonProgress")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("lessonId"), progress.lessonId))
        .first();
      const percentage = Math.max(0, Math.min(100, progress.percentage));
      if (existing) {
        if (percentage > existing.percentage) {
          await ctx.db.patch(existing._id, {
            percentage,
            completed: percentage >= 100,
            updatedAt: now,
          });
          importedProgress++;
        }
      } else {
        await ctx.db.insert("lessonProgress", {
          userId,
          lessonId: progress.lessonId,
          percentage,
          completed: percentage >= 100,
          updatedAt: now,
        });
        importedProgress++;
      }
    }

    for (const scriptureId of args.bookmarkedScriptureIds) {
      const existing = await ctx.db
        .query("scriptureBookmarks")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("scriptureId"), scriptureId))
        .first();
      if (!existing) {
        await ctx.db.insert("scriptureBookmarks", {
          userId,
          scriptureId,
          createdAt: now,
        });
        importedBookmarks++;
      }
    }

    return { importedJournals, importedProgress, importedBookmarks };
  },
});

export const listReminderPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
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
    const userId = await requireAuth(ctx);
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
    const userId = await requireAuth(ctx);
    return ctx.db.query("practiceSessions").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});

export const createPracticeSession = mutation({
  args: {
    contemplationId: v.string(),
    reachedPracticeStep: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    return ctx.db.insert("practiceSessions", {
      userId,
      contemplationId: args.contemplationId,
      completedAt: Date.now(),
      reachedPracticeStep: args.reachedPracticeStep ?? false,
    });
  },
});
