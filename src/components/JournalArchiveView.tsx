import React, { useState } from "react";
import {
  BookmarkCheck,
  Star,
  Play,
  Trash2,
  Calendar,
  CheckCircle2,
  BookMarked,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDevotional } from "../context/DevotionalContext";
import { LESSONS } from "../data/lessonsData";
import { SCRIPTURE_STUDIES } from "../data/scripturesData";

interface JournalArchiveViewProps {
  onOpenPlayer: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export const JournalArchiveView: React.FC<JournalArchiveViewProps> = ({
  onOpenPlayer,
}) => {
  const {
    journalEntries,
    favoriteEntryIds,
    completedLessonIds,
    bookmarkedScriptureIds,
    deleteJournalEntry,
    toggleFavoriteEntry,
    playTrack,
  } = useDevotional();

  const [activeTab, setActiveTab] = useState<"prayers" | "disciplines">("prayers");
  const [filterOnlyFavorites, setFilterOnlyFavorites] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const displayedEntries = filterOnlyFavorites
    ? journalEntries.filter((e) => favoriteEntryIds.includes(e.id))
    : journalEntries;

  const handleListenToSavedPrayer = (entry: any) => {
    const speechScript = `Saved Devotional Entry. Reflection: ${entry.feelings}. Pastoral Counsel: ${entry.guidance.pastoralCounsel}. Scripture Promise: ${entry.guidance.scriptures
      .map((s: any) => `${s.reference}, ${s.text}`)
      .join(". ")}. Custom Prayer: ${entry.guidance.customPrayer}. Breath Prayer: ${entry.guidance.breathPrayer}`;

    playTrack({
      id: entry.id,
      title: "Saved Journal Prayer",
      subtitle: `${entry.emotionTag} • ${new Date(entry.timestamp).toLocaleDateString()}`,
      theme: "prayer",
      fullText: speechScript,
      estimatedDuration: "3 mins",
    });
    onOpenPlayer();
  };

  return (
    <div className="pb-36 px-4 pt-2 max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#171b26] to-[#12151f] border border-[#262c3e] shadow-sm">
        <div className="flex items-center space-x-1.5 text-[#e5c158] text-xs font-semibold uppercase tracking-wider mb-1">
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Spiritual Archive &amp; Progress</span>
        </div>
        <h2 className="font-display-title text-base font-bold text-[#f7f4ec]">
          Sacred History &amp; Disciplines
        </h2>
        <p className="text-xs text-[#b8b3a4] mt-1 font-serif-reading">
          Your saved prayers, pastoral insights, completed theological audio lessons, and bookmarked scriptures.
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#232938]">
          <div className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center">
            <span className="text-sm font-bold text-[#e5c158] block">
              {journalEntries.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Prayers</span>
          </div>
          <div className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center">
            <span className="text-sm font-bold text-[#58a66f] block">
              {completedLessonIds.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Completed</span>
          </div>
          <div className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center">
            <span className="text-sm font-bold text-[#8cd6b3] block">
              {bookmarkedScriptureIds.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Scriptures</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex rounded-2xl bg-[#12151e] border border-[#242b3b] p-1">
        <button
          onClick={() => setActiveTab("prayers")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "prayers"
              ? "bg-[#1c2232] text-[#e5c158] shadow"
              : "text-[#8e897a] hover:text-white"
          }`}
        >
          Saved Prayers ({journalEntries.length})
        </button>
        <button
          onClick={() => setActiveTab("disciplines")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "disciplines"
              ? "bg-[#1c2232] text-[#e5c158] shadow"
              : "text-[#8e897a] hover:text-white"
          }`}
        >
          Completed Lessons &amp; Studies
        </button>
      </div>

      {activeTab === "prayers" ? (
        <div className="space-y-3">
          {/* Filter Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setFilterOnlyFavorites(!filterOnlyFavorites)}
              className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 transition-colors ${
                filterOnlyFavorites
                  ? "bg-[#272111] text-[#e5c158] border-[#e5c158]"
                  : "bg-[#141721] text-[#9b9484] border-[#252c3c]"
              }`}
            >
              <Star className="w-3 h-3 fill-currentColor" />
              <span>{filterOnlyFavorites ? "Showing Favorites" : "Filter Favorites"}</span>
            </button>
            <span className="text-[11px] text-[#7c7769]">
              {displayedEntries.length} {displayedEntries.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {displayedEntries.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#12151e] border border-[#242b3b] text-center space-y-2">
              <Heart className="w-8 h-8 text-[#5c5647] mx-auto" />
              <h3 className="font-display-title text-sm font-semibold text-[#c5c0b0]">
                No Saved Prayers Yet
              </h3>
              <p className="text-xs text-[#8e897a] font-serif-reading">
                Go to the Notepad tab, write your honest thoughts, and generate custom Christological prayers to save them here.
              </p>
            </div>
          ) : (
            displayedEntries.map((entry) => {
              const isFavorite = favoriteEntryIds.includes(entry.id);
              const isExpanded = expandedEntryId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="rounded-3xl bg-[#12151e] border border-[#232a3a] overflow-hidden shadow-sm transition-all"
                >
                  <div
                    onClick={() => setExpandedEntryId(isExpanded ? null : entry.id)}
                    className="p-4 cursor-pointer bg-gradient-to-b from-[#161a25] to-[#12151e]"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#1e2535] text-[#d4af37] border border-[#d4af37]/20">
                          {entry.emotionTag}
                        </span>
                        <span className="text-[11px] text-[#7c7769] flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteEntry(entry.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            isFavorite ? "text-[#e5c158]" : "text-[#555043] hover:text-white"
                          }`}
                          aria-label="Favorite prayer"
                        >
                          <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Remove this entry from your spiritual journal?")) {
                              deleteJournalEntry(entry.id);
                            }
                          }}
                          className="p-1.5 text-[#555043] hover:text-red-400 rounded-full"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-serif-reading text-[#d8d3c5] italic line-clamp-2">
                      "{entry.feelings}"
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e2432]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleListenToSavedPrayer(entry);
                        }}
                        className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#212736] text-[#e5c158] hover:bg-[#2c3447] flex items-center space-x-1.5"
                      >
                        <Play className="w-3 h-3 fill-currentColor" />
                        <span>Listen to Prayer</span>
                      </button>

                      <div className="text-[11px] text-[#7c7769] flex items-center">
                        <span>{isExpanded ? "Hide details" : "Show full prayer"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Custom Prayer & Scriptures */}
                  {isExpanded && (
                    <div className="p-4 bg-[#0d1017] border-t border-[#1e2432] space-y-3">
                      {/* Pastoral Counsel */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#9b9484] block mb-1">
                          Pastoral Reflection
                        </span>
                        <p className="text-xs font-serif-reading text-[#c5c0b0] leading-relaxed">
                          {entry.guidance.pastoralCounsel}
                        </p>
                      </div>

                      {/* Custom Prayer */}
                      <div className="p-3 rounded-2xl bg-[#141824] border border-[#d4af37]/30">
                        <span className="text-[10px] uppercase font-bold text-[#e5c158] block mb-1">
                          The Anointed Prayer
                        </span>
                        <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed whitespace-pre-line">
                          "{entry.guidance.customPrayer}"
                        </p>
                      </div>

                      {/* Breath Prayer */}
                      <div className="p-2 rounded-xl bg-[#11141c] border border-[#212738] text-center">
                        <span className="text-[9px] uppercase font-bold text-[#d4af37] block mb-0.5">
                          Breath Prayer
                        </span>
                        <p className="text-xs font-serif-reading italic text-[#d8d3c5]">
                          {entry.guidance.breathPrayer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Completed Lessons & Bookmarked Scriptures */
        <div className="space-y-4">
          {/* Completed Lessons Section */}
          <div className="space-y-2">
            <h3 className="font-display-title text-xs font-bold uppercase tracking-wider text-[#58a66f] flex items-center px-1">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completed Theological Lessons (
              {completedLessonIds.length})
            </h3>
            {completedLessonIds.length === 0 ? (
              <p className="text-xs text-[#7c7769] font-serif-reading italic p-3 rounded-2xl bg-[#12151e] border border-[#222837]">
                No lessons marked completed yet. Tap the checkmark on any lesson card when you finish.
              </p>
            ) : (
              <div className="space-y-1.5">
                {LESSONS.filter((l) => completedLessonIds.includes(l.id)).map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-3 rounded-2xl bg-[#12151e] border border-[#242b3b] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-[#f7f4ec] font-display-title">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-[#9b9484] font-serif-reading italic">
                        {lesson.themeLabel} • {lesson.estimatedMinutes} mins
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#58a66f]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked Scripture Studies */}
          <div className="space-y-2 pt-2">
            <h3 className="font-display-title text-xs font-bold uppercase tracking-wider text-[#8cd6b3] flex items-center px-1">
              <BookMarked className="w-3.5 h-3.5 mr-1" /> Bookmarked Scripture Exegesis (
              {bookmarkedScriptureIds.length})
            </h3>
            {bookmarkedScriptureIds.length === 0 ? (
              <p className="text-xs text-[#7c7769] font-serif-reading italic p-3 rounded-2xl bg-[#12151e] border border-[#222837]">
                No scripture studies bookmarked yet. Tap the bookmark icon on any scripture card.
              </p>
            ) : (
              <div className="space-y-1.5">
                {SCRIPTURE_STUDIES.filter((s) => bookmarkedScriptureIds.includes(s.id)).map(
                  (study) => (
                    <div
                      key={study.id}
                      className="p-3 rounded-2xl bg-[#12151e] border border-[#242b3b] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-[#f7f4ec] font-display-title">
                          {study.title}
                        </h4>
                        <p className="text-[11px] text-[#8cd6b3] font-serif-reading italic">
                          {study.reference}
                        </p>
                      </div>
                      <BookmarkCheck className="w-4 h-4 text-[#e5c158]" />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
