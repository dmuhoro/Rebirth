import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

/** Returns the authenticated userId or throws. Used by all ownership-enforced queries/mutations. */
export async function requireAuth(
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>,
): Promise<NonNullable<Awaited<ReturnType<typeof getAuthUserId>>>> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  const deletionMarker = await ctx.db
    .query("userDataDeletionMarkers")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (deletionMarker?.deleting) {
    throw new Error("Data deletion is in progress.");
  }
  return userId;
}

export type { v };
