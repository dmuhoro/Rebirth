export function isJournalImportAllowed(
  localId: string,
  createdAt: number,
  deletedIds: ReadonlySet<string>,
  deletedBefore: number | null,
): boolean {
  return (
    localId !== "entry-seed-1" &&
    !deletedIds.has(localId) &&
    (deletedBefore === null || createdAt > deletedBefore)
  );
}

export function isJournalVisibleInRestore(
  localId: string | undefined,
  createdAt: number,
  deletedIds: ReadonlySet<string>,
  deletedBefore: number | null,
): boolean {
  if (localId === "entry-seed-1") return false;
  if (localId && deletedIds.has(localId)) return false;
  return deletedBefore === null || createdAt > deletedBefore;
}
