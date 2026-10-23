import { mutation, query } from "./_generated/server";

import { v } from "convex/values";
import { requireAuth } from "./ownership";

export const createJournalEntry = mutation({
  args: {
    feelings: v.string(),
    theme: v.string(),
    emotionTag: v.string(),
    guidance: v.any(),
    isFavorite: v.optional(v.boolean()),
    localId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    if (args.localId) {
      const existing = await ctx.db
        .query("journalEntries")
        .withIndex("by_userId_localId", (q) =>
          q.eq("userId", userId).eq("localId", args.localId!),
        )
        .first();
      if (existing) return existing._id;
    }
    return ctx.db.insert("journalEntries", {
      userId,
      feelings: args.feelings,
      theme: args.theme,
      emotionTag: args.emotionTag,
      guidance: args.guidance,
      isFavorite: args.isFavorite ?? false,
      createdAt: now,
      updatedAt: now,
      ...(args.localId ? { localId: args.localId } : {}),
      synced: true,
    });
  },
});

export const listJournalEntries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return ctx.db.query("journalEntries").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});

export const deleteJournalEntry = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const entry = await ctx.db.get(args.id as any);
    if (!entry || (entry as any).userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    return ctx.db.delete(args.id as any);
  },
});

export const exportJournalEntries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return ctx.db.query("journalEntries").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});
