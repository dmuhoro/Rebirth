import React, { useState } from "react";
import {
  BookMarked,
  Play,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SCRIPTURE_STUDIES } from "../data/scripturesData";
import { ScriptureStudy, TheologicalTheme } from "../types";
import { useDevotional } from "../context/DevotionalContext";

interface ScripturesViewProps {
  onOpenPlayer: () => void;
}

export const ScripturesView: React.FC<ScripturesViewProps> = ({ onOpenPlayer }) => {
  const {
    playTrack,
    activeTrack,
    playbackState,
    isScriptureBookmarked,
    toggleBookmarkScripture,
  } = useDevotional();

  const [selectedTheme, setSelectedTheme] = useState<TheologicalTheme | "all">("all");
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>("study-isaiah-40");

  const filteredStudies =
    selectedTheme === "all"
      ? SCRIPTURE_STUDIES
      : SCRIPTURE_STUDIES.filter((s) => s.theme === selectedTheme);

  const handleListenToStudy = (study: ScriptureStudy) => {
    const speechScript = `Scripture Study: ${study.title}. Primary Passage: ${study.reference}. ${study.fullText}. Historical Background: ${study.historicalContext}. Original Language Insights: ${study.originalLanguageInsights.map((i) => `${i.language} word ${i.transliteration}, meaning ${i.definition}. ${i.theologicalSignificance}`).join(". ")}. Theological Exegesis: ${study.exegesis}. The Christological Bridge: ${study.christologicalBridge}. Prayer of Response: ${study.prayerfulResponse}`;

    playTrack({
      id: study.id,
      title: study.title,
      subtitle: study.reference,
      theme: "scripture",
      fullText: speechScript,
      estimatedDuration: "5 mins",
    });
    onOpenPlayer();
  };

  const themeBadges = [
    { id: "all", label: "All Scriptures" },
    { id: "spiritual_strength", label: "Spiritual Strength" },
    { id: "repentance_transformation", label: "Repentance" },
    { id: "divinity_of_christ", label: "Divinity of Christ" },
  ];

  return (
    <div className="pb-32 px-4 pt-2 max-w-md mx-auto space-y-4">
      {/* Scripture Header */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#171b26] to-[#12151f] border border-[#262c3d] shadow-sm">
        <div className="flex items-center space-x-1.5 text-[#58a66f] text-xs font-semibold uppercase tracking-wider mb-1">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Exegetical Integrations</span>
        </div>
        <h2 className="font-display-title text-base font-bold text-[#f7f4ec]">
          Original Language &amp; Christology
        </h2>
        <p className="text-xs text-[#b8b3a4] mt-1 font-serif-reading">
          Explore Hebrew &amp; Greek word roots that unlock the New Covenant, clean heart theology, and the uncreated Logos.
        </p>
      </div>

      {/* Theme Filters */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {themeBadges.map((badge) => (
          <button
            key={badge.id}
            onClick={() => setSelectedTheme(badge.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedTheme === badge.id
                ? "bg-[#58a66f] text-[#0c0e12] border-[#58a66f] font-bold shadow"
                : "bg-[#151922] text-[#9b9484] border-[#252c3c] hover:text-white"
            }`}
          >
            {badge.label}
          </button>
        ))}
      </div>

      {/* Scripture Cards */}
      <div className="space-y-4">
        {filteredStudies.map((study) => {
          const isExpanded = expandedStudyId === study.id;
          const isBookmarked = isScriptureBookmarked(study.id);
          const isPlaying =
            activeTrack?.id === study.id && playbackState === "playing";

          return (
            <div
              key={study.id}
              className="rounded-3xl bg-[#12151e] border border-[#242b3b] overflow-hidden shadow-sm transition-all"
            >
              {/* Card Header (clickable to expand/collapse) */}
              <div
                onClick={() => setExpandedStudyId(isExpanded ? null : study.id)}
                className="p-4 cursor-pointer flex items-start justify-between bg-gradient-to-b from-[#161a25] to-[#12151e]"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1f2636] text-[#8cd6b3] border border-[#58a66f]/30">
                      {study.reference}
                    </span>
                  </div>
                  <h3 className="font-display-title text-sm font-semibold text-[#f7f4ec] leading-snug">
                    {study.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmarkScripture(study.id);
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      isBookmarked
                        ? "text-[#e5c158] bg-[#232014]"
                        : "text-[#7c7769] hover:text-white"
                    }`}
                    aria-label="Bookmark scripture"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <div className="p-1 text-[#8e897a]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Primary Scripture Quote */}
              <div className="px-4 py-3 bg-[#0d1017] border-y border-[#1e2433]">
                <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed">
                  "{study.fullText}"
                </p>
              </div>

              {/* Quick Listen Button */}
              <div className="p-3 bg-[#131620] flex items-center justify-between border-b border-[#1e2433]">
                <span className="text-[11px] text-[#9b9484] italic">
                  Complete audio exposition with word studies
                </span>
                <button
                  onClick={() => handleListenToStudy(study)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-transform active:scale-95 shadow ${
                    isPlaying
                      ? "bg-[#252013] text-[#e5c158] border border-[#e5c158]"
                      : "bg-[#58a66f] text-[#0c0e12]"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-currentColor" />
                  <span>{isPlaying ? "Playing" : "Listen (TTS)"}</span>
                </button>
              </div>

              {/* Expanded Exegetical Deep Dive */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-[#10131c]">
                  {/* Original Language Word Studies */}
                  <div>
                    <h4 className="text-[11px] font-display-title font-bold uppercase tracking-wider text-[#d4af37] flex items-center mb-2">
                      <Globe className="w-3.5 h-3.5 mr-1 text-[#d4af37]" /> Original Language Insights
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {study.originalLanguageInsights.map((insight, iIdx) => (
                        <div
                          key={iIdx}
                          className="p-3 rounded-2xl bg-[#161a25] border border-[#273042]"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-[#f7edd4] font-serif">
                              {insight.term} ({insight.transliteration})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e2434] text-[#8cd6b3] uppercase font-mono">
                              {insight.language}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#c5c0b0] mb-1">
                            Meaning: <span className="text-[#f7f4ec]">{insight.definition}</span>
                          </p>
                          <p className="text-[11px] text-[#9b9484] leading-relaxed pt-1 border-t border-[#232938]">
                            {insight.theologicalSignificance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exegesis & Historical Context */}
                  <div className="p-3 rounded-2xl bg-[#141720] border border-[#222837] space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9b9484] block">
                      Theological Exegesis
                    </span>
                    <p className="text-xs font-serif-reading text-[#d8d3c5] leading-relaxed">
                      {study.exegesis}
                    </p>
                    <p className="text-[11px] text-[#8e897a] italic pt-1 border-t border-[#1d222e]">
                      Context: {study.historicalContext}
                    </p>
                  </div>

                  {/* The Christological Bridge */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#1b2233] to-[#141824] border border-[#d4af37]/30">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#e5c158] flex items-center mb-1">
                      <Sparkles className="w-3 h-3 mr-1" /> Christological Bridge to the Cross
                    </span>
                    <p className="text-xs font-serif-reading text-[#f7edd4] leading-relaxed">
                      {study.christologicalBridge}
                    </p>
                  </div>

                  {/* Prayerful Response */}
                  <div className="p-3 rounded-xl bg-[#0c0e12] border border-[#262c3b] text-center">
                    <span className="text-[10px] uppercase font-bold text-[#b8b3a4] tracking-widest block mb-1">
                      Prayer of Response
                    </span>
                    <p className="text-xs font-serif-reading italic text-[#e5c158] leading-relaxed">
                      "{study.prayerfulResponse}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
