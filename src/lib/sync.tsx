import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth as useAuth } from "@convex-dev/auth/react";
import { getConvexClient, api } from "./convex";
import { useQuery } from "convex/react";
import type { JournalEntry } from "../types";

export interface LocalDataImport {
  journalEntries: JournalEntry[];
  lessonProgress: Record<string, number>;
  completedLessonIds: string[];
  bookmarkedScriptureIds: string[];
  deletedJournalIds: string[];
}

export interface MigrationResult {
  importedJournals: number;
  importedProgress: number;
  importedBookmarks: number;
  deletedJournals: number;
}

interface SyncContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  migrateLocalStorageToConvex: (
    data: LocalDataImport,
  ) => Promise<MigrationResult>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    chunks.push(items.slice(start, start + size));
  }
  return chunks;
}

/**
 * Convex account provider for explicit backup and restore (Phase 3).
 *
 * Uses Convex auth for identity:
 *   - Signed in: userId from Convex auth; explicit imports are ownership-enforced.
 *   - Guest: userId = null; data stays in localStorage only.
 *
 * Import is idempotent and may be retried after an interrupted migration.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch the current user's profile to get their userId.
  const profile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );

  useEffect(() => {
    if (profile?.userId) {
      setUserId(profile.userId);
    } else if (!isAuthenticated) {
      setUserId(null);
    }
  }, [profile, isAuthenticated]);

  const migrateLocalStorageToConvex = useCallback(
    async (data: LocalDataImport): Promise<MigrationResult> => {
      if (!userId) {
        throw new Error("Sign in before importing local data.");
      }

      const progressByLesson = { ...data.lessonProgress };
      for (const lessonId of data.completedLessonIds) {
        progressByLesson[lessonId] = Math.max(
          progressByLesson[lessonId] ?? 0,
          100,
        );
      }
      const journals = chunk(data.journalEntries, 10);
      const progress = chunk(
        Object.entries(progressByLesson).map(([lessonId, percentage]) => ({
          lessonId,
          percentage,
        })),
        100,
      );
      const bookmarks = chunk(data.bookmarkedScriptureIds, 100);
      const deletedJournals = chunk(data.deletedJournalIds, 100);
      const batchCount = Math.max(
        journals.length,
        progress.length,
        bookmarks.length,
        deletedJournals.length,
      );
      const result: MigrationResult = {
        importedJournals: 0,
        importedProgress: 0,
        importedBookmarks: 0,
        deletedJournals: 0,
      };

      for (let index = 0; index < batchCount; index++) {
        const batchResult = await getConvexClient().mutation(
          api.sync.importLocalData,
          {
            journalEntries: (journals[index] ?? []).map((entry) => ({
              ...entry,
              isFavorite: entry.isFavorite ?? false,
            })),
            lessonProgress: progress[index] ?? [],
            bookmarkedScriptureIds: bookmarks[index] ?? [],
            deletedJournalIds: deletedJournals[index] ?? [],
          },
        );
        result.importedJournals += batchResult.importedJournals;
        result.importedProgress += batchResult.importedProgress;
        result.importedBookmarks += batchResult.importedBookmarks;
        result.deletedJournals += batchResult.deletedJournals;
      }
      return result;
    },
    [userId],
  );

  return (
    <SyncContext.Provider
      value={{
        userId,
        isAuthenticated,
        isLoading,
        migrateLocalStorageToConvex,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
