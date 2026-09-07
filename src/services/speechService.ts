export interface SpeechProgress {
  currentChunkIndex: number;
  totalChunks: number;
  charIndex: number;
  percentage: number;
  currentSentence: string;
}

export type SpeechCallback = (progress: SpeechProgress) => void;
export type SpeechStateCallback = (isPlaying: boolean, isPaused: boolean) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private chunks: string[] = [];
  private currentChunkIdx = 0;
  private isPlayingState = false;
  private isPausedState = false;
  private rate = 1.0;
  private pitch = 1.0;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private onProgressCallback: SpeechCallback | null = null;
  private onStateCallback: SpeechStateCallback | null = null;
  private onEndedCallback: (() => void) | null = null;
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth?.getVoices() || [];
      if (voices.length > 0 && !this.selectedVoice) {
        // Look for natural English voice, or default
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Natural") ||
                v.name.includes("Google") ||
                v.name.includes("en-US") ||
                v.name.includes("en-GB"))
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        this.selectedVoice = preferred;
        this.initialized = true;
      }
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return (this.synth.getVoices() || []).filter((v) => v.lang.startsWith("en"));
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.selectedVoice = voice;
  }

  public setRate(newRate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, newRate));
    // If currently playing, continue with current rate or restart chunk
  }

  public getRate(): number {
    return this.rate;
  }

  public isAvailable(): boolean {
    return Boolean(this.synth);
  }

  public isPlaying(): boolean {
    return this.isPlayingState && !this.isPausedState;
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  /**
   * Splits long text into natural sentence/paragraph chunks
   * to prevent Android SpeechSynthesis timeout bugs.
   */
  private splitIntoSafeChunks(text: string): string[] {
    const rawChunks = text
      .replace(/\r\n/g, "\n")
      .split(/\n+/)
      .filter((p) => p.trim().length > 0);

    const safeChunks: string[] = [];

    for (const raw of rawChunks) {
      // Split by sentences if paragraph is long
      if (raw.length > 200) {
        const sentences = raw.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [raw];
        for (const s of sentences) {
          const trimmed = s.trim();
          if (trimmed.length > 0) safeChunks.push(trimmed);
        }
      } else {
        safeChunks.push(raw.trim());
      }
    }

    return safeChunks.length > 0 ? safeChunks : [text];
  }

  public speak(
    text: string,
    onProgress?: SpeechCallback,
    onStateChange?: SpeechStateCallback,
    onEnded?: () => void
  ) {
    if (!this.synth) return;

    this.stop();

    this.onProgressCallback = onProgress || null;
    this.onStateCallback = onStateChange || null;
    this.onEndedCallback = onEnded || null;

    this.chunks = this.splitIntoSafeChunks(text);
    this.currentChunkIdx = 0;
    this.isPlayingState = true;
    this.isPausedState = false;

    this.notifyState();
    this.speakCurrentChunk();
  }

  private speakCurrentChunk() {
    if (!this.synth || !this.isPlayingState || this.currentChunkIdx >= this.chunks.length) {
      this.handleFinished();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIdx];
    const utterance = new SpeechSynthesisUtterance(chunkText);
    this.currentUtterance = utterance;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      this.notifyProgress();
    };

    utterance.onboundary = (event) => {
      if (this.onProgressCallback) {
        const percentage = Math.min(
          100,
          Math.round(((this.currentChunkIdx + event.charIndex / (chunkText.length || 1)) / this.chunks.length) * 100)
        );
        this.onProgressCallback({
          currentChunkIndex: this.currentChunkIdx,
          totalChunks: this.chunks.length,
          charIndex: event.charIndex,
          percentage,
          currentSentence: chunkText,
        });
      }
    };

    utterance.onend = () => {
      this.currentChunkIdx++;
      if (this.currentChunkIdx < this.chunks.length && this.isPlayingState) {
        // Small breathing delay between sentences for natural contemplative feel
        setTimeout(() => {
          if (this.isPlayingState && !this.isPausedState) {
            this.speakCurrentChunk();
          }
        }, 320);
      } else {
        this.handleFinished();
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error or cancelled:", e);
      if (this.isPlayingState) {
        this.currentChunkIdx++;
        if (this.currentChunkIdx < this.chunks.length) {
          this.speakCurrentChunk();
        } else {
          this.handleFinished();
        }
      }
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.error("Failed to speak utterance:", err);
      this.handleFinished();
    }
  }

  private notifyProgress() {
    if (this.onProgressCallback && this.chunks.length > 0) {
      const percentage = Math.min(
        100,
        Math.round((this.currentChunkIdx / this.chunks.length) * 100)
      );
      this.onProgressCallback({
        currentChunkIndex: this.currentChunkIdx,
        totalChunks: this.chunks.length,
        charIndex: 0,
        percentage,
        currentSentence: this.chunks[this.currentChunkIdx] || "",
      });
    }
  }

  private notifyState() {
    if (this.onStateCallback) {
      this.onStateCallback(this.isPlayingState, this.isPausedState);
    }
  }

  private handleFinished() {
    this.isPlayingState = false;
    this.isPausedState = false;
    this.currentUtterance = null;
    this.notifyState();
    if (this.onEndedCallback) {
      this.onEndedCallback();
    }
  }

  public pause() {
    if (!this.synth || !this.isPlayingState) return;
    try {
      this.synth.pause();
      this.isPausedState = true;
      this.notifyState();
    } catch (e) {
      console.warn("Pause error:", e);
    }
  }

  public resume() {
    if (!this.synth) return;
    if (this.isPausedState) {
      try {
        this.synth.resume();
        this.isPausedState = false;
        this.notifyState();
      } catch (e) {
        console.warn("Resume error:", e);
      }
    } else if (this.isPlayingState && this.currentChunkIdx < this.chunks.length) {
      this.speakCurrentChunk();
    }
  }

  public stop() {
    if (!this.synth) return;
    try {
      this.isPlayingState = false;
      this.isPausedState = false;
      this.synth.cancel();
      this.currentUtterance = null;
      this.notifyState();
    } catch (e) {
      console.warn("Stop error:", e);
    }
  }

  public skipForward() {
    if (!this.isPlayingState || this.currentChunkIdx >= this.chunks.length - 1) return;
    this.synth?.cancel();
    this.currentChunkIdx = Math.min(this.chunks.length - 1, this.currentChunkIdx + 2);
    this.speakCurrentChunk();
  }

  public skipBackward() {
    if (!this.isPlayingState) return;
    this.synth?.cancel();
    this.currentChunkIdx = Math.max(0, this.currentChunkIdx - 2);
    this.speakCurrentChunk();
  }
}

export const speechService = new SpeechService();
