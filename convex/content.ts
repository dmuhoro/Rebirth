import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./ownership";

export const listContentItems = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    if (args.status) {
      const status = args.status;
      return ctx.db.query("contentItems").withIndex("by_status", (q) => q.eq("status", status));
    }
    return ctx.db.query("contentItems");
  },
});

export const listReviewCards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    return ctx.db.query("reviewCards").withIndex("by_userId", (q) => q.eq("userId", userId));
  },
});
