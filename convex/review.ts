import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";

export const upsertReviewCard = mutation({
  args: {
    term: v.string(),
    language: v.string(),
    transliteration: v.string(),
    definition: v.string(),
    theologicalSignificance: v.string(),
    easeFactor: v.optional(v.number()),
    interval: v.optional(v.number()),
    repetitions: v.optional(v.number()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    const existing = await ctx.db
      .query("reviewCards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("term"), args.term))
      .first();
    if (existing) {
      return ctx.db.patch(existing._id, {
        easeFactor: args.easeFactor ?? existing.easeFactor,
        interval: args.interval ?? existing.interval,
        repetitions: args.repetitions ?? existing.repetitions,
        dueAt: args.dueAt ?? existing.dueAt,
        updatedAt: now,
      });
    }
    return ctx.db.insert("reviewCards", {
      userId,
      term: args.term,
      language: args.language,
      transliteration: args.transliteration,
      definition: args.definition,
      theologicalSignificance: args.theologicalSignificance,
      easeFactor: args.easeFactor ?? 2.5,
      interval: args.interval ?? 0,
      repetitions: args.repetitions ?? 0,
      dueAt: args.dueAt ?? now,
      updatedAt: now,
    });
  },
});

export const listDueReviewCards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    return ctx.db
      .query("reviewCards")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.lt(q.field("dueAt"), now));
  },
});

export const recordReviewEvent = mutation({
  args: {
    cardId: v.string(),
    quality: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const card = await ctx.db.get(args.cardId as any);
    if (!card || (card as any).userId !== userId) {
      throw new Error("Not found or not authorized");
    }
    const quality = Math.max(0, Math.min(5, Math.round(args.quality)));
    return ctx.db.insert("reviewEvents", {
      userId,
      cardId: args.cardId as any,
      quality,
      reviewedAt: Date.now(),
    });
  },
});

export const listPracticeStreakDates = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    return ctx.db
      .query("practiceSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});
