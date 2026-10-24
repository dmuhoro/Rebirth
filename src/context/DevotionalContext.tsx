import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  ActiveAudioTrack,
  JournalEntry,
  PlaybackState,
  TheologicalTheme,
} from "../types";
import { speechService, SpeechProgress } from "../services/speechService";
import {
  filterBackupJournalData,
  type BackupLocalData,
} from "../lib/backup";

const STORAGE_KEYS = {
  JOURNAL: "selah_devotional_journal_v1",
  COMPLETED_LESSONS: "selah_completed_lessons_v1",
  LESSON_PROGRESS: "selah_lesson_progress_v1",
  BOOKMARKS: "selah_scripture_bookmarks_v1",
  FAVORITES: "selah_favorite_prayers_v1",
  SPEECH_RATE: "selah_speech_rate_v1",
  DELETED_JOURNAL_IDS: "rebirth_deleted_journal_ids_v1",
  DELETED_BEFORE: "rebirth_deleted_before_v1",
};

interface DevotionalContextType {
  // Audio state
  activeTrack: ActiveAudioTrack | null;
  playbackState: PlaybackState;
  playbackSpeed: number;
  progress: SpeechProgress | null;
  playTrack: (track: ActiveAudioTrack) => void;
  togglePlayPause: () => void;
  stopAudio: () => void;
  setSpeed: (speed: number) => void;
  skipForward: () => void;
  skipBackward: () => void;

  // Persistent storage state
  journalEntries: JournalEntry[];
  completedLessonIds: string[];
  lessonProgress: Record<string, number>;
  bookmarkedScriptureIds: string[];
  favoriteEntryIds: string[];
  deletedJournalIds: string[];
  deletedBefore: number | null;
  localDataResetToken: number;
  mergeCloudData: (
    entries: JournalEntry[],
    progress: Record<string, number>,
    bookmarks: string[],
    deletedIds?: string[],
    deletedBefore?: number | null,
  ) => void;
  restoreLocalBackup: (
    backup: BackupLocalData,
    cloudDeletedBefore?: number | null,
    cloudDeletedIds?: string[],
  ) => void;
  clearLocalData: (deletedBefore: number) => void;

  // Mutations
  addJournalEntry: (
    feelings: string,
    theme: TheologicalTheme | "general",
    emotionTag: string,
    guidance: JournalEntry["guidance"]
  ) => JournalEntry;
  deleteJournalEntry: (id: string) => void;
  toggleFavoriteEntry: (id: string) => void;
  markLessonComplete: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, percentage: number) => void;
  getLessonProgress: (lessonId: string) => number;
  toggleBookmarkScripture: (scriptureId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  isScriptureBookmarked: (scriptureId: string) => boolean;
}

const DevotionalContext = createContext<DevotionalContextType | undefined>(undefined);

