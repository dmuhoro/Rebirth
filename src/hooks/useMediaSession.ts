import { useEffect } from "react";
import { ActiveAudioTrack, PlaybackState } from "../types";

/**
 * Feature-detected MediaSession integration for lock-screen metadata and
 * playback controls (play/pause, seek).
 *
 * MediaSession controls work where supported. Web Speech itself may still be
 * suspended by the browser when the device locks; continuous background audio
 * requires a native audio asset.
 */
export function useMediaSession(
  track: ActiveAudioTrack | null,
  playbackState: PlaybackState,
  actions: {
    onPlay: () => void;
    onPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
  },
) {
  const { onPlay, onPause, onPrevious, onNext } = actions;
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;
    const session = navigator.mediaSession;

    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title: track.title,
        artist: "Rebirth",
        album: track.subtitle,
        artwork: [{ src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }],
      });
    }

    session.playbackState =
      playbackState === "playing"
        ? "playing"
        : playbackState === "paused"
          ? "paused"
          : "none";
    session.setActionHandler("play", onPlay);
    session.setActionHandler("pause", onPause);
    session.setActionHandler("previoustrack", onPrevious);
    session.setActionHandler("nexttrack", onNext);

    return () => {
      session.metadata = null;
      session.playbackState = "none";
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("previoustrack", null);
      session.setActionHandler("nexttrack", null);
    };
  }, [track, playbackState, onPlay, onPause, onPrevious, onNext]);
}
