import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./users";

export const listContentItems = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    requireAuth(ctx as any);
    if (args.status) {
      return ctx.db.query("contentItems").withIndex("by_status", (q) => q.eq("status", args.status));
    }
    return ctx.db.query("contentItems");
  },
});

export const listReviewCards = query({
  args: {},
  handler: async (ctx) => {
    const userId = requireAuth(ctx as any);
    const now = Date.now();
    return ctx.db.query("reviewCards").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});