export function DevotionalProvider({ children }: { children: ReactNode }) {
  // Audio Player State
  const [activeTrack, setActiveTrack] = useState<ActiveAudioTrack | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [playbackSpeed, setPlaybackSpeedState] = useState<number>(1.0);
  const [progress, setProgress] = useState<SpeechProgress | null>(null);
  const [localDataResetToken, setLocalDataResetToken] = useState(0);

  // Persistence State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      if (saved) {
        return (JSON.parse(saved) as JournalEntry[]).filter(
          (entry) => entry.id !== "entry-seed-1",
        );
      }
    } catch (e) {
      console.warn("Failed to load journal entries from localStorage:", e);
    }
    return [];
  });

  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load completed lessons from localStorage:", e);
    }
    return [];
  });

  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load lesson progress from localStorage:", e);
    }
    return {};
  });

  const [bookmarkedScriptureIds, setBookmarkedScriptureIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load bookmarks from localStorage:", e);
    }
    return [];
  });

  const [favoriteEntryIds, setFavoriteEntryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) {
        const favorites: unknown = JSON.parse(saved);
        if (Array.isArray(favorites)) {
          return favorites.filter(
            (id): id is string => typeof id === "string" && id !== "entry-seed-1",
          );
        }
      }
    } catch (e) {
      console.warn("Failed to load favorites from localStorage:", e);
    }
    return [];
  });

  const [deletedJournalIds, setDeletedJournalIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_JOURNAL_IDS);
      if (saved) {
        return [...new Set([...JSON.parse(saved), "entry-seed-1"])];
      }
    } catch (e) {
      console.warn("Failed to load deleted journal IDs from localStorage:", e);
    }
    return ["entry-seed-1"];
  });
  const [deletedBefore, setDeletedBefore] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELETED_BEFORE);
      if (saved === null) return null;
      const value = Number(saved);
      return Number.isFinite(value) ? value : null;
    } catch (e) {
      console.warn("Failed to load the local deletion marker:", e);
      return null;
    }
  });

  // Persist private device data locally until the user requests a cloud backup.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));
    } catch (e) {
      console.warn("Error saving journal to localStorage:", e);
    }
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(completedLessonIds));
    } catch (e) {
      console.warn("Error saving completed lessons to localStorage:", e);
    }
  }, [completedLessonIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(lessonProgress));
    } catch (e) {
      console.warn("Error saving lesson progress to localStorage:", e);
    }
  }, [lessonProgress]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedScriptureIds));
    } catch (e) {
      console.warn("Error saving bookmarks to localStorage:", e);
    }
  }, [bookmarkedScriptureIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteEntryIds));
    } catch (e) {
      console.warn("Error saving favorites to localStorage:", e);
    }
  }, [favoriteEntryIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DELETED_JOURNAL_IDS,
        JSON.stringify(deletedJournalIds),
      );
    } catch (e) {
      console.warn("Error saving deleted journal IDs to localStorage:", e);
    }
  }, [deletedJournalIds]);

  useEffect(() => {
    try {
      if (deletedBefore === null) {
        localStorage.removeItem(STORAGE_KEYS.DELETED_BEFORE);
      } else {
        localStorage.setItem(
          STORAGE_KEYS.DELETED_BEFORE,
          String(deletedBefore),
        );
      }
    } catch (e) {
      console.warn("Error saving the local deletion marker:", e);
    }
  }, [deletedBefore]);

  // Load saved speech rate
  useEffect(() => {
    try {
      const savedRate = localStorage.getItem(STORAGE_KEYS.SPEECH_RATE);
      if (savedRate) {
        const parsed = parseFloat(savedRate);
        if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
          setPlaybackSpeedState(parsed);
          speechService.setRate(parsed);
        }
      }
    } catch (e) {
      console.warn("Error loading speech rate:", e);
    }
  }, []);

  const playTrack = useCallback((track: ActiveAudioTrack) => {
    setActiveTrack(track);
    setProgress(null);
    setPlaybackState("playing");

    speechService.speak(
      track.fullText,
      (prog) => {
        setProgress(prog);
        // If track is a lesson, update progress dynamically
        setLessonProgress((prev) => {
          const current = prev[track.id] || 0;
          if (prog.percentage > current) {
            return { ...prev, [track.id]: prog.percentage };
          }
          return prev;
        });
      },
      (isPlaying, isPaused) => {
        if (isPaused) {
          setPlaybackState("paused");
        } else if (isPlaying) {
          setPlaybackState("playing");
        } else {
          setPlaybackState("idle");
        }
      },
      () => {
        setPlaybackState("idle");
        setProgress((prev) => (prev ? { ...prev, percentage: 100 } : null));
        // Mark lesson as completed on finish
        setLessonProgress((prev) => ({ ...prev, [track.id]: 100 }));
        setCompletedLessonIds((prev) => {
          if (prev.includes(track.id)) return prev;
          return [...prev, track.id];
        });
      }
    );
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!activeTrack) return;
    if (playbackState === "playing") {
      speechService.pause();
      setPlaybackState("paused");
    } else if (playbackState === "paused") {
      speechService.resume();
      setPlaybackState("playing");
    } else {
      playTrack(activeTrack);
    }
  }, [activeTrack, playbackState, playTrack]);

  const stopAudio = useCallback(() => {
    speechService.stop();
    setPlaybackState("idle");
    setProgress(null);
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    setPlaybackSpeedState(newSpeed);
    speechService.setRate(newSpeed);
    try {
      localStorage.setItem(STORAGE_KEYS.SPEECH_RATE, newSpeed.toString());
    } catch (e) {
      console.warn("Error saving speech rate:", e);
    }
  }, []);

  const skipForward = useCallback(() => {
    speechService.skipForward();
  }, []);

  const skipBackward = useCallback(() => {
    speechService.skipBackward();
  }, []);

  const addJournalEntry = useCallback(
    (
      feelings: string,
      theme: TheologicalTheme | "general",
      emotionTag: string,
      guidance: JournalEntry["guidance"]
    ): JournalEntry => {
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        feelings,
        theme,
        emotionTag,
        guidance,
        isFavorite: false,
      };

      setJournalEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    []
  );

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
    setFavoriteEntryIds((prev) => prev.filter((fid) => fid !== id));
    setDeletedJournalIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const toggleFavoriteEntry = useCallback((id: string) => {
    setFavoriteEntryIds((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
    setJournalEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e))
    );
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      return [...prev, lessonId];
    });
    setLessonProgress((prev) => ({ ...prev, [lessonId]: 100 }));
  }, []);

  const updateLessonProgress = useCallback((lessonId: string, percentage: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    setLessonProgress((prev) => ({ ...prev, [lessonId]: clamped }));
    if (clamped === 100) {
      setCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    }
  }, []);

  const getLessonProgress = useCallback(
    (lessonId: string) => {
      if (completedLessonIds.includes(lessonId)) return 100;
      return lessonProgress[lessonId] || 0;
    },
    [completedLessonIds, lessonProgress]
  );

  const toggleBookmarkScripture = useCallback((scriptureId: string) => {
    setBookmarkedScriptureIds((prev) => {
      const exists = prev.includes(scriptureId);
      return exists ? prev.filter((id) => id !== scriptureId) : [...prev, scriptureId];
    });
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessonIds.includes(lessonId),
    [completedLessonIds]
  );

  const isScriptureBookmarked = useCallback(
    (scriptureId: string) => bookmarkedScriptureIds.includes(scriptureId),
    [bookmarkedScriptureIds]
  );

  const mergeCloudData = useCallback(
    (
      cloudEntries: JournalEntry[],
      cloudProgress: Record<string, number>,
      cloudBookmarks: string[],
      cloudDeletedIds: string[] = [],
      cloudDeletedBefore: number | null = null,
    ) => {
      const effectiveDeletedBefore =
        deletedBefore === null
          ? cloudDeletedBefore
          : cloudDeletedBefore === null
            ? deletedBefore
            : Math.max(deletedBefore, cloudDeletedBefore);
      const staleLocalIds =
        effectiveDeletedBefore === null
          ? []
          : journalEntries
              .filter((entry) => entry.timestamp <= effectiveDeletedBefore)
              .map((entry) => entry.id);
      const deletedIds = new Set([
        ...deletedJournalIds,
        ...cloudDeletedIds,
        ...staleLocalIds,
      ]);
      setDeletedJournalIds([...deletedIds]);
      if (effectiveDeletedBefore !== null) {
        setDeletedBefore(effectiveDeletedBefore);
      }
      setJournalEntries((localEntries) => {
        const merged = new Map<string, JournalEntry>();
        for (const entry of localEntries) {
          if (!deletedIds.has(entry.id)) merged.set(entry.id, entry);
        }
        for (const entry of cloudEntries) {
          if (deletedIds.has(entry.id)) continue;
          merged.set(entry.id, entry);
        }
        return [...merged.values()].sort((a, b) => b.timestamp - a.timestamp);
      });
      setLessonProgress((localProgress) => {
        const merged = { ...localProgress };
        for (const [lessonId, percentage] of Object.entries(cloudProgress)) {
          merged[lessonId] = Math.max(merged[lessonId] ?? 0, percentage);
        }
        return merged;
      });
      setCompletedLessonIds((localCompleted) => {
        const cloudCompleted = Object.entries(cloudProgress)
            .filter(([, percentage]) => percentage >= 100)
            .map(([lessonId]) => lessonId);
        return [...new Set([...localCompleted, ...cloudCompleted])];
      });
      setBookmarkedScriptureIds((localBookmarks) => [
        ...new Set([...localBookmarks, ...cloudBookmarks]),
      ]);
      setFavoriteEntryIds((localFavorites) => [
        ...new Set(
          [...localFavorites, ...cloudEntries.filter((entry) => entry.isFavorite).map((entry) => entry.id)]
            .filter((id) => !deletedIds.has(id)),
        ),
      ]);
    },
    [deletedBefore, deletedJournalIds, journalEntries],
  );

  const restoreLocalBackup = useCallback(
    (
      backup: BackupLocalData,
      cloudDeletedBefore: number | null = null,
      cloudDeletedIds: string[] = [],
    ) => {
      const effectiveDeletedBefore = [
        deletedBefore,
        backup.deletedBefore,
        cloudDeletedBefore,
      ].reduce<number | null>(
        (latest, value) =>
          value === null ? latest : latest === null ? value : Math.max(latest, value),
        null,
      );
      const filteredBackup = filterBackupJournalData(
        backup.journalEntries,
        [...deletedJournalIds, ...backup.deletedJournalIds],
        cloudDeletedIds,
        effectiveDeletedBefore,
      );
      mergeCloudData(
        filteredBackup.journalEntries,
        backup.lessonProgress,
        backup.bookmarkedScriptureIds,
        filteredBackup.deletedJournalIds,
        effectiveDeletedBefore,
      );
      setCompletedLessonIds((current) => [
        ...new Set([...current, ...backup.completedLessonIds]),
      ]);
      setFavoriteEntryIds((current) => {
        return [
          ...new Set([...current, ...backup.favoriteEntryIds]),
        ].filter((id) => !filteredBackup.deletedJournalIds.includes(id));
      });
      setPlaybackSpeedState(backup.speechRate);
      speechService.setRate(backup.speechRate);
    },
    [deletedBefore, deletedJournalIds, mergeCloudData],
  );

  const clearLocalData = useCallback((deletionTime: number) => {
    for (const key of Object.values(STORAGE_KEYS).filter(
      (key) => key !== STORAGE_KEYS.DELETED_BEFORE,
    )) {
      localStorage.removeItem(key);
    }
    localStorage.setItem(STORAGE_KEYS.DELETED_BEFORE, String(deletionTime));
    speechService.stop();
    setActiveTrack(null);
    setPlaybackState("idle");
    setProgress(null);
    setPlaybackSpeedState(1);
    setJournalEntries([]);
    setCompletedLessonIds([]);
    setLessonProgress({});
    setBookmarkedScriptureIds([]);
    setFavoriteEntryIds([]);
    setDeletedJournalIds([]);
    setDeletedBefore(deletionTime);
    setLocalDataResetToken((current) => current + 1);
  }, []);

  return (
    <DevotionalContext.Provider
      value={{
        activeTrack,
        playbackState,
        playbackSpeed,
        progress,
        playTrack,
        togglePlayPause,
        stopAudio,
        setSpeed,
        skipForward,
        skipBackward,
        journalEntries,
        completedLessonIds,
        lessonProgress,
        bookmarkedScriptureIds,
        favoriteEntryIds,
        deletedJournalIds,
        deletedBefore,
        localDataResetToken,
        mergeCloudData,
        restoreLocalBackup,
        clearLocalData,
        addJournalEntry,
        deleteJournalEntry,
        toggleFavoriteEntry,
        markLessonComplete,
        updateLessonProgress,
        getLessonProgress,
        toggleBookmarkScripture,
        isLessonCompleted,
        isScriptureBookmarked,
      }}
    >
      {children}
    </DevotionalContext.Provider>
  );
}

export function useDevotional() {
  const context = useContext(DevotionalContext);
  if (!context) {
    throw new Error("useDevotional must be used within a DevotionalProvider");
  }
  return context;
}
