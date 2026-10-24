import { describe, expect, it } from "vitest";
import {
  createBackup,
  filterBackupJournalData,
  parseBackupJson,
  serializeBackupJson,
  serializeBackupMarkdown,
  type BackupLocalData,
} from "../lib/backup";

const localData: BackupLocalData = {
  journalEntries: [
    {
      id: "entry-1",
      timestamp: Date.UTC(2026, 0, 1),
      feelings: "A private reflection.",
      theme: "spiritual_strength",
      emotionTag: "Weary",
      guidance: {
        pastoralCounsel: "Rest in Christ.",
        scriptures: [
          {
            reference: "Matthew 11:28",
            text: "Come to me, all who labor.",
            theologicalContext: "Christ welcomes the weary.",
          },
        ],
        customPrayer: "Keep me near to You.",
        breathPrayer: "Inhale: Lord Jesus. Exhale: Give me rest.",
      },
      isFavorite: true,
    },
  ],
  completedLessonIds: ["lesson-1"],
  lessonProgress: { "lesson-1": 100, "lesson-2": 40 },
  bookmarkedScriptureIds: ["study-1"],
  favoriteEntryIds: ["entry-1"],
  deletedJournalIds: ["entry-deleted"],
  deletedBefore: null,
  speechRate: 1.25,
};

describe("Rebirth data backups", () => {
  it("round-trips all local data and cloud records as versioned JSON", () => {
    const backup = createBackup(
      localData,
      {
        practiceSessions: [{ contemplationId: "daily-1", completedAt: 123 }],
        reviewCards: [{ term: "meno", interval: 6 }],
      },
      "2026-01-02T00:00:00.000Z",
    );

    expect(parseBackupJson(serializeBackupJson(backup))).toEqual(backup);
    expect(backup.localData.journalEntries[0].feelings).toBe(
      "A private reflection.",
    );
    expect(backup.cloudData?.reviewCards).toEqual([
      { term: "meno", interval: 6 },
    ]);
  });

  it("includes readable journal, progress, bookmarks, and cloud data in Markdown", () => {
    const markdown = serializeBackupMarkdown(
      createBackup(localData, { practiceSessions: [{ contemplationId: "daily-1" }] }),
    );

    expect(markdown).toContain("A private reflection.");
    expect(markdown).toContain("lesson-2: 40%");
    expect(markdown).toContain("study-1");
    expect(markdown).toContain("### practiceSessions");
    expect(markdown).toContain('"contemplationId": "daily-1"');
  });

  it("rejects malformed or unsupported backup files before restoring", () => {
    expect(() => parseBackupJson("{not json")).toThrow();
    expect(() =>
      parseBackupJson(
        JSON.stringify({
          format: "rebirth-backup",
          version: 99,
          exportedAt: "2026-01-01",
          localData,
          cloudData: null,
        }),
      ),
    ).toThrow();
  });

  it("filters local/cloud tombstones and entries older than the deletion cutoff", () => {
    const result = filterBackupJournalData(
      [
        localData.journalEntries[0],
        { ...localData.journalEntries[0], id: "entry-seed-1" },
        { ...localData.journalEntries[0], id: "cloud-deleted" },
        { ...localData.journalEntries[0], id: "before-cutoff", timestamp: 99 },
        { ...localData.journalEntries[0], id: "after-cutoff", timestamp: 101 },
      ],
      ["entry-1"],
      ["cloud-deleted"],
      100,
    );

    expect(result.journalEntries.map((entry) => entry.id)).toEqual([
      "after-cutoff",
    ]);
    expect(result.deletedJournalIds).toEqual(
      expect.arrayContaining(["entry-1", "cloud-deleted", "before-cutoff"]),
    );
    expect(result.journalEntries.map((entry) => entry.id)).not.toContain(
      "entry-seed-1",
    );
  });
});
