

/** Returns the authenticated userId or throws if unauthenticated. */
export function getUserId(ctx: { auth: { getUserIdentity: () => { userId?: string | null } } }): string {
  const identity = ctx.auth.getUserIdentity();
  if (!identity?.userId) {
    throw new Error("Authentication required");
  }
  return identity.userId;
}

export function isAuthenticated(ctx: { auth: { getUserIdentity: () => { userId?: string | null } } }): boolean {
  return Boolean(ctx.auth.getUserIdentity()?.userId);
}
