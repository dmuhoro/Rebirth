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
  return userId;
}

export type { v };
