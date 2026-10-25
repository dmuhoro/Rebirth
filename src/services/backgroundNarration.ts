import {
  Capacitor,
  registerPlugin,
  type PluginListenerHandle,
} from "@capacitor/core";
import type { SpeechProgress } from "./speechService";

interface NativeNarrationProgress extends SpeechProgress {
  sessionId: number;
}

interface NativeNarrationState {
  sessionId: number;
  state: "playing" | "paused" | "idle";
  isPaused: boolean;
  ended: boolean;
  error?: string;
}

interface BackgroundNarrationPlugin {
  play(options: {
    text: string;
    title: string;
    subtitle: string;
    rate: number;
    sessionId: number;
  }): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  skipForward(): Promise<void>;
  skipBackward(): Promise<void>;
  setRate(options: { rate: number }): Promise<void>;
  addListener(
    eventName: "progress",
    listener: (event: NativeNarrationProgress) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: "state",
    listener: (event: NativeNarrationState) => void,
  ): Promise<PluginListenerHandle>;
}

export const backgroundNarration =
  registerPlugin<BackgroundNarrationPlugin>("BackgroundNarration");

export function isNativeAndroidNarrationAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}
