import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useConvexAuth as useAuth } from "@convex-dev/auth/react";
import { convex, api } from "./convex";
import { useQuery } from "convex/react";
import type { JournalEntry } from "../types";

export interface LocalDataImport {
  journalEntries: JournalEntry[];
  lessonProgress: Record<string, number>;
  completedLessonIds: string[];
  bookmarkedScriptureIds: string[];
}

export interface MigrationResult {
  importedJournals: number;
  importedProgress: number;
  importedBookmarks: number;
}

interface SyncContextType {
  isSynced: boolean;
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
 * Convex sync provider (Phase 3).
 *
 * Uses Convex auth for identity:
 *   - Signed in: userId from Convex auth, data syncs to Convex (ownership enforced).
 *   - Guest: userId = null, data stays in localStorage only (never written to Convex).
 *
 * Import is idempotent and may be retried after an interrupted migration.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

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
      const batchCount = Math.max(journals.length, progress.length, bookmarks.length);
      const result: MigrationResult = {
        importedJournals: 0,
        importedProgress: 0,
        importedBookmarks: 0,
      };

      for (let index = 0; index < batchCount; index++) {
        const batchResult = await convex.mutation(api.sync.importLocalData, {
          journalEntries: (journals[index] ?? []).map((entry) => ({
            ...entry,
            isFavorite: entry.isFavorite ?? false,
          })),
          lessonProgress: progress[index] ?? [],
          bookmarkedScriptureIds: bookmarks[index] ?? [],
        });
        result.importedJournals += batchResult.importedJournals;
        result.importedProgress += batchResult.importedProgress;
        result.importedBookmarks += batchResult.importedBookmarks;
      }
      setIsSynced(true);
      return result;
    },
    [userId],
  );

  return (
    <SyncContext.Provider
      value={{
        isSynced,
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
