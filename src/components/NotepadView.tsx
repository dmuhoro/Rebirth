import React, { useState } from "react";
import {
  Sparkles,
  PenLine,
  Play,
  Bookmark,
  Check,
  RotateCcw,
  BookOpen,
  Volume2,
  Heart,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { TheologicalTheme, AIGeneratedGuidance } from "../types";
import { useDevotional } from "../context/DevotionalContext";

interface NotepadViewProps {
  onOpenPlayer: () => void;
  onNavigateToJournal: () => void;
}

const EMOTION_CHIPS = [
  { label: "Weary & Faint", theme: "spiritual_strength" as TheologicalTheme },
  { label: "Contrite / Seeking Cleansing", theme: "repentance_transformation" as TheologicalTheme },
  { label: "Seeking Awe of Christ", theme: "divinity_of_christ" as TheologicalTheme },
  { label: "Restless & Anxious", theme: "spiritual_strength" as TheologicalTheme },
  { label: "Guilt & Striving", theme: "repentance_transformation" as TheologicalTheme },
  { label: "Thankful & Worshipful", theme: "divinity_of_christ" as TheologicalTheme },
];

const SAMPLE_PROMPTS = [
  "I have been feeling deeply drained by daily pressures and find myself trying to carry everything by my own strength...",
  "I am struggling with guilt over failing repeatedly, and I feel ashamed to approach God in prayer...",
  "My view of Jesus has felt distant and small lately; help me understand His cosmic supremacy and uncreated divinity...",
];

export const NotepadView: React.FC<NotepadViewProps> = ({
  onOpenPlayer,
  onNavigateToJournal,
}) => {
  const { playTrack, addJournalEntry } = useDevotional();

  const [feelingsText, setFeelingsText] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("Weary & Faint");
  const [selectedTheme, setSelectedTheme] = useState<TheologicalTheme | "general">(
    "spiritual_strength"
  );
  const [loading, setLoading] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState<AIGeneratedGuidance | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSelectEmotion = (label: string, defaultTheme: TheologicalTheme) => {
    setSelectedEmotion(label);
    setSelectedTheme(defaultTheme);
  };

  const handleGenerate = async () => {
    if (!feelingsText.trim()) return;

    setLoading(true);
    setErrorNotice(null);
    setSavedEntryId(null);

    try {
      const response = await fetch("/api/spiritual-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryText: feelingsText.trim(),
          theme: selectedTheme,
          emotion: selectedEmotion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: AIGeneratedGuidance = await response.json();
      setGuidanceResult(data);

      // Auto-save to persistent journal
      const created = addJournalEntry(
        feelingsText.trim(),
        selectedTheme,
        selectedEmotion,
        data
      );
      setSavedEntryId(created.id);
    } catch (err: any) {
      console.error("Error generating guidance:", err);
      setErrorNotice("Could not connect to AI service. Using grounded theological counsel.");
    } finally {
      setLoading(false);
    }
  };

  const handleListenToPrayer = () => {
    if (!guidanceResult) return;

    const speechScript = `A Contemplative Prayer for your soul. Pastoral Counsel: ${guidanceResult.pastoralCounsel}. Scriptures of Assurance: ${guidanceResult.scriptures
      .map((s) => `${s.reference}: ${s.text}. ${s.theologicalContext}`)
      .join(". ")}. Let us pray together: ${guidanceResult.customPrayer}. Sacred Breath Prayer: ${guidanceResult.breathPrayer}`;

    playTrack({
      id: `prayer-${Date.now()}`,
      title: "Custom Generated Prayer",
      subtitle: `${selectedEmotion} • In the Name of Jesus`,
      theme: "prayer",
      fullText: speechScript,
      estimatedDuration: "4 mins",
    });
    onOpenPlayer();
  };

  return (
    <div className="pb-36 px-4 pt-2 max-w-md mx-auto space-y-5">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#191d29] to-[#12151f] border border-[#272e3f] shadow-sm">
        <div className="flex items-center space-x-1.5 text-[#e5c158] text-xs font-semibold uppercase tracking-wider mb-1">
          <PenLine className="w-3.5 h-3.5" />
          <span>Spiritual Notepad &amp; Prayer</span>
        </div>
        <h2 className="font-display-title text-base font-bold text-[#f7f4ec]">
          Pour Out Your Heart to God
        </h2>
        <p className="text-xs text-[#b8b3a4] mt-1 font-serif-reading leading-relaxed">
          Log your honest weariness, repentance, or longing. Our Christological AI assistant will formulate custom New Covenant prayers and scriptures.
        </p>
      </div>

      {/* Emotion Quick Chips */}
      <div>
        <label className="text-[11px] font-display-title font-bold uppercase tracking-wider text-[#9b9484] block mb-2">
          Current State of Heart
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EMOTION_CHIPS.map((chip) => {
            const isSelected = selectedEmotion === chip.label;
            return (
              <button
                key={chip.label}
                onClick={() => handleSelectEmotion(chip.label, chip.theme)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isSelected
                    ? "bg-[#d4af37] text-[#0c0e12] border-[#d4af37] font-bold shadow"
                    : "bg-[#141822] text-[#b8b3a4] border-[#252c3c] hover:text-white"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Focus Selector */}
      <div>
        <label className="text-[11px] font-display-title font-bold uppercase tracking-wider text-[#9b9484] block mb-2">
          Theological Anchor
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: "spiritual_strength", label: "Spiritual Strength", sub: "Waiting & Abiding" },
            { id: "repentance_transformation", label: "Repentance", sub: "Heart of Flesh" },
            { id: "divinity_of_christ", label: "Christ's Divinity", sub: "Logos & Bridge" },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => setSelectedTheme(th.id as TheologicalTheme)}
              className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-colors ${
                selectedTheme === th.id
                  ? "bg-[#1c2230] border-[#d4af37] text-[#f7f4ec]"
                  : "bg-[#131620] border-[#242b3a] text-[#8e897a] hover:text-[#c5c0b0]"
              }`}
            >
              <span className="text-[11px] font-semibold leading-tight block">
                {th.label}
              </span>
              <span className="text-[9px] text-[#7c7769] block mt-0.5 font-serif-reading">
                {th.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Journal Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-display-title font-bold uppercase tracking-wider text-[#9b9484]">
            Your Reflection / Burden
          </label>
          {feelingsText.length > 0 && (
            <button
              onClick={() => setFeelingsText("")}
              className="text-[11px] text-[#7c7769] hover:text-red-400"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          rows={5}
          value={feelingsText}
          onChange={(e) => setFeelingsText(e.target.value)}
          placeholder="Speak candidly before the Lord... Where do you feel dry, heavy, repentant, or in need of Christ's uncreated strength?"
          className="w-full p-4 rounded-2xl bg-[#12151e] border border-[#262d3e] text-sm text-[#f7f4ec] placeholder-[#6d685c] focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] font-serif-reading leading-relaxed resize-none shadow-inner"
        />

        {/* Sample Starters */}
        <div className="pt-1">
          <span className="text-[10px] text-[#7c7769] uppercase tracking-wider block mb-1">
            Tap a reflection prompt to populate:
          </span>
          <div className="space-y-1">
            {SAMPLE_PROMPTS.map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => setFeelingsText(prompt)}
                className="text-[11px] text-left text-[#9b9484] hover:text-[#e5c158] font-serif-reading italic block w-full truncate"
              >
                • "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <button
        disabled={loading || feelingsText.trim().length === 0}
        onClick={handleGenerate}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 ${
          feelingsText.trim().length === 0 || loading
            ? "bg-[#181d28] text-[#555d6e] cursor-not-allowed border border-[#242b3b]"
            : "bg-gradient-to-r from-[#f0ce6f] to-[#d4af37] text-[#0c0e12] hover:brightness-105"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Formulating Prayer &amp; Scripture...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-currentColor" />
            <span>Generate Custom Prayer &amp; Scripture</span>
          </>
        )}
      </button>

      {errorNotice && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Generated Spiritual Guidance Result */}
      {guidanceResult && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Custom Devotional Counsel
            </span>
            {savedEntryId && (
              <span className="text-[11px] text-[#58a66f] flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Saved to Journal
              </span>
            )}
          </div>

          {/* Pastoral Counsel */}
          <div className="p-4 rounded-2xl bg-[#131622] border border-[#273042] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9b9484] block">
              Pastoral Reflection
            </span>
            <p className="text-xs font-serif-reading text-[#e8e4d8] leading-relaxed whitespace-pre-line">
              {guidanceResult.pastoralCounsel}
            </p>
          </div>

          {/* Scripture Passages */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#d4af37] block">
              Targeted Scripture Promises
            </span>
            {guidanceResult.scriptures.map((sc, scIdx) => (
              <div
                key={scIdx}
                className="p-3 rounded-2xl bg-[#11141d] border border-[#212738] space-y-1.5"
              >
                <div className="text-xs font-bold text-[#8cd6b3]">{sc.reference}</div>
                <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed">
                  "{sc.text}"
                </p>
                <p className="text-[11px] text-[#9b9484] pt-1 border-t border-[#1d222e]">
                  {sc.theologicalContext}
                </p>
              </div>
            ))}
          </div>

          {/* Anointed Custom Prayer */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c2232] to-[#121520] border border-[#d4af37]/40 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#e5c158] flex items-center">
                <Heart className="w-3 h-3 mr-1" /> Custom Prayer in Jesus' Name
              </span>
              <button
                onClick={handleListenToPrayer}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e5c158] text-[#0c0e12] flex items-center space-x-1 shadow active:scale-95"
              >
                <Play className="w-3 h-3 fill-currentColor" />
                <span>Listen Out Loud</span>
              </button>
            </div>

            <p className="text-xs font-serif-reading italic text-[#f7edd4] leading-relaxed whitespace-pre-line">
              "{guidanceResult.customPrayer}"
            </p>

            {/* Breath prayer pill */}
            <div className="p-2.5 rounded-xl bg-[#0c0e12]/80 border border-[#d4af37]/30 text-center">
              <span className="text-[9px] uppercase font-bold text-[#d4af37] tracking-widest block mb-0.5">
                Breath Prayer for Stillness
              </span>
              <p className="text-xs font-serif-reading text-[#e5c158] italic">
                {guidanceResult.breathPrayer}
              </p>
            </div>
          </div>

          {/* Quick link to Journal */}
          <div className="text-center pt-2">
            <button
              onClick={onNavigateToJournal}
              className="text-xs font-semibold text-[#b8b3a4] hover:text-[#f7f4ec] underline"
            >
              View all saved prayers in Journal →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
