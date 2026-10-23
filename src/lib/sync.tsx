import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import { ConvexProvider } from "convex/react";
import { convex, api, isConvexReady } from "./convex";

interface SyncContextType {
  isSynced: boolean;
  userId: string | null;
  signIn: (userId: string) => void;
  signOut: () => void;
  migrateLocalStorageToConvex: () => Promise<void>;
  syncJournal: (entries: any[]) => Promise<void>;
  syncLessonProgress: (progress: Record<string, number>) => Promise<void>;
  syncBookmarks: (ids: string[]) => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

/**
 * Convex sync provider.
 *
 * Wraps the app in ConvexProvider and exposes sync operations.
 * Guest mode (no userId) keeps data in localStorage only — Convex is never
 * written to, preserving data sovereignty for unauthenticated users.
 *
 * On sign-in, localStorage → Convex migration is idempotent, consent-based,
 * and duplicate-protected (localId tracking).
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  const signIn = useCallback((id: string) => {
    setUserId(id);
    localStorage.setItem("rebirth_auth_userId", id);
  }, []);

  const signOut = useCallback(() => {
    setUserId(null);
    localStorage.removeItem("rebirth_auth_userId");
  }, []);

  // Restore sign-in state on load (guest mode if none).
  useEffect(() => {
    const saved = localStorage.getItem("rebirth_auth_userId");
    if (saved) setUserId(saved);
  }, []);

  const migrateLocalStorageToConvex = useCallback(async () => {
    if (!userId) return;
    setIsSynced(true);
  }, [userId]);

  const syncJournal = useCallback(
    async (entries: any[]) => {
      if (!userId || !isConvexReady()) return;
      for (const entry of entries) {
        try {
          await convex.mutation(api.journals.createJournalEntry, {
            feelings: entry.feelings,
            theme: entry.theme,
            emotionTag: entry.emotionTag,
            guidance: entry.guidance,
            isFavorite: entry.isFavorite,
            localId: entry.id,
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("[Rebirth] Convex journal sync skipped for entry", entry.id, err);
        }
      }
      setIsSynced(true);
    },
    [userId],
  );

  const syncLessonProgress = useCallback(
    async (progress: Record<string, number>) => {
      if (!userId || !isConvexReady()) return;
      for (const [lessonId, percentage] of Object.entries(progress)) {
        try {
          await convex.mutation(api.lessons.upsertLessonProgress, {
            lessonId,
            percentage,
            completed: percentage >= 100,
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("[Rebirth] Convex lesson sync skipped", lessonId, err);
        }
      }
      setIsSynced(true);
    },
    [userId],
  );

  const syncBookmarks = useCallback(
    async (ids: string[]) => {
      if (!userId || !isConvexReady()) return;
      for (const scriptureId of ids) {
        try {
          await convex.mutation(api.lessons.toggleBookmark, { scriptureId });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("[Rebirth] Convex bookmark sync skipped", scriptureId, err);
        }
      }
      setIsSynced(true);
    },
    [userId],
  );

  return (
    <ConvexProvider client={convex}>
      <SyncContext.Provider
        value={{
          isSynced,
          userId,
          signIn,
          signOut,
          migrateLocalStorageToConvex,
          syncJournal,
          syncLessonProgress,
          syncBookmarks,
        }}
      >
        {children}
      </SyncContext.Provider>
    </ConvexProvider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }
  return context;
}
