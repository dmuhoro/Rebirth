import React, { useState, useEffect } from "react";
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
  Star,
  Quote,
} from "lucide-react";
import { TheologicalTheme, AIGeneratedGuidance } from "../types";
import { useDevotional } from "../context/DevotionalContext";
import { resolveApiPath } from "../lib/apiTransport";
import { triggerHaptic } from "../utils/haptics";
import { CrisisSupportResponse } from "../utils/crisisSupport";

interface NotepadViewProps {
  onOpenPlayer: () => void;
  onNavigateToJournal: () => void;
  initialVersePrompt?: string | null;
  initialTheme?: TheologicalTheme | null;
  onClearInitialPrompt?: () => void;
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

function isCrisisSupportResponse(value: unknown): value is CrisisSupportResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  return (
    response.crisisDetected === true &&
    typeof response.title === "string" &&
    typeof response.message === "string" &&
    Array.isArray(response.resources) &&
    response.resources.every(
      (resource: unknown) =>
        typeof resource === "object" &&
        resource !== null &&
        "label" in resource &&
        typeof resource.label === "string" &&
        "href" in resource &&
        typeof resource.href === "string" &&
        resource.href.startsWith("https://"),
    )
  );
}

function isGuidanceResponse(value: unknown): value is AIGeneratedGuidance {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  return (
    typeof response.pastoralCounsel === "string" &&
    typeof response.customPrayer === "string" &&
    typeof response.breathPrayer === "string" &&
    Array.isArray(response.scriptures) &&
    response.scriptures.every(
      (scripture: unknown) =>
        typeof scripture === "object" &&
        scripture !== null &&
        "reference" in scripture &&
        typeof scripture.reference === "string" &&
        "text" in scripture &&
        typeof scripture.text === "string" &&
        "theologicalContext" in scripture &&
        typeof scripture.theologicalContext === "string",
    )
  );
}

