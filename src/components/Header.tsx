import React from "react";
import { Sparkles, Volume2, BookOpen, CheckCircle2 } from "lucide-react";
import { useDevotional } from "../context/DevotionalContext";

interface HeaderProps {
  onOpenPlayer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPlayer }) => {
  const { playbackState, activeTrack, completedLessonIds } = useDevotional();

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e12]/90 backdrop-blur-md border-b border-[#212631] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#181d26] border border-[#d4af37]/30 flex items-center justify-center text-[#e5c158] shadow-inner">
            <span className="font-display-title text-sm font-semibold tracking-widest">☧</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-display-title text-base font-semibold text-[#f7f4ec] tracking-wide">
                SELAH
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#202633] text-[#d4af37] font-medium border border-[#d4af37]/20">
                Devotional
              </span>
            </div>
            <p className="text-[11px] text-[#9b9484] tracking-tight">
              Christ-Centered Contemplation &amp; Audio
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Completed lessons badge */}
          {completedLessonIds.length > 0 && (
            <div
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-[#181d26] border border-[#2e3748] text-[11px] text-[#b8b3a4]"
              title={`${completedLessonIds.length} lessons completed`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#58a66f]" />
              <span>{completedLessonIds.length}</span>
            </div>
          )}

          {/* Active Audio Indicator */}
          {activeTrack && (
            <button
              onClick={onOpenPlayer}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                playbackState === "playing"
                  ? "bg-[#252013] border-[#e5c158]/50 text-[#f3e8c9] animate-pulse"
                  : "bg-[#181d26] border-[#2e3748] text-[#c5c0b0]"
              }`}
              aria-label="Open audio player"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  playbackState === "playing" ? "text-[#e5c158]" : "text-[#9b9484]"
                }`}
              />
              <span className="max-w-[80px] truncate text-[11px]">
                {playbackState === "playing" ? "Playing" : "Audio"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
