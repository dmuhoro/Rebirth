import { useEffect, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useDevotional } from "../context/DevotionalContext";
import { useSync } from "../lib/sync";
import { enableWebPush, removeWebPushSubscription } from "../lib/webPush";
import {
  createBackup,
  downloadTextFile,
  parseBackupJson,
  serializeBackupJson,
  serializeBackupMarkdown,
} from "../lib/backup";
import type { JournalEntry, TheologicalTheme } from "../types";

interface SyncAccountViewProps {
  onClose: () => void;
  onOpenSignIn: () => void;
}

function isTheologicalTheme(value: string): value is TheologicalTheme {
  return [
    "spiritual_strength",
    "repentance_transformation",
    "divinity_of_christ",
  ].includes(value);
}

export function SyncAccountView({
  onClose,
  onOpenSignIn,
}: SyncAccountViewProps) {
  const {
    isAuthenticated,
    isLoading,
    userId,
    migrateLocalStorageToConvex,
  } = useSync();
  const {
    journalEntries,
    lessonProgress,
    completedLessonIds,
    bookmarkedScriptureIds,
    favoriteEntryIds,
    mergeCloudData,
    deletedJournalIds,
    restoreLocalBackup,
    clearLocalData,
    playbackSpeed,
    deletedBefore,
  } = useDevotional();
  const { signOut } = useAuthActions();
  const savePushSubscription = useMutation(api.push.saveSubscription);
  const sendTestNotification = useAction(
    api.pushActions.sendTestNotification,
  );
  const deleteMyData = useAction(api.sync.deleteMyData);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPushWorking, setIsPushWorking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const backupFileInput = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const cloudSnapshot = useQuery(
    api.sync.getCloudSnapshot,
    isAuthenticated ? {} : "skip",
  );

  // Modal behavior: focus moves in on open, Escape closes, Tab stays inside,
  // and focus returns to the trigger on close.
  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  const importLocalData = async () => {
    setError(null);
    setResult(null);
    setIsMigrating(true);
    try {
      const imported = await migrateLocalStorageToConvex({
        journalEntries,
        lessonProgress,
        completedLessonIds,
        bookmarkedScriptureIds,
        deletedJournalIds,
      });
      setResult(
        `Backup complete: imported ${imported.importedJournals} journal entries, ${imported.importedProgress} progress records, and ${imported.importedBookmarks} bookmarks; applied ${imported.deletedJournals} journal deletions. Existing cloud records were preserved.`,
      );
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error("Local data import failed:", cause);
      setError("Import did not complete. Your local data is unchanged; retry to continue.");
    } finally {
      setIsMigrating(false);
    }
  };

  const restoreCloudData = () => {
    if (!cloudSnapshot) return;
    setError(null);
    setResult(null);
    setIsRestoring(true);
    try {
      const entries: JournalEntry[] = cloudSnapshot.journalEntries.map(
        (entry) => ({
          id: entry.localId ?? entry._id,
          timestamp: entry.createdAt,
          feelings: entry.feelings,
          theme: isTheologicalTheme(entry.theme) ? entry.theme : "general",
          emotionTag: entry.emotionTag,
          guidance: entry.guidance,
          isFavorite: entry.isFavorite ?? false,
        }),
      );
      const progress = Object.fromEntries(
        cloudSnapshot.lessonProgress.map((record) => [
          record.lessonId,
          record.percentage,
        ]),
      );
      const bookmarks = cloudSnapshot.bookmarks.map(
        (bookmark) => bookmark.scriptureId,
      );
      mergeCloudData(
        entries,
        progress,
        bookmarks,
        cloudSnapshot.deletedJournalIds,
        cloudSnapshot.deletedBefore,
      );
      setResult(
        `Restored ${entries.length} journal entries, ${Object.keys(progress).length} progress records, and ${bookmarks.length} bookmarks. Local records were preserved.`,
      );
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error("Cloud data restore failed:", cause);
      setError("Cloud data could not be restored. Local data is unchanged.");
    } finally {
      setIsRestoring(false);
    }
  };

  const exportBackup = (format: "json" | "markdown") => {
    setError(null);
    setResult(null);
    if (isAuthenticated && !cloudSnapshot) {
      setError("Cloud backup data is still loading. Please try again shortly.");
      return;
    }
    try {
      const cloudEntries =
        cloudSnapshot?.journalEntries.map((entry) => ({
          id: entry.localId ?? entry._id,
          timestamp: entry.createdAt,
          feelings: entry.feelings,
          theme: isTheologicalTheme(entry.theme) ? entry.theme : "general" as const,
          emotionTag: entry.emotionTag,
          guidance: entry.guidance,
          isFavorite: entry.isFavorite ?? false,
        })) ?? [];
      const cloudProgress =
        cloudSnapshot?.lessonProgress.reduce<Record<string, number>>(
          (progress, record) => {
            progress[record.lessonId] = record.percentage;
            return progress;
          },
          {},
        ) ?? {};
      const mergedLessonProgress = { ...lessonProgress };
      for (const lessonId of Object.keys(cloudProgress)) {
        mergedLessonProgress[lessonId] = Math.max(
          mergedLessonProgress[lessonId] ?? 0,
          cloudProgress[lessonId],
        );
      }
      const backupDeletedBefore =
        deletedBefore === null
          ? cloudSnapshot?.deletedBefore ?? null
          : cloudSnapshot?.deletedBefore === null ||
              cloudSnapshot?.deletedBefore === undefined
            ? deletedBefore
            : Math.max(deletedBefore, cloudSnapshot.deletedBefore);
      const localData = {
        journalEntries: [
          ...new Map(
            [...journalEntries, ...cloudEntries].map((entry) => [
              entry.id,
              entry,
            ]),
          ).values(),
        ].filter(
          (entry) =>
            !deletedJournalIds.includes(entry.id) &&
            (backupDeletedBefore === null ||
              entry.timestamp > backupDeletedBefore),
        ),
        completedLessonIds: [
          ...new Set([
            ...completedLessonIds,
            ...Object.keys(cloudProgress).filter(
              (lessonId) => cloudProgress[lessonId] >= 100,
            ),
          ]),
        ],
        lessonProgress: mergedLessonProgress,
        bookmarkedScriptureIds: [
          ...new Set([
            ...bookmarkedScriptureIds,
            ...(cloudSnapshot?.bookmarks.map(
              (bookmark) => bookmark.scriptureId,
            ) ?? []),
          ]),
        ],
        favoriteEntryIds: [
          ...new Set([
            ...favoriteEntryIds,
            ...cloudEntries
              .filter((entry) => entry.isFavorite)
              .map((entry) => entry.id),
          ]),
        ].filter((id) => !deletedJournalIds.includes(id)),
        deletedJournalIds: [
          ...new Set([
            ...deletedJournalIds,
            ...(cloudSnapshot?.deletedJournalIds ?? []),
          ]),
        ],
        deletedBefore: backupDeletedBefore,
        speechRate: playbackSpeed,
      };
      const backup = createBackup(
        localData,
        cloudSnapshot ? { ...cloudSnapshot } : null,
      );
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (format === "json") {
        downloadTextFile(
          `rebirth-backup-${timestamp}.json`,
          serializeBackupJson(backup),
          "application/json",
        );
      } else {
        downloadTextFile(
          `rebirth-backup-${timestamp}.md`,
          serializeBackupMarkdown(backup),
          "text/markdown",
        );
      }
      setResult(`${format.toUpperCase()} backup downloaded.`);
    } catch (cause) {
      console.error("Backup export failed:", cause);
      setError("Backup could not be exported. Your saved data is unchanged.");
    }
  };

  const importBackupFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setResult(null);
    if (isAuthenticated && !cloudSnapshot) {
      setError("Cloud deletion protections are still loading. Please try again shortly.");
      return;
    }
    try {
      const backup = parseBackupJson(await file.text());
      restoreLocalBackup(
        backup.localData,
        cloudSnapshot?.deletedBefore,
        cloudSnapshot?.deletedJournalIds,
      );
      setResult(
        "Backup restored to this device. Cloud records were not changed; choose Import local data to cloud if you want to copy supported records.",
      );
    } catch (cause) {
      console.error("Backup import failed:", cause);
      setError("This file is not a valid Rebirth JSON backup. No data was changed.");
    }
  };

  const handleDeleteMyData = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setError(null);
    setResult(null);
    setIsDeleting(true);
    try {
      let deletionTime = Date.now();
      if (isAuthenticated) {
        const deletion = await deleteMyData({});
        deletionTime = deletion.deletedBefore;
      }
      await removeWebPushSubscription();
      clearLocalData(deletionTime);
      setConfirmingDelete(false);
      setDeleteConfirmation("");
      setResult(
        isAuthenticated
          ? "Your devotional data was deleted from this device and your cloud account. Your sign-in account remains; a minimal deletion timestamp is retained to prevent old journal backups from being restored."
          : "Your devotional data was deleted from this device.",
      );
    } catch (cause) {
      console.error("Data deletion failed:", cause);
      setError(
        "Data deletion could not be completed. Any local data not yet removed remains available; retry when connected.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    try {
      await signOut();
      onClose();
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error("Sign-out failed:", cause);
      setError("Sign-out failed. Please try again.");
    }
  };

  const enableNotifications = async () => {
    setError(null);
    setResult(null);
    setIsPushWorking(true);
    try {
      await enableWebPush(savePushSubscription);
      setResult("Push notifications are enabled on this device.");
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error("Push notification setup failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "Notifications could not be enabled. Please try again.",
      );
    } finally {
      setIsPushWorking(false);
    }
  };

  const sendTest = async () => {
    setError(null);
    setResult(null);
    setIsPushWorking(true);
    try {
      const response = await sendTestNotification({});
      setResult(`Test notification sent to ${response.delivered} device(s).`);
    } catch (cause) {
      // eslint-disable-next-line no-console
      console.error("Test notification failed:", cause);
      setError(
        cause instanceof Error
          ? cause.message
          : "The test notification could not be sent.",
      );
    } finally {
      setIsPushWorking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        aria-describedby="account-description"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md space-y-5 overflow-y-auto rounded-2xl border border-[#353023] bg-[#11141a] p-5 text-[#f7f4ec] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="account-title" className="text-lg font-semibold">
              Account &amp; manual backup
            </h2>
            <p id="account-description" className="mt-1 text-sm text-[#b8b3a4]">
              {isLoading
                ? "Checking account status…"
                : isAuthenticated
                  ? "Cloud backup is available when you choose to import or restore."
                  : "Guest data stays on this device. Sign in to access manual backup and restore."}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close account panel"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 py-1 text-[#b8b3a4] hover:bg-white/10"
          >
            ×
          </button>
        </div>

        {isAuthenticated ? (
          <>
            <div className="rounded-xl border border-[#252c3c] bg-[#0c0e12] p-3 text-xs text-[#b8b3a4]">
              {userId ? "Account connected." : "Loading account…"}
              <p className="mt-1">
                Backup and restore are manual copies. New local changes are not
                uploaded unless you choose to import them. Signing out does not
                delete data.
              </p>
            </div>
            <button
              type="button"
              onClick={importLocalData}
              disabled={isMigrating || isLoading || !userId}
              className="w-full rounded-xl bg-[#d4af37] px-4 py-3 font-semibold text-[#0c0e12] hover:bg-[#e5c158] disabled:opacity-50"
            >
              {isMigrating ? "Importing local data…" : "Import local data to cloud"}
            </button>
            <button
              type="button"
              onClick={restoreCloudData}
              disabled={isRestoring || isLoading || !cloudSnapshot}
              className="w-full rounded-xl border border-[#d4af37]/40 px-4 py-3 text-sm text-[#e5c158] hover:bg-[#d4af37]/10 disabled:opacity-50"
            >
              {isRestoring ? "Restoring cloud data…" : "Restore cloud data to this device"}
            </button>
            <div className="space-y-2 rounded-xl border border-[#252c3c] p-3">
              <h3 className="text-sm font-medium">Device notifications</h3>
              <p className="text-xs text-[#b8b3a4]">
                Opt in on each device, then send a test notification to verify
                background delivery.
              </p>
              <button
                type="button"
                onClick={enableNotifications}
                disabled={isPushWorking || !userId}
                className="w-full rounded-lg border border-[#d4af37]/40 px-3 py-2 text-sm text-[#e5c158] hover:bg-[#d4af37]/10 disabled:opacity-50"
              >
                {isPushWorking ? "Working…" : "Enable notifications on this device"}
              </button>
              <button
                type="button"
                onClick={sendTest}
                disabled={isPushWorking || !userId}
                className="w-full rounded-lg border border-[#252c3c] px-3 py-2 text-sm text-[#b8b3a4] hover:border-[#c5c0b0] disabled:opacity-50"
              >
                Send test notification
              </button>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl border border-[#252c3c] px-4 py-2 text-sm text-[#b8b3a4] hover:border-[#c5c0b0]"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onOpenSignIn}
            className="w-full rounded-xl bg-[#d4af37] px-4 py-3 font-semibold text-[#0c0e12] hover:bg-[#e5c158]"
          >
            Sign in for manual backup and restore
          </button>
        )}

        <section className="space-y-3 rounded-xl border border-[#252c3c] p-3">
          <div>
            <h3 className="text-sm font-medium">Your backup files</h3>
            <p className="mt-1 text-xs text-[#b8b3a4]">
              Exports include this device&apos;s data and, when signed in, your
              available cloud records. JSON can be restored to this device.
              Export files contain private reflections; store them securely.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => exportBackup("json")}
              disabled={isAuthenticated && !cloudSnapshot}
              className="min-h-11 rounded-lg border border-[#d4af37]/40 px-2 text-sm text-[#e5c158] hover:bg-[#d4af37]/10 disabled:opacity-50"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => exportBackup("markdown")}
              disabled={isAuthenticated && !cloudSnapshot}
              className="min-h-11 rounded-lg border border-[#d4af37]/40 px-2 text-sm text-[#e5c158] hover:bg-[#d4af37]/10 disabled:opacity-50"
            >
              Export Markdown
            </button>
          </div>
          <input
            ref={backupFileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            disabled={isAuthenticated && !cloudSnapshot}
            onChange={(event) => {
              void importBackupFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => backupFileInput.current?.click()}
            disabled={isAuthenticated && !cloudSnapshot}
            className="min-h-11 w-full rounded-lg border border-[#252c3c] px-3 py-2 text-sm text-[#b8b3a4] hover:border-[#c5c0b0] disabled:opacity-50"
          >
            Restore a JSON backup to this device
          </button>
          <p className="text-xs text-[#b8b3a4]">
            Restore merges journal entries, bookmarks, and progress with this
            device&apos;s records and honors known deletion markers. Cloud-only
            account records in the archive are retained for reference, not
            restored by this device import. It does not upload anything to the
            cloud.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-red-900/60 bg-red-950/20 p-3">
          <div>
            <h3 className="text-sm font-medium text-red-200">Delete my data</h3>
            <p className="mt-1 text-xs text-[#c9b8b8]">
              This permanently removes saved devotional data from this device
              and, when signed in, your cloud account. It does not sign you out
              or delete your sign-in account. A minimal cloud timestamp is kept
              to prevent old journal backups from being re-imported.
            </p>
          </div>
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setConfirmingDelete(true);
              }}
              className="min-h-11 w-full rounded-lg border border-red-500/50 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
            >
              Delete my data…
            </button>
          ) : (
            <div className="space-y-2" role="alertdialog" aria-labelledby="delete-data-title">
              <p id="delete-data-title" className="text-sm font-medium text-red-100">
                This cannot be undone. Export a backup first if you may need it.
                Type DELETE to confirm.
              </p>
              <label className="block text-xs text-[#c9b8b8]">
                Confirmation
                <input
                  type="text"
                  autoComplete="off"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-red-900 bg-[#0c0e12] px-3 text-sm text-[#f7f4ec]"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setDeleteConfirmation("");
                  }}
                  disabled={isDeleting}
                  className="min-h-11 rounded-lg border border-[#252c3c] px-3 text-sm text-[#b8b3a4]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteMyData()}
                  disabled={isDeleting || deleteConfirmation !== "DELETE"}
                  className="min-h-11 rounded-lg bg-red-800 px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Confirm deletion"}
                </button>
              </div>
            </div>
          )}
        </section>

        {result && (
          <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-200">
            {result}
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-900/20 p-3 text-sm text-amber-200">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
