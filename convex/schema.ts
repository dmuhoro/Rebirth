import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Rebirth Convex schema (Phase 3).
 *
 * Ownership model (RLS-equivalent): every synced row carries `userId`.
 * Reads filter by `ctx.auth.getUserIdentity()`; writes bind `userId` from auth.
 * Guest rows: `userId: null`, local-only. Cross-user read/write = P0 defect.
 */
export default defineSchema({
  // Authenticated user profiles
  profiles: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // User preferences (theme, speech rate, reminder settings, locale)
  userPreferences: defineTable({
    userId: v.string(),
    speechRate: v.optional(v.number()),
    theme: v.optional(v.string()),
    remindersEnabled: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()),
    locale: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Private journal entries (prayer / reflection). Sensitive data — never logged.
  journalEntries: defineTable({
    userId: v.optional(v.string()), // null = guest/local-only
    feelings: v.string(),
    theme: v.string(),
    emotionTag: v.string(),
    guidance: v.any(), // AIGeneratedGuidance shape
    isFavorite: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
    localId: v.optional(v.string()), // client-side id before migration
    synced: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]).index("by_synced", ["synced"]),

  // Lesson / scripture study progress
  lessonProgress: defineTable({
    userId: v.string(),
    lessonId: v.string(),
    percentage: v.number(),
    completed: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_lessonId", ["lessonId"]),

  // Bookmarked scriptures
  scriptureBookmarks: defineTable({
    userId: v.string(),
    scriptureId: v.string(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_scriptureId", ["scriptureId"]),

  // Practice sessions (daily contemplation completions)
  practiceSessions: defineTable({
    userId: v.string(),
    contemplationId: v.string(),
    completedAt: v.number(),
    reachedPracticeStep: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]).index("by_contemplationId", ["contemplationId"]),

  // Spaced-repetition review cards (Hebrew/Greek terms, verses)
  reviewCards: defineTable({
    userId: v.string(),
    term: v.string(),
    language: v.string(),
    transliteration: v.string(),
    definition: v.string(),
    theologicalSignificance: v.string(),
    easeFactor: v.number(),
    interval: v.number(),
    dueAt: v.number(),
    repetitions: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_dueAt", ["dueAt"]),

  // Review events (SM-2 history)
  reviewEvents: defineTable({
    userId: v.string(),
    cardId: v.id("reviewCards"),
    quality: v.number(), // 0-5 SM-2 quality
    reviewedAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_cardId", ["cardId"]),

  // Reminder preferences (opt-in, non-shaming)
  reminderPreferences: defineTable({
    userId: v.string(),
    morningEnabled: v.optional(v.boolean()),
    eveningEnabled: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // Approved editorial content items (lessons, scripture studies, journeys)
  contentItems: defineTable({
    title: v.string(),
    type: v.string(), // "lesson" | "scripture_study" | "journey" | "daily_contemplation"
    theme: v.string(),
    status: v.string(), // "draft" | "reviewed" | "published"
    author: v.optional(v.string()),
    reviewer: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]).index("by_status", ["status"]).index("by_theme", ["theme"]),

  // Content source & license records (canon tiers)
  contentSources: defineTable({
    contentId: v.id("contentItems"),
    source: v.string(),
    canonTier: v.string(), // "1" | "2" | "3" | "4"
    tradition: v.optional(v.string()),
    license: v.string(),
    url: v.optional(v.string()),
    verifiedAt: v.number(),
  }).index("by_contentId", ["contentId"]),

  // Content review history (theological review gate)
  contentReviews: defineTable({
    contentId: v.id("contentItems"),
    reviewer: v.string(),
    passed: v.boolean(),
    notes: v.optional(v.string()),
    reviewedAt: v.number(),
  }).index("by_contentId", ["contentId"]),

  // Audio asset metadata
  audioAssets: defineTable({
    title: v.string(),
    type: v.string(), // "lesson" | "prayer" | "scripture"
    url: v.string(),
    durationSeconds: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_type", ["type"]),
});
