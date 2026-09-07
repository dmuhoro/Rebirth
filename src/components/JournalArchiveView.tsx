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
  Bookmark,
  Sparkles,
  Quote,
} from "lucide-react";
import { useDevotional } from "../context/DevotionalContext";
import { LESSONS } from "../data/lessonsData";
import { SCRIPTURE_STUDIES } from "../data/scripturesData";
import { triggerHaptic } from "../utils/haptics";

interface JournalArchiveViewProps {
  onOpenPlayer: () => void;
  onOpenLesson: (lessonId: string) => void;
}

type ArchiveTab = "prayers" | "favorites" | "disciplines";

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

  const [activeTab, setActiveTab] = useState<ArchiveTab>("prayers");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);

  const favoriteEntries = journalEntries.filter((e) => favoriteEntryIds.includes(e.id));

  const handleTabChange = (tab: ArchiveTab) => {
    triggerHaptic("selection");
    setActiveTab(tab);
  };

  const handleToggleBookmark = (entryId: string) => {
    triggerHaptic("success");
    toggleFavoriteEntry(entryId);
  };

  const handleDelete = (entryId: string) => {
    triggerHaptic("warning");
    if (window.confirm("Remove this entry from your spiritual journal?")) {
      deleteJournalEntry(entryId);
    }
  };

  const handleListenToSavedPrayer = (entry: any) => {
    triggerHaptic("medium");
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
          <div
            onClick={() => handleTabChange("prayers")}
            className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center cursor-pointer hover:border-[#d4af37]/40 transition-colors"
          >
            <span className="text-sm font-bold text-[#e5c158] block">
              {journalEntries.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Prayers</span>
          </div>
          <div
            onClick={() => handleTabChange("favorites")}
            className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center cursor-pointer hover:border-[#d4af37]/40 transition-colors"
          >
            <span className="text-sm font-bold text-[#f3d37a] block">
              {favoriteEntries.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Favorites</span>
          </div>
          <div
            onClick={() => handleTabChange("disciplines")}
            className="p-2 rounded-xl bg-[#11141d] border border-[#212737] text-center cursor-pointer hover:border-[#d4af37]/40 transition-colors"
          >
            <span className="text-sm font-bold text-[#58a66f] block">
              {completedLessonIds.length}
            </span>
            <span className="text-[10px] text-[#8e897a] uppercase">Completed</span>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs with Dedicated Favorites Section */}
      <div className="flex rounded-2xl bg-[#12151e] border border-[#242b3b] p-1 gap-1">
        <button
          id="archive-tab-prayers"
          onClick={() => handleTabChange("prayers")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "prayers"
              ? "bg-[#1c2232] text-[#e5c158] shadow"
              : "text-[#8e897a] hover:text-white"
          }`}
        >
          All Prayers ({journalEntries.length})
        </button>
        <button
          id="archive-tab-favorites"
          onClick={() => handleTabChange("favorites")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1 ${
            activeTab === "favorites"
              ? "bg-[#252012] text-[#f3d37a] border border-[#d4af37]/40 shadow"
              : "text-[#8e897a] hover:text-[#f3d37a]"
          }`}
        >
          <Star className={`w-3 h-3 ${favoriteEntries.length > 0 ? "fill-currentColor text-[#e5c158]" : ""}`} />
          <span>Favorites ({favoriteEntries.length})</span>
        </button>
        <button
          id="archive-tab-disciplines"
          onClick={() => handleTabChange("disciplines")}
          className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "disciplines"
              ? "bg-[#1c2232] text-[#e5c158] shadow"
              : "text-[#8e897a] hover:text-white"
          }`}
        >
          Disciplines
        </button>
      </div>

      {/* Tab 1: All Prayers */}
      {activeTab === "prayers" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 text-xs text-[#8e897a]">
            <span>Recent Reflections &amp; Prayers</span>
            <span>{journalEntries.length} entries</span>
          </div>

          {journalEntries.length === 0 ? (
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
            journalEntries.map((entry) => {
              const isFavorite = favoriteEntryIds.includes(entry.id);
              const isExpanded = expandedEntryId === entry.id;

              return (
                <div
                  key={entry.id}
                  id={`journal-card-${entry.id}`}
                  className={`rounded-3xl bg-[#12151e] border overflow-hidden shadow-sm transition-all ${
                    isFavorite ? "border-[#d4af37]/40" : "border-[#232a3a]"
                  }`}
                >
                  <div
                    onClick={() => {
                      triggerHaptic("selection");
                      setExpandedEntryId(isExpanded ? null : entry.id);
                    }}
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
                        {/* Bookmark / Favorite button */}
                        <button
                          id={`bookmark-btn-${entry.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleBookmark(entry.id);
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            isFavorite
                              ? "text-[#e5c158] bg-[#292212]"
                              : "text-[#6b6555] hover:text-[#e5c158] hover:bg-[#1a202d]"
                          }`}
                          title={isFavorite ? "Remove from favorites" : "Bookmark this prayer"}
                          aria-label={isFavorite ? "Remove from favorites" : "Bookmark this prayer"}
                        >
                          <Star className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} />
                        </button>

                        <button
                          id={`delete-btn-${entry.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
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
      )}

      {/* Tab 2: Dedicated Favorites Section */}
      {activeTab === "favorites" && (
        <div className="space-y-3" id="favorites-section">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#211b0e] to-[#151720] border border-[#d4af37]/40">
            <div className="flex items-center space-x-2 text-[#e5c158] mb-1">
              <Star className="w-4 h-4 fill-currentColor" />
              <h3 className="font-display-title text-sm font-bold tracking-wide">
                Bookmarked Prayers &amp; Insights
              </h3>
            </div>
            <p className="text-xs text-[#c5c0b0] font-serif-reading">
              Sacred prayers and theological insights you have bookmarked for repeated meditation during walks, quiet hours, or work.
            </p>
          </div>

          {favoriteEntries.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#12151e] border border-[#242b3b] text-center space-y-3">
              <Star className="w-8 h-8 text-[#5c5647] mx-auto" />
              <h3 className="font-display-title text-sm font-semibold text-[#c5c0b0]">
                No Bookmarked Prayers Yet
              </h3>
              <p className="text-xs text-[#8e897a] font-serif-reading max-w-xs mx-auto">
                Tap the star icon on any prayer in the "All Prayers" list or generate new prayers in the Notepad to save them here for quick meditation.
              </p>
              <button
                onClick={() => handleTabChange("prayers")}
                className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a202d] text-[#e5c158] border border-[#d4af37]/30 hover:bg-[#252e42]"
              >
                <span>Browse All Prayers</span>
              </button>
            </div>
          ) : (
            favoriteEntries.map((entry) => (
              <div
                key={entry.id}
                id={`favorite-card-${entry.id}`}
                className="rounded-3xl bg-gradient-to-b from-[#171b26] to-[#11141c] border border-[#d4af37]/40 p-4 space-y-3 shadow-md"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#272111] text-[#f3d37a] border border-[#d4af37]/30">
                      {entry.emotionTag}
                    </span>
                    <span className="text-[11px] text-[#7c7769]">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(entry.id)}
                    className="flex items-center space-x-1 text-xs text-[#e5c158] bg-[#211c0f] px-2.5 py-1 rounded-full border border-[#d4af37]/30 hover:bg-[#2d2514]"
                    title="Remove from bookmarks"
                  >
                    <Star className="w-3.5 h-3.5 fill-currentColor" />
                    <span>Bookmarked</span>
                  </button>
                </div>

                {/* Original Reflection */}
                <div className="p-2.5 rounded-xl bg-[#0c0e12]/60 border border-[#212735]">
                  <span className="text-[10px] uppercase tracking-wider text-[#8e897a] block mb-0.5">
                    Your Reflection
                  </span>
                  <p className="text-xs font-serif-reading italic text-[#e8e4d8]">
                    "{entry.feelings}"
                  </p>
                </div>

                {/* Custom Anointed Prayer Highlight */}
                <div className="p-3.5 rounded-2xl bg-[#141824] border-l-4 border-[#d4af37] border-y border-r border-[#262c3b] space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#e5c158] flex items-center">
                    <Quote className="w-3 h-3 mr-1" /> Custom Prayer
                  </span>
                  <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed whitespace-pre-line">
                    "{entry.guidance.customPrayer}"
                  </p>
                </div>

                {/* Breath Prayer */}
                <div className="p-2 rounded-xl bg-[#0e1118] border border-[#232a3a] text-center">
                  <span className="text-[9px] uppercase font-bold text-[#d4af37] block mb-0.5">
                    Contemplative Breath Prayer
                  </span>
                  <p className="text-xs font-serif-reading italic text-[#d8d3c5]">
                    {entry.guidance.breathPrayer}
                  </p>
                </div>

                {/* Listen Action */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleListenToSavedPrayer(entry)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#c59e2b] text-[#0d1017] font-semibold text-xs flex items-center justify-center space-x-1.5 shadow active:scale-[0.98] transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-currentColor" />
                    <span>Listen to Prayer (TTS)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Completed Lessons & Bookmarked Scriptures */}
      {activeTab === "disciplines" && (
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

