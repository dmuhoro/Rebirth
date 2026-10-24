import { describe, expect, it } from "vitest";
import {
  isJournalImportAllowed,
  isJournalVisibleInRestore,
} from "../../convex/syncHelpers";

describe("deleted journal backup protection", () => {
  it("does not re-import a reflection with a local deletion tombstone", () => {
    expect(
      isJournalImportAllowed("entry-deleted", 200, new Set(["entry-deleted"]), null),
    ).toBe(false);
  });

  it("never restores or imports the retired fabricated starter entry", () => {
    expect(
      isJournalImportAllowed("entry-seed-1", 200, new Set(), null),
    ).toBe(false);
    expect(
      isJournalVisibleInRestore("entry-seed-1", 200, new Set(), null),
    ).toBe(false);
  });

  it("blocks old journal exports after all devotional data is deleted", () => {
    expect(isJournalImportAllowed("old-entry", 99, new Set(), 100)).toBe(false);
    expect(isJournalImportAllowed("new-entry", 101, new Set(), 100)).toBe(true);
  });

  it("filters tombstoned or pre-deletion entries from cloud restore", () => {
    const deletedIds = new Set(["deleted-entry"]);

    expect(
      isJournalVisibleInRestore("deleted-entry", 200, deletedIds, null),
    ).toBe(false);
    expect(isJournalVisibleInRestore("older-entry", 99, deletedIds, 100)).toBe(
      false,
    );
    expect(isJournalVisibleInRestore("new-entry", 101, deletedIds, 100)).toBe(
      true,
    );
  });
});
