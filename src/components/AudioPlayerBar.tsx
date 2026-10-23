import React, { useCallback, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  ChevronUp,
  ChevronDown,
  X,
  Volume2,
  Gauge,
  Footprints,
  BookOpen,
  Sliders,
} from "lucide-react";
import { useDevotional } from "../context/DevotionalContext";
import { triggerHaptic } from "../utils/haptics";
import { useMediaSession } from "../hooks/useMediaSession";

interface AudioPlayerBarProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isExpanded,
  setIsExpanded,
}) => {
  const {
    activeTrack,
    playbackState,
    playbackSpeed,
    progress,
    togglePlayPause,
    stopAudio,
    setSpeed,
    skipForward,
    skipBackward,
  } = useDevotional();

  const [walkMode, setWalkMode] = useState(false);

  const handleMediaPlay = useCallback(() => {
    if (playbackState !== "playing") togglePlayPause();
  }, [playbackState, togglePlayPause]);
  const handleMediaPause = useCallback(() => {
    if (playbackState === "playing") togglePlayPause();
  }, [playbackState, togglePlayPause]);

  const handlePlayPause = () => {
    triggerHaptic("medium");
    togglePlayPause();
  };

  const handleSkipForward = () => {
    triggerHaptic("light");
    skipForward();
  };

  const handleSkipBackward = () => {
    triggerHaptic("light");
    skipBackward();
  };

  const handleWalkModeToggle = () => {
    triggerHaptic("medium");
    setWalkMode(!walkMode);
  };

  const handleStop = () => {
    triggerHaptic("selection");
    stopAudio();
  };

  useMediaSession(activeTrack, playbackState, {
    onPlay: handleMediaPlay,
    onPause: handleMediaPause,
    onPrevious: skipBackward,
    onNext: skipForward,
  });

  if (!activeTrack) return null;

  const percentage = progress?.percentage || 0;
  const isPlaying = playbackState === "playing";

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    triggerHaptic("selection");
  };

  const handleSpeedPreset = (speed: number) => {
    triggerHaptic("light");
    setSpeed(speed);
  };

  const getSpeedDescription = (speed: number) => {
    if (speed <= 0.8) return "Gentle / Deep Contemplation";
    if (speed < 1.1) return "Natural Reflection";
    if (speed < 1.35) return "Brisk Walk";
    return "Quick Review";
  };

  const themeColors = {
    spiritual_strength: "from-[#d4af37]/20 to-[#8c7322]/10 border-[#d4af37]/30 text-[#e5c158]",
    repentance_transformation: "from-[#a86548]/20 to-[#6d3e2b]/10 border-[#a86548]/30 text-[#e09b7d]",
    divinity_of_christ: "from-[#637ab8]/20 to-[#3a4970]/10 border-[#637ab8]/30 text-[#9bb2ed]",
    prayer: "from-[#c5a059]/20 to-[#7d6538]/10 border-[#c5a059]/30 text-[#e8cf99]",
    scripture: "from-[#529377]/20 to-[#315948]/10 border-[#529377]/30 text-[#8cd6b3]",
  };

  const activeColor = themeColors[activeTrack.theme] || themeColors.spiritual_strength;

  return (
    <>
      {/* Expanded Player Sheet */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end transition-all"
          onClick={() => {
            triggerHaptic("selection");
            setIsExpanded(false);
          }}
        >
          <div
            className={`w-full max-w-md mx-auto bg-[#101319] border-t border-[#2a313f] rounded-t-3xl shadow-2xl p-5 pb-8 overflow-y-auto max-h-[88vh] transition-transform ${
              walkMode ? "bg-[#08090d]" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="flex items-center justify-between pb-3 border-b border-[#212631]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#e5c158] animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                  Hands-Free Audio Guide
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Walk Mode Toggle */}
                <button
                  id="walk-mode-toggle-btn"
                  onClick={handleWalkModeToggle}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
                    walkMode
                      ? "bg-[#e5c158] text-black border-[#e5c158]"
                      : "bg-[#181d26] text-[#b8b3a4] border-[#2e3748]"
                  }`}
                  title="Large high-contrast controls for walking"
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>{walkMode ? "Walk Mode On" : "Walk Mode"}</span>
                </button>
                <button
                  id="collapse-player-btn"
                  onClick={() => {
                    triggerHaptic("selection");
                    setIsExpanded(false);
                  }}
                  className="p-1.5 text-[#9b9484] hover:text-white rounded-full bg-[#181d26]"
                  aria-label="Minimize player"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Track Info */}
            <div className="mt-5 text-center px-2">
              <div
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold border mb-2 uppercase tracking-wider ${activeColor}`}
              >
                {activeTrack.theme.replace("_", " ")}
              </div>
              <h2
                className={`font-display-title font-semibold text-[#f7f4ec] leading-snug ${
                  walkMode ? "text-2xl" : "text-lg"
                }`}
              >
                {activeTrack.title}
              </h2>
              <p className="text-xs text-[#b8b3a4] mt-1 font-serif-reading italic">
                {activeTrack.subtitle}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 px-1">
              <div className="w-full bg-[#202633] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#c99d36] to-[#e5c158] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#8e897a] mt-1.5 font-mono">
                <span>{percentage}% listened</span>
                <span>Est. {activeTrack.estimatedDuration}</span>
              </div>
            </div>

            {/* Main Audio Controls (Android thumb-friendly) */}
            <div className="flex items-center justify-center space-x-6 mt-6">
              <button
                id="audio-skip-back-btn"
                onClick={handleSkipBackward}
                className="w-12 h-12 rounded-full bg-[#181d26] border border-[#2e3748] flex items-center justify-center text-[#c5c0b0] hover:text-white active:scale-95 transition-all"
                aria-label="Skip back"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                id="audio-play-pause-btn"
                onClick={handlePlayPause}
                className={`rounded-full bg-gradient-to-b from-[#f3d37a] to-[#d4af37] text-[#0c0e12] flex items-center justify-center shadow-lg active:scale-95 transition-all font-bold ${
                  walkMode ? "w-20 h-20" : "w-16 h-16"
                }`}
                aria-label={isPlaying ? "Pause audio" : "Play audio"}
              >
                {isPlaying ? (
                  <Pause className={walkMode ? "w-9 h-9" : "w-7 h-7"} fill="currentColor" />
                ) : (
                  <Play className={`ml-1 ${walkMode ? "w-9 h-9" : "w-7 h-7"}`} fill="currentColor" />
                )}
              </button>

              <button
                id="audio-skip-forward-btn"
                onClick={handleSkipForward}
                className="w-12 h-12 rounded-full bg-[#181d26] border border-[#2e3748] flex items-center justify-center text-[#c5c0b0] hover:text-white active:scale-95 transition-all"
                aria-label="Skip forward"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Speech Speed Slider & Presets */}
            <div className="mt-6 p-4 rounded-2xl bg-[#141822] border border-[#272e3d]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs text-[#d4af37] font-semibold">
                  <Gauge className="w-4 h-4" />
                  <span>Speech Speed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#f7f4ec] px-2 py-0.5 rounded bg-[#1e2533] border border-[#d4af37]/30">
                    {playbackSpeed.toFixed(2)}x
                  </span>
                  <button
                    id="audio-stop-btn"
                    onClick={handleStop}
                    className="px-2 py-0.5 rounded text-[11px] border border-red-500/30 text-red-400 bg-red-950/20 hover:bg-red-900/30 active:scale-95 transition-all"
                  >
                    Stop
                  </button>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-1.5">
                <input
                  id="speech-speed-slider"
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={playbackSpeed}
                  onChange={handleSpeedSliderChange}
                  className="w-full h-2 bg-[#212735] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
                <div className="flex justify-between text-[10px] text-[#8e897a]">
                  <span>0.7x (Contemplative)</span>
                  <span className="text-[#c9c4b7]">{getSpeedDescription(playbackSpeed)}</span>
                  <span>1.5x (Brisk)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5 mt-3 pt-3 border-t border-[#212631]">
                {[0.7, 0.85, 1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedPreset(speed)}
                    className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-colors active:scale-95 ${
                      Math.abs(playbackSpeed - speed) < 0.02
                        ? "bg-[#d4af37] border-[#d4af37] text-black font-bold shadow-sm"
                        : "bg-[#191e2a] border-[#293244] text-[#a6a090] hover:text-[#f7f4ec]"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Current Sentence Transcript / Reading Aid */}
            {progress?.currentSentence && (
              <div className="mt-5 p-3.5 rounded-2xl bg-[#151922] border border-[#272e3d]">
                <p className="text-[11px] uppercase tracking-wider text-[#9b9484] font-semibold flex items-center mb-1">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5 text-[#d4af37]" /> Currently Speaking
                </p>
                <p className="text-sm font-serif-reading text-[#f7f4ec] leading-relaxed italic">
                  "{progress.currentSentence}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Sticky Bottom Bar (Sitting right above bottom navigation) */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div
            id="collapsed-audio-bar"
            onClick={() => {
              triggerHaptic("selection");
              setIsExpanded(true);
            }}
            className="bg-[#121620]/95 backdrop-blur-md border border-[#2a313f] rounded-2xl shadow-xl p-2.5 px-3 flex items-center justify-between cursor-pointer hover:border-[#d4af37]/50 transition-all active:scale-[0.99]"
          >
            {/* Progress indicator pill */}
            <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-2">
              <div
                className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center border ${activeColor}`}
              >
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-semibold text-[#f7f4ec] truncate">
                  {activeTrack.title}
                </h4>
                <p className="text-[11px] text-[#9b9484] truncate font-serif-reading italic">
                  {progress?.currentSentence
                    ? progress.currentSentence
                    : activeTrack.subtitle}
                </p>
              </div>
            </div>

            {/* Quick Controls */}
            <div
              className="flex items-center space-x-1.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id="collapsed-audio-play-pause-btn"
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[#e5c158] to-[#c99d36] text-[#0c0e12] flex items-center justify-center active:scale-95 shadow font-bold"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>

              <button
                id="collapsed-audio-expand-btn"
                onClick={() => {
                  triggerHaptic("selection");
                  setIsExpanded(true);
                }}
                className="p-2 text-[#9b9484] hover:text-[#f7f4ec]"
                aria-label="Expand player"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