export const NotepadView: React.FC<NotepadViewProps> = ({
  onOpenPlayer,
  onNavigateToJournal,
  initialVersePrompt,
  initialTheme,
  onClearInitialPrompt,
}) => {
  const {
    playTrack,
    addJournalEntry,
    toggleFavoriteEntry,
    favoriteEntryIds,
    localDataResetToken,
  } = useDevotional();

  const [feelingsText, setFeelingsText] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("Weary & Faint");
  const [selectedTheme, setSelectedTheme] = useState<TheologicalTheme | "general">(
    "spiritual_strength"
  );
  const [loading, setLoading] = useState(false);
  const [guidanceResult, setGuidanceResult] = useState<AIGeneratedGuidance | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [crisisSupport, setCrisisSupport] = useState<CrisisSupportResponse | null>(null);
  const [hasAiConsent, setHasAiConsent] = useState(false);

  const updateFeelingsText = (value: string) => {
    setFeelingsText(value);
    setHasAiConsent(false);
  };

  // Pre-populate when initialVersePrompt is passed from Daily Contemplation
  useEffect(() => {
    if (initialVersePrompt) {
      setFeelingsText(initialVersePrompt);
      if (initialTheme) {
        setSelectedTheme(initialTheme);
        if (initialTheme === "spiritual_strength") setSelectedEmotion("Weary & Faint");
        else if (initialTheme === "repentance_transformation") setSelectedEmotion("Contrite / Seeking Cleansing");
        else if (initialTheme === "divinity_of_christ") setSelectedEmotion("Seeking Awe of Christ");
      }
    }
  }, [initialVersePrompt, initialTheme]);

  useEffect(() => {
    if (localDataResetToken === 0) return;
    setFeelingsText("");
    setGuidanceResult(null);
    setSavedEntryId(null);
    setErrorNotice(null);
    setCrisisSupport(null);
    setHasAiConsent(false);
    onClearInitialPrompt?.();
  }, [localDataResetToken, onClearInitialPrompt]);

  const handleSelectEmotion = (label: string, defaultTheme: TheologicalTheme) => {
    triggerHaptic("selection");
    setSelectedEmotion(label);
    setSelectedTheme(defaultTheme);
  };

  const handleSelectTheme = (thId: TheologicalTheme) => {
    triggerHaptic("selection");
    setSelectedTheme(thId);
  };

  const handleGenerate = async () => {
    if (!feelingsText.trim() || !hasAiConsent) return;

    triggerHaptic("medium");
    setLoading(true);
    setErrorNotice(null);
    setSavedEntryId(null);
    setGuidanceResult(null);
    setCrisisSupport(null);

    try {
      const response = await fetch(resolveApiPath("/api/counsel"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryText: feelingsText.trim(),
          theme: selectedTheme,
          emotion: selectedEmotion,
        }),
      });

      if (!response.ok) {
        throw new Error("Counsel request failed.");
      }

      const data: unknown = await response.json();
      if (isCrisisSupportResponse(data)) {
        setCrisisSupport(data);
        triggerHaptic("warning");
        return;
      }
      if (!isGuidanceResponse(data)) {
        throw new Error("Counsel response was invalid.");
      }
      setGuidanceResult(data);

      // Auto-save to persistent journal
      const created = addJournalEntry(
        feelingsText.trim(),
        selectedTheme,
        selectedEmotion,
        data
      );
      setSavedEntryId(created.id);
      triggerHaptic("success");
    } catch (err: unknown) {
      console.error("Error generating guidance:", err);
      setCrisisSupport(null);
      setErrorNotice(
        "A response could not be generated. Your reflection is still here and was not saved. Check your connection and retry.",
      );
      triggerHaptic("warning");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = () => {
    if (!savedEntryId) return;
    triggerHaptic("success");
    toggleFavoriteEntry(savedEntryId);
  };

  const isSavedEntryFavorite = savedEntryId ? favoriteEntryIds.includes(savedEntryId) : false;

  const handleListenToPrayer = () => {
    if (!guidanceResult) return;
    triggerHaptic("medium");

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

      {/* Pre-populated Daily Verse Alert Banner */}
      {initialVersePrompt && (
        <div className="p-3.5 rounded-2xl bg-[#1e1b12] border border-[#d4af37]/40 flex items-start justify-between gap-2 shadow-sm">
          <div className="flex items-start space-x-2">
            <Quote className="w-4 h-4 text-[#e5c158] mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-[#e5c158] uppercase tracking-wider block">
                Reflecting on Daily Contemplation
              </span>
              <p className="text-xs text-[#c9c4b7] font-serif-reading mt-0.5">
                Pre-populated from today's Scripture. Add your personal reflections below and tap Generate.
              </p>
            </div>
          </div>
          {onClearInitialPrompt && (
            <button
              onClick={() => {
                triggerHaptic("selection");
                onClearInitialPrompt();
                setFeelingsText("");
              }}
              className="text-[11px] text-[#9b9484] hover:text-[#f7f4ec] px-2 py-0.5 rounded bg-[#2b2518]"
            >
              Clear
            </button>
          )}
        </div>
      )}

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
              onClick={() => handleSelectTheme(th.id as TheologicalTheme)}
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
              onClick={() => {
                triggerHaptic("selection");
                updateFeelingsText("");
                if (onClearInitialPrompt) onClearInitialPrompt();
              }}
              className="text-[11px] text-[#7c7769] hover:text-red-400"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          id="notepad-feelings-input"
          rows={5}
          value={feelingsText}
          onChange={(e) => updateFeelingsText(e.target.value)}
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
                onClick={() => {
                  triggerHaptic("selection");
                  updateFeelingsText(prompt);
                }}
                className="text-[11px] text-left text-[#9b9484] hover:text-[#e5c158] font-serif-reading italic block w-full truncate"
              >
                • "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-[#353023] bg-[#11141a] p-3">
        <p className="text-xs leading-relaxed text-[#c9c4b7]">
          Your reflection is sent to the Rebirth server when you choose to
          generate. It may be processed by Google Gemini when that service is
          configured. A successful response is saved in this device&apos;s
          journal; it is not copied to your cloud backup unless you choose to
          import it.
          {" "}
          <a
            href="https://github.com/dmuhoro/Rebirth#privacy"
            target="_blank"
            rel="noreferrer"
            className="text-[#e5c158] underline"
          >
            Learn more about privacy
          </a>
          .
        </p>
        <label className="flex min-h-11 items-center gap-2 text-xs text-[#f7f4ec]">
          <input
            type="checkbox"
            checked={hasAiConsent}
            onChange={(event) => setHasAiConsent(event.target.checked)}
            className="h-4 w-4 accent-[#d4af37]"
          />
          I understand and want to send this reflection for a response.
        </label>
      </div>

      {/* Generate Action Button */}
      <button
        id="notepad-generate-btn"
        disabled={loading || feelingsText.trim().length === 0 || !hasAiConsent}
        onClick={handleGenerate}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-95 ${
          feelingsText.trim().length === 0 || loading || !hasAiConsent
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
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errorNotice}
          </span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !hasAiConsent}
            className="min-h-11 shrink-0 rounded-lg border border-amber-300/40 px-3 font-semibold hover:bg-amber-100/10 disabled:opacity-50"
          >
            Retry
          </button>
        </div>
      )}

      {crisisSupport && (
        <section
          aria-live="assertive"
          className="space-y-3 rounded-2xl border border-rose-300/40 bg-rose-950/40 p-4 text-rose-50"
        >
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {crisisSupport.title}
          </h3>
          <p className="text-sm leading-relaxed">{crisisSupport.message}</p>
          <ul className="space-y-2">
            {crisisSupport.resources.map((resource) => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-11 inline-flex items-center text-sm font-semibold text-rose-200 underline"
                >
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Generated Spiritual Guidance Result */}
      {guidanceResult && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d4af37] flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Custom Devotional Counsel
            </span>
            <div className="flex items-center space-x-2">
              {savedEntryId && (
                <button
                  id="notepad-bookmark-btn"
                  onClick={handleToggleBookmark}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 transition-all active:scale-95 ${
                    isSavedEntryFavorite
                      ? "bg-[#252011] border-[#d4af37] text-[#e5c158]"
                      : "bg-[#161a25] border-[#293245] text-[#b8b3a4] hover:text-white"
                  }`}
                  title="Bookmark this prayer to Favorites"
                >
                  <Star className={`w-3.5 h-3.5 ${isSavedEntryFavorite ? "fill-currentColor text-[#e5c158]" : ""}`} />
                  <span>{isSavedEntryFavorite ? "Bookmarked in Favorites" : "Bookmark Prayer"}</span>
                </button>
              )}
              {savedEntryId && (
                <span className="text-[11px] text-[#58a66f] flex items-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> Saved
                </span>
              )}
            </div>
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
                id="notepad-listen-prayer-btn"
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

          {/* Quick link to Journal & Favorites */}
          <div className="text-center pt-2 flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                triggerHaptic("selection");
                onNavigateToJournal();
              }}
              className="text-xs font-semibold text-[#b8b3a4] hover:text-[#f7f4ec] underline"
            >
              View in Journal Archive →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
