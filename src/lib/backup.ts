import { z } from "zod";
import type { JournalEntry } from "../types";

const guidanceSchema = z.object({
  pastoralCounsel: z.string(),
  scriptures: z.array(
    z.object({
      reference: z.string(),
      text: z.string(),
      theologicalContext: z.string(),
    }),
  ),
  customPrayer: z.string(),
  breathPrayer: z.string(),
  isAIGenerated: z.boolean().optional(),
  note: z.string().optional(),
});

const journalEntrySchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  feelings: z.string(),
  theme: z.enum([
    "spiritual_strength",
    "repentance_transformation",
    "divinity_of_christ",
    "general",
  ]),
  emotionTag: z.string(),
  guidance: guidanceSchema,
  isFavorite: z.boolean().optional(),
});

const backupSchema = z.object({
  format: z.literal("rebirth-backup"),
  version: z.literal(1),
  exportedAt: z.string(),
  localData: z.object({
    journalEntries: z.array(journalEntrySchema),
    completedLessonIds: z.array(z.string()),
    lessonProgress: z.record(z.string(), z.number()),
    bookmarkedScriptureIds: z.array(z.string()),
    favoriteEntryIds: z.array(z.string()),
    deletedJournalIds: z.array(z.string()),
    deletedBefore: z.number().nullable(),
    speechRate: z.number().min(0.5).max(2),
  }),
  cloudData: z.record(z.string(), z.unknown()).nullable(),
});

export interface BackupLocalData {
  journalEntries: JournalEntry[];
  completedLessonIds: string[];
  lessonProgress: Record<string, number>;
  bookmarkedScriptureIds: string[];
  favoriteEntryIds: string[];
  deletedJournalIds: string[];
  deletedBefore: number | null;
  speechRate: number;
}

export type RebirthBackup = Omit<z.infer<typeof backupSchema>, "localData"> & {
  localData: BackupLocalData;
};

export function filterBackupJournalData(
  journalEntries: JournalEntry[],
  localDeletedIds: string[],
  cloudDeletedIds: string[],
  deletedBefore: number | null,
): { journalEntries: JournalEntry[]; deletedJournalIds: string[] } {
  const deletedIds = new Set([...localDeletedIds, ...cloudDeletedIds]);
  deletedIds.add("entry-seed-1");
  if (deletedBefore !== null) {
    for (const entry of journalEntries) {
      if (entry.timestamp <= deletedBefore) deletedIds.add(entry.id);
    }
  }

  return {
    journalEntries: journalEntries.filter(
      (entry) =>
        !deletedIds.has(entry.id) &&
        (deletedBefore === null || entry.timestamp > deletedBefore),
    ),
    deletedJournalIds: [...deletedIds],
  };
}

export function createBackup(
  localData: BackupLocalData,
  cloudData: Record<string, unknown> | null,
  exportedAt = new Date().toISOString(),
): RebirthBackup {
  const parsed = backupSchema.parse({
    format: "rebirth-backup",
    version: 1,
    exportedAt,
    localData,
    cloudData,
  });
  return { ...parsed, localData };
}

export function parseBackupJson(json: string): RebirthBackup {
  const parsed = backupSchema.parse(JSON.parse(json));
  return {
    ...parsed,
    localData: {
      ...parsed.localData,
      deletedBefore: parsed.localData.deletedBefore ?? null,
    },
  };
}

export function serializeBackupJson(backup: RebirthBackup): string {
  return JSON.stringify(backup, null, 2);
}

function quoteMarkdown(value: string): string {
  return value
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

export function serializeBackupMarkdown(backup: RebirthBackup): string {
  const { localData, cloudData } = backup;
  const sections = [
    "# Rebirth devotional backup",
    "",
    `Exported: ${backup.exportedAt}`,
    "",
    "This file contains private reflections and should be stored securely.",
    "",
    "## Local devotional data",
    "",
    "### Journal entries",
    "",
    ...(localData.journalEntries.length
      ? localData.journalEntries.flatMap((entry) => [
          `#### ${new Date(entry.timestamp).toISOString()} · ${entry.emotionTag}`,
          "",
          `Theme: ${entry.theme}`,
          "",
          quoteMarkdown(entry.feelings),
          "",
          "Pastoral reflection:",
          "",
          quoteMarkdown(entry.guidance.pastoralCounsel),
          "",
          "Scriptures:",
          "",
          ...entry.guidance.scriptures.flatMap((scripture) => [
            `- **${scripture.reference}:** ${scripture.text}`,
            `  - ${scripture.theologicalContext}`,
          ]),
          "",
          "Prayer:",
          "",
          quoteMarkdown(entry.guidance.customPrayer),
          "",
          `Breath prayer: ${entry.guidance.breathPrayer}`,
          "",
          `Favorite: ${entry.isFavorite ? "yes" : "no"}`,
          "",
        ])
      : ["No journal entries.", ""]),
    "### Lesson progress",
    "",
    ...(Object.keys(localData.lessonProgress).length
      ? Object.entries(localData.lessonProgress).map(
          ([lessonId, percentage]) => `- ${lessonId}: ${percentage}%`,
        )
      : ["No lesson progress.", ""]),
    "",
    `Completed lessons: ${localData.completedLessonIds.join(", ") || "none"}`,
    "",
    `Bookmarked scripture studies: ${localData.bookmarkedScriptureIds.join(", ") || "none"}`,
    "",
    `Favorite journal entries: ${localData.favoriteEntryIds.join(", ") || "none"}`,
    "",
    `Deleted journal restore cutoff: ${localData.deletedBefore === null ? "none" : new Date(localData.deletedBefore).toISOString()}`,
    "",
    `Speech rate: ${localData.speechRate}`,
    "",
  ];

  if (cloudData) {
    sections.push("## Cloud account data", "");
    for (const [key, value] of Object.entries(cloudData)) {
      sections.push(
        `### ${key}`,
        "",
        "```json",
        JSON.stringify(value, null, 2) ?? "null",
        "```",
        "",
      );
    }
  } else {
    sections.push(
      "## Cloud account data",
      "",
      "No cloud account data was included in this device-only export.",
      "",
    );
  }

  return sections.join("\n");
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
