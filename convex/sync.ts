import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";
import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, TableNames } from "./_generated/dataModel";
import {
  isJournalImportAllowed,
  isJournalVisibleInRestore,
} from "./syncHelpers";

export const getCloudSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    const deletionMarker = await ctx.db
      .query("userDataDeletionMarkers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (deletionMarker?.deleting) {
      return {
        account: null,
        profile: null,
        userPreferences: null,
        journalEntries: [],
        lessonProgress: [],
        bookmarks: [],
        deletedJournalIds: [],
        practiceSessions: [],
        reviewCards: [],
        reviewEvents: [],
        reminderPreferences: null,
        deletedBefore: deletionMarker.deletedBefore,
      };
    }
    const [
      journalEntries,
      lessonProgress,
      bookmarks,
      deletedJournals,
      profile,
      userPreferences,
      practiceSessions,
      reviewCards,
      reviewEvents,
      reminderPreferences,
      account,
    ] = await Promise.all([
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
      ctx.db
        .query("journalDeletionTombstones")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("profiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("userPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("practiceSessions")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("reviewCards")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("reviewEvents")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("reminderPreferences")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first(),
      ctx.db.get(userId),
    ]);
    const deletedIds = new Set(deletedJournals.map((entry) => entry.localId));
    return {
      account: account
        ? {
            email: "email" in account ? account.email : undefined,
            name: "name" in account ? account.name : undefined,
            image: "image" in account ? account.image : undefined,
          }
        : null,
      profile,
      userPreferences,
      journalEntries: journalEntries.filter(
        (entry) =>
          isJournalVisibleInRestore(
            entry.localId,
            entry.createdAt,
            deletedIds,
              deletionMarker?.deletedBefore ?? null,
          ),
      ),
      lessonProgress,
      bookmarks,
      deletedJournalIds: [...deletedIds],
      practiceSessions,
      reviewCards,
      reviewEvents,
      reminderPreferences,
      deletedBefore: deletionMarker?.deletedBefore ?? null,
    };
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
    deletedJournalIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    const deletionMarker = await ctx.db
      .query("userDataDeletionMarkers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    const deletedLocalIds = new Set<string>();
    let importedJournals = 0;
    let importedProgress = 0;
    let importedBookmarks = 0;
    let deletedJournals = 0;

    for (const localId of args.deletedJournalIds) {
      deletedLocalIds.add(localId);
      const tombstone = await ctx.db
        .query("journalDeletionTombstones")
        .withIndex("by_userId_localId", (q) =>
          q.eq("userId", userId).eq("localId", localId),
        )
        .first();
      if (!tombstone) {
        await ctx.db.insert("journalDeletionTombstones", {
          userId,
          localId,
          deletedAt: now,
        });
      }
      const existingEntry = await ctx.db
        .query("journalEntries")
        .withIndex("by_userId_localId", (q) =>
          q.eq("userId", userId).eq("localId", localId),
        )
        .first();
      if (existingEntry) {
        await ctx.db.delete(existingEntry._id);
        deletedJournals++;
      }
    }

    for (const entry of args.journalEntries) {
      if (
        !isJournalImportAllowed(
          entry.id,
          entry.timestamp,
          deletedLocalIds,
          deletionMarker?.deletedBefore ?? null,
        )
      ) {
        continue;
      }
      const tombstone = await ctx.db
        .query("journalDeletionTombstones")
        .withIndex("by_userId_localId", (q) =>
          q.eq("userId", userId).eq("localId", entry.id),
        )
        .first();
      if (tombstone) continue;
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

    return {
      importedJournals,
      importedProgress,
      importedBookmarks,
      deletedJournals,
    };
  },
});

export const beginMyDataDeletion = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const marker = await ctx.db
      .query("userDataDeletionMarkers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (marker) {
      await ctx.db.patch(marker._id, {
        deletedBefore: Math.max(marker.deletedBefore, now),
        deleting: true,
      });
    } else {
      await ctx.db.insert("userDataDeletionMarkers", {
        userId,
        deletedBefore: now,
        deleting: true,
      });
    }
    return { deletedBefore: marker ? Math.max(marker.deletedBefore, now) : now };
  },
});

export const deleteMyDataBatch = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const marker = await ctx.db
      .query("userDataDeletionMarkers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!marker?.deleting) {
      throw new Error("Data deletion was not started.");
    }
    let deletedRecords = 0;
    const removeRecords = async <Table extends TableNames>(
      recordsPromise: Promise<Doc<Table>[]>,
    ) => {
      const records = await recordsPromise;
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      return records.length;
    };
    const batchDeleters: Array<() => Promise<number>> = [
      () =>
        removeRecords(
          ctx.db
            .query("reviewEvents")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("reviewCards")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("journalEntries")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("journalDeletionTombstones")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("lessonProgress")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("scriptureBookmarks")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("practiceSessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("reminderPreferences")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("userPreferences")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("profiles")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
      () =>
        removeRecords(
          ctx.db
            .query("pushSubscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .take(100),
        ),
    ];
    for (const deleteBatch of batchDeleters) {
      deletedRecords = await deleteBatch();
      if (deletedRecords > 0) {
        return { complete: false, deletedRecords };
      }
    }

    await ctx.db.patch(marker._id, { deleting: false });
    return { complete: true, deletedRecords: 0 };
  },
});

export const deleteMyData = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ deletedRecords: number; deletedBefore: number }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    const { deletedBefore }: { deletedBefore: number } = await ctx.runMutation(
      internal.sync.beginMyDataDeletion,
      { userId },
    );
    let complete = false;
    let deletedRecords = 0;
    while (!complete) {
      const result = await ctx.runMutation(
        internal.sync.deleteMyDataBatch,
        { userId },
      );
      deletedRecords += result.deletedRecords;
      complete = result.complete;
    }
    return { deletedRecords, deletedBefore };
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
