import React, { useState, useEffect } from "react";
import { Sparkles, PenTool, Volume2, RefreshCw, BookOpen, Heart, Check } from "lucide-react";
import { DailyContemplation } from "../types";
import { useDevotional } from "../context/DevotionalContext";
import { triggerHaptic } from "../utils/haptics";

interface DailyContemplationCardProps {
  onReflect: (contemplation: DailyContemplation) => void;
}

const FALLBACK_CONTEMPLATION: DailyContemplation = {
  id: "daily-john-15-5",
  reference: "John 15:5",
  text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.",
  theme: "spiritual_strength",
  themeLabel: "Spiritual Strength & Abiding",
  reflectionPrompt: "Where have you been striving in self-effort rather than drawing quiet spiritual life from Christ the Vine?",
  christologicalFocus: "Jesus is our organic life source; true strength is relational dependence rather than human willpower.",
};

export const DailyContemplationCard: React.FC<DailyContemplationCardProps> = ({ onReflect }) => {
  const { playTrack, playbackState, activeTrack } = useDevotional();
  const [contemplation, setContemplation] = useState<DailyContemplation>(FALLBACK_CONTEMPLATION);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReflected, setHasReflected] = useState(false);

  useEffect(() => {
    fetchDailyContemplation(false);
  }, []);

  const fetchDailyContemplation = async (fresh: boolean) => {
    setIsLoading(true);
    try {
      const url = fresh ? "/api/daily-contemplation?fresh=true" : "/api/daily-contemplation";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setContemplation(data);
      }
    } catch (e) {
      console.warn("Could not fetch daily contemplation, using fallback:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    triggerHaptic("medium");
    fetchDailyContemplation(true);
  };

  const handleReflectClick = () => {
    triggerHaptic("medium");
    setHasReflected(true);
    onReflect(contemplation);
  };

  const isAudioPlaying =
    playbackState === "playing" && activeTrack?.id === `daily-${contemplation.id}`;

  const handleListen = () => {
    triggerHaptic("light");
    const fullAudioText = `Daily Contemplation from ${contemplation.reference}. "${contemplation.text}". Theological reflection prompt: ${contemplation.reflectionPrompt}. Christological focus: ${contemplation.christologicalFocus}. Take a moment to breathe and reflect upon Christ's presence today.`;

    playTrack({
      id: `daily-${contemplation.id}`,
      title: `Daily Verse: ${contemplation.reference}`,
      subtitle: contemplation.themeLabel,
      theme: contemplation.theme,
      fullText: fullAudioText,
      estimatedDuration: "1 min",
    });
  };

  return (
    <div
      id="daily-contemplation-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181d26] to-[#12151c] border border-[#d4af37]/30 p-5 shadow-xl transition-all"
    >
      {/* Gentle antique gold decorative border glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e5c158]"></span>
          </span>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#e5c158]">
            Daily Contemplation
          </span>
          {contemplation.dateStr && (
            <span className="text-[11px] text-[#8e8777] hidden xs:inline">
              • {contemplation.dateStr}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Refresh AI button */}
          <button
            id="daily-contemplation-refresh-btn"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[#9b9484] hover:text-[#f3e8c9] hover:bg-[#202735] transition-colors disabled:opacity-50"
            title="Generate fresh contemplation"
            aria-label="Generate fresh contemplation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#e5c158]" : ""}`} />
          </button>

          {/* Theme chip */}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202633] text-[#b8b3a4] border border-[#2e3748]">
            {contemplation.themeLabel}
          </span>
        </div>
      </div>

      {/* Scripture Verse */}
      <div className="mb-4">
        <blockquote className="font-serif italic text-base md:text-lg text-[#f7f4ec] leading-relaxed mb-2 pl-3 border-l-2 border-[#d4af37]/60">
          "{contemplation.text}"
        </blockquote>
        <div className="flex items-center justify-between text-xs text-[#d4af37] font-medium pl-3">
          <span>— {contemplation.reference}</span>
          <span className="text-[11px] text-[#8e8777] italic">ESV</span>
        </div>
      </div>

      {/* Theological Reflection Prompt */}
      <div className="bg-[#0e1117]/80 rounded-xl p-3 border border-[#262c3b] mb-4">
        <p className="text-xs text-[#c9c4b7] leading-relaxed">
          <strong className="text-[#e5c158] font-medium">Contemplative Prompt: </strong>
          {contemplation.reflectionPrompt}
        </p>
      </div>

      {/* Action Buttons: Reflect & Listen */}
      <div className="flex items-center gap-2 pt-1">
        {/* Deep-link Reflect Button */}
        <button
          id="daily-contemplation-reflect-btn"
          onClick={handleReflectClick}
          className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0d1017] font-semibold text-xs tracking-wide shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
        >
          {hasReflected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Reflecting in Notepad</span>
            </>
          ) : (
            <>
              <PenTool className="w-3.5 h-3.5" />
              <span>Reflect on This Verse</span>
            </>
          )}
        </button>

        {/* Audio Narration Button */}
        <button
          id="daily-contemplation-listen-btn"
          onClick={handleListen}
          className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
            isAudioPlaying
              ? "bg-[#272115] border-[#d4af37] text-[#f7f4ec]"
              : "bg-[#181d26] border-[#2e3748] text-[#c9c4b7] hover:border-[#d4af37]/50"
          }`}
          title="Listen hands-free"
          aria-label="Listen hands-free"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isAudioPlaying ? "text-[#e5c158] animate-pulse" : "text-[#9b9484]"}`} />
          <span className="hidden sm:inline">{isAudioPlaying ? "Playing" : "Listen"}</span>
        </button>
      </div>
    </div>
  );
};
