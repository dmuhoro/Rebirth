import React, { useState } from "react";
import {
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Quote,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Check,
} from "lucide-react";
import { Lesson, TheologicalTheme } from "../types";
import { LESSONS } from "../data/lessonsData";
import { useDevotional } from "../context/DevotionalContext";

interface LessonsViewProps {
  onOpenPlayer: () => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({ onOpenPlayer }) => {
  const {
    playTrack,
    activeTrack,
    playbackState,
    isLessonCompleted,
    markLessonComplete,
  } = useDevotional();

  const [selectedTheme, setSelectedTheme] = useState<TheologicalTheme | "all">("all");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const filteredLessons =
    selectedTheme === "all"
      ? LESSONS
      : LESSONS.filter((l) => l.theme === selectedTheme);

  const handleStartListening = (lesson: Lesson) => {
    playTrack({
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.subtitle,
      theme: lesson.theme,
      fullText: lesson.audioNarrationText,
      estimatedDuration: `${lesson.estimatedMinutes} mins`,
    });
    onOpenPlayer();
  };

  const themeBadges = [
    { id: "all", label: "All Lessons" },
    { id: "spiritual_strength", label: "Spiritual Strength" },
    { id: "repentance_transformation", label: "Repentance & Heart" },
    { id: "divinity_of_christ", label: "Divinity of Christ" },
  ];

  return (
    <div className="pb-32 px-4 pt-2 max-w-md mx-auto">
      {/* If a lesson is opened in full read mode */}
      {selectedLesson ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedLesson(null)}
            className="inline-flex items-center text-xs font-semibold text-[#d4af37] hover:underline mb-2 py-1"
          >
            ← Back to all lessons
          </button>

          {/* Lesson Header Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181d28] to-[#12151d] border border-[#2e3748] shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-[#202737] text-[#e5c158] border border-[#d4af37]/30">
                {selectedLesson.themeLabel}
              </span>
              <span className="text-xs text-[#9b9484] flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#d4af37]" />
                {selectedLesson.estimatedMinutes} mins
              </span>
            </div>

            <h1 className="font-display-title text-xl font-bold text-[#f7f4ec] leading-snug">
              {selectedLesson.title}
            </h1>
            <p className="text-xs text-[#c5c0b0] mt-1.5 font-serif-reading italic">
              {selectedLesson.subtitle}
            </p>

            {/* Quick Audio Play Button for Android */}
            <div className="mt-5 flex items-center space-x-3">
              <button
                onClick={() => handleStartListening(selectedLesson)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#e5c158] to-[#c99d36] text-[#0c0e12] font-semibold flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-currentColor" />
                <span>
                  {activeTrack?.id === selectedLesson.id && playbackState === "playing"
                    ? "Currently Playing"
                    : "Listen Hands-Free"}
                </span>
              </button>

              <button
                onClick={() => markLessonComplete(selectedLesson.id)}
                className={`p-3 rounded-2xl border transition-colors flex items-center justify-center ${
                  isLessonCompleted(selectedLesson.id)
                    ? "bg-[#1f2f24] border-[#386c47] text-[#6ad689]"
                    : "bg-[#181d26] border-[#2e3748] text-[#8e897a] hover:text-white"
                }`}
                title="Mark as completed"
                aria-label="Mark lesson as completed"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Historical Theologian Quote Card */}
          <div className="p-4 rounded-2xl bg-[#141720] border-l-4 border-[#d4af37] border-y border-r border-[#262c3a]">
            <div className="flex items-start space-x-2">
              <Quote className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-serif-reading italic text-[#e8e4d8] leading-relaxed">
                  "{selectedLesson.theologicalVoice.quote}"
                </p>
                <p className="text-[11px] font-semibold text-[#b8b3a4] mt-1.5">
                  — {selectedLesson.theologicalVoice.name}{" "}
                  <span className="text-[#7c7769]">({selectedLesson.theologicalVoice.era})</span>
                </p>
              </div>
            </div>
          </div>

          {/* Scripture Anchors */}
          <div className="space-y-3">
            <h3 className="font-display-title text-sm font-semibold uppercase tracking-wider text-[#d4af37] flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5" /> Scripture Foundations
            </h3>
            {selectedLesson.scriptureAnchors.map((anchor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#121622] border border-[#252c3c]"
              >
                <div className="text-xs font-bold text-[#e5c158] mb-1">
                  {anchor.reference}
                </div>
                <p className="text-xs font-serif-reading text-[#f7f4ec] leading-relaxed italic">
                  "{anchor.text}"
                </p>
                <p className="text-[11px] text-[#9b9484] mt-1.5 pt-1.5 border-t border-[#1f2534]">
                  {anchor.note}
                </p>
              </div>
            ))}
          </div>

          {/* Lesson Sections */}
          <div className="space-y-5">
            {selectedLesson.sections.map((section, idx) => (
              <article
                key={idx}
                className="p-4 rounded-2xl bg-[#11141b] border border-[#212735] space-y-3"
              >
                <h2 className="font-display-title text-base font-semibold text-[#f7f4ec] text-[#e8cf99]">
                  {section.title}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-xs font-serif-reading text-[#d8d3c5] leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </article>
            ))}
          </div>

          {/* Contemplative Exercise & Breath Prayer */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1c2230] to-[#12151f] border border-[#d4af37]/40 shadow-md space-y-3">
            <div className="flex items-center space-x-2 text-[#e5c158]">
              <Sparkles className="w-4 h-4" />
              <h3 className="font-display-title text-xs font-bold uppercase tracking-wider">
                Contemplative Discipline &amp; Breath Prayer
              </h3>
            </div>
            <p className="text-xs text-[#c5c0b0] font-serif-reading leading-relaxed">
              {selectedLesson.contemplativeExercise.prompt}
            </p>
            <div className="p-3 rounded-xl bg-[#0c0e12]/80 border border-[#d4af37]/30 text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] block mb-1">
                Sacred Breath Prayer
              </span>
              <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed">
                "{selectedLesson.contemplativeExercise.breathPrayer}"
              </p>
            </div>
            <p className="text-[11px] text-[#9b9484]">
              <strong className="text-[#b8b3a4]">Walk/Action Step:</strong>{" "}
              {selectedLesson.contemplativeExercise.actionStep}
            </p>
          </div>
        </div>
      ) : (
        /* Lesson Directory / List */
        <div className="space-y-4">
          {/* Welcome Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#181d27] to-[#11141c] border border-[#262c3b] shadow-sm">
            <div className="flex items-center space-x-1.5 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contemplative Audio Curriculum</span>
            </div>
            <h2 className="font-display-title text-base font-bold text-[#f7f4ec]">
              Theology for Walks &amp; Work
            </h2>
            <p className="text-xs text-[#b8b3a4] mt-1 font-serif-reading">
              Deep, Christ-centered expositions designed for hands-free listening using the Web Speech API.
            </p>
          </div>

          {/* Theme Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {themeBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedTheme(badge.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedTheme === badge.id
                    ? "bg-[#e5c158] text-[#0c0e12] border-[#e5c158] font-bold shadow"
                    : "bg-[#151922] text-[#9b9484] border-[#252c3c] hover:text-white"
                }`}
              >
                {badge.label}
              </button>
            ))}
          </div>

          {/* Lesson Cards */}
          <div className="space-y-3">
            {filteredLessons.map((lesson) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const isCurrentPlaying =
                activeTrack?.id === lesson.id && playbackState === "playing";

              return (
                <div
                  key={lesson.id}
                  className="p-4 rounded-2xl bg-[#131620] border border-[#232938] hover:border-[#d4af37]/40 transition-all shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#1b212f] text-[#d4af37] border border-[#d4af37]/20">
                        {lesson.themeLabel}
                      </span>
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <span className="flex items-center text-[10px] text-[#58a66f] font-medium">
                            <Check className="w-3 h-3 mr-0.5" /> Completed
                          </span>
                        )}
                        <span className="text-[11px] text-[#8e897a] flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-[#d4af37]" />
                          {lesson.estimatedMinutes}m
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setSelectedLesson(lesson)}
                      className="font-display-title text-sm font-semibold text-[#f7f4ec] leading-snug cursor-pointer hover:text-[#e5c158] transition-colors"
                    >
                      {lesson.title}
                    </h3>

                    <p className="text-xs text-[#a39e8f] mt-1 font-serif-reading italic line-clamp-2">
                      {lesson.subtitle}
                    </p>
                  </div>

                  {/* Actions (Play audio / Read details) */}
                  <div className="pt-2 border-t border-[#1e2432] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedLesson(lesson)}
                      className="text-xs text-[#b8b3a4] hover:text-white flex items-center space-x-1"
                    >
                      <span>Read treatise</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleStartListening(lesson)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-transform active:scale-95 shadow ${
                        isCurrentPlaying
                          ? "bg-[#252013] text-[#e5c158] border border-[#e5c158]"
                          : "bg-gradient-to-r from-[#e5c158] to-[#c99d36] text-[#0c0e12]"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-currentColor" />
                      <span>{isCurrentPlaying ? "Playing" : "Listen (TTS)"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
