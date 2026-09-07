export type TheologicalTheme =
  | "spiritual_strength"
  | "repentance_transformation"
  | "divinity_of_christ";

export interface ScriptureAnchor {
  reference: string;
  text: string;
  note: string;
}

export interface LessonSection {
  title: string;
  paragraphs: string[];
  scriptureReference?: string;
}

export interface Lesson {
  id: string;
  theme: TheologicalTheme;
  themeLabel: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  scriptureAnchors: ScriptureAnchor[];
  theologicalVoice: {
    name: string;
    era: string;
    quote: string;
  };
  sections: LessonSection[];
  contemplativeExercise: {
    prompt: string;
    breathPrayer: string;
    actionStep: string;
  };
  audioNarrationText: string;
}

export interface OriginalLanguageInsight {
  term: string;
  language: "Hebrew" | "Greek";
  transliteration: string;
  definition: string;
  theologicalSignificance: string;
}

export interface ScriptureStudy {
  id: string;
  theme: TheologicalTheme;
  title: string;
  reference: string;
  fullText: string;
  historicalContext: string;
  originalLanguageInsights: OriginalLanguageInsight[];
  exegesis: string;
  christologicalBridge: string;
  prayerfulResponse: string;
}

export interface AIGeneratedGuidance {
  pastoralCounsel: string;
  scriptures: Array<{
    reference: string;
    text: string;
    theologicalContext: string;
  }>;
  customPrayer: string;
  breathPrayer: string;
  isAIGenerated?: boolean;
  note?: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  feelings: string;
  theme: TheologicalTheme | "general";
  emotionTag: string;
  guidance: AIGeneratedGuidance;
  isFavorite?: boolean;
}

export interface ActiveAudioTrack {
  id: string;
  title: string;
  subtitle: string;
  theme: TheologicalTheme | "prayer" | "scripture";
  fullText: string;
  estimatedDuration: string;
}

export type PlaybackState = "idle" | "playing" | "paused";
