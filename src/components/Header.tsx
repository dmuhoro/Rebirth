import React from "react";
import { CheckCircle2, UserRound, Volume2 } from "lucide-react";
import { useDevotional } from "../context/DevotionalContext";

interface HeaderProps {
  onOpenPlayer?: () => void;
  onOpenAccount?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPlayer,
  onOpenAccount,
}) => {
  const { playbackState, activeTrack, completedLessonIds } = useDevotional();

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e12]/90 backdrop-blur-md border-b border-[#212631] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center min-w-0">
          <div className="min-w-0">
            <img
              src="/brand/rebirth-logo-horizontal-reversed.svg"
              alt="Rebirth"
              className="h-8 w-auto max-w-[132px]"
              width="132"
              height="33"
            />
            <p className="hidden sm:block text-[10px] text-[#b8b3a4] tracking-tight mt-0.5">
              Christ-Centered Contemplation &amp; Audio
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAccount}
            aria-label="Open account and manual backup settings"
            className="rounded-full border border-[#2e3748] bg-[#181d26] p-2 text-[#b8b3a4] hover:text-[#B9A06C]"
          >
            <UserRound className="h-4 w-4" />
          </button>

          {completedLessonIds.length > 0 && (
            <div
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-[#181d26] border border-[#2e3748] text-[11px] text-[#b8b3a4]"
              title={`${completedLessonIds.length} lessons completed`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#58a66f]" />
              <span>{completedLessonIds.length}</span>
            </div>
          )}

          {activeTrack && (
            <button
              onClick={onOpenPlayer}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                playbackState === "playing"
                  ? "bg-[#252013] border-[#B9A06C]/50 text-[#f3e8c9] animate-pulse"
                  : "bg-[#181d26] border-[#2e3748] text-[#c5c0b0]"
              }`}
              aria-label="Open audio player"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  playbackState === "playing" ? "text-[#B9A06C]" : "text-[#9b9484]"
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
