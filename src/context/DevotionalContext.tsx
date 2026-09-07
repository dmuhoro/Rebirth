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

const STORAGE_KEYS = {
  JOURNAL: "selah_devotional_journal_v1",
  COMPLETED_LESSONS: "selah_completed_lessons_v1",
  BOOKMARKS: "selah_scripture_bookmarks_v1",
  FAVORITES: "selah_favorite_prayers_v1",
  SPEECH_RATE: "selah_speech_rate_v1",
};

const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "entry-seed-1",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    feelings:
      "Feeling completely overwhelmed by ministry duties and work pressure. My mind feels constantly hurried, and I find myself reading the Bible like a task checklist rather than resting in His presence.",
    theme: "spiritual_strength",
    emotionTag: "Weary & Depleted",
    guidance: {
      pastoralCounsel:
        "The hurry of the modern mind is one of the enemy's most subtle weapons. When spiritual exhaustion sets in, our default reaction is usually to redouble human striving. Yet God speaks to tired exiles in Isaiah 40:29: 'He gives power to the faint, and to him who has no might He increases strength.' Remember the Hebrew concept of 'Qavah'—not frantic self-improvement, but the intentional braiding of your depleted strength into the infinite eternity of God. You do not need to perform for the Father; you are invited to sit under the shadow of His wings.",
      scriptures: [
        {
          reference: "Isaiah 40:29-31",
          text: "He gives power to the faint, and to him who has no might he increases strength... but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.",
          theologicalContext:
            "Waiting on the Lord is an active exchange: surrendering finite exhaustion to receive His inexhaustible Spirit.",
        },
        {
          reference: "Matthew 11:28-30",
          text: "Come to me, all who labor and are heavy laden, and I will give you rest. Take my yoke upon you, and learn from me, for I am gentle and lowly in heart, and you will find rest for your souls.",
          theologicalContext:
            "Christ's yoke is light because He shoulders the weight with us. Rest is found in His person, not in our ideal conditions.",
        },
      ],
      customPrayer:
        "Heavenly Father, I confess that my soul has been running ahead of Your Spirit. Forgive me for confusing my busy activity with true spiritual fruitfulness. Today, I set down the heavy burden of trying to sustain myself. Lord Jesus, You are gentle and lowly of heart. I step into Your yoke. Fill the empty wells of my soul with Your living water, and teach me the peace of abiding in You. Amen.",
      breathPrayer: "Inhale: Lord Jesus, gentle and lowly... Exhale: I lay down my burden and receive Your rest.",
      isAIGenerated: false,
    },
    isFavorite: true,
  },
];

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
  bookmarkedScriptureIds: string[];
  favoriteEntryIds: string[];

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

  // Persistence State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load journal entries from localStorage:", e);
    }
    return INITIAL_JOURNAL_ENTRIES;
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

  const [bookmarkedScriptureIds, setBookmarkedScriptureIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load bookmarks from localStorage:", e);
    }
    return ["study-isaiah-40", "study-colossians-1"];
  });

  const [favoriteEntryIds, setFavoriteEntryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load favorites from localStorage:", e);
    }
    return ["entry-seed-1"];
  });

  // Sync to localStorage
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
  }, []);

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
        bookmarkedScriptureIds,
        favoriteEntryIds,
        addJournalEntry,
        deleteJournalEntry,
        toggleFavoriteEntry,
        markLessonComplete,
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
