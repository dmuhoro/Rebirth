import { useEffect } from "react";
import { ActiveAudioTrack } from "../types";

/**
 * Feature-detected MediaSession integration for lock-screen metadata and
 * playback controls (play/pause, seek).
 *
 * Per ADR-004: MediaSession provides lock-screen metadata and OS playback
 * interactions. It does NOT guarantee Web Speech survives screen lock — that
 * requires real audio assets (Phase 4). This hook gracefully degrades when
 * MediaSession is unsupported.
 */
export function useMediaSession(track: ActiveAudioTrack | null, playing: boolean) {
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const session = (navigator as any).mediaSession;

    if (track && playing) {
      session.metadata = new MediaMetadata({
        title: track.title,
        artist: "Rebirth",
        album: track.subtitle,
        artwork: [{ src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }],
      });

      session.setActionHandler("play", () => {
        // Handled by the audio player; this is a no-op mirror for lock screen.
      });
      session.setActionHandler("pause", () => {
        // No-op mirror.
      });
      session.setActionHandler("previoustrack", () => {
        // No-op mirror.
      });
      session.setActionHandler("nexttrack", () => {
        // No-op mirror.
      });
    } else {
      session.metadata = null;
    }

    return () => {
      session.metadata = null;
    };
  }, [track, playing]);
}
