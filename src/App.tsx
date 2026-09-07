import React, { useState } from "react";
import { DevotionalProvider } from "./context/DevotionalContext";
import { Header } from "./components/Header";
import { NavigationTabs, TabId } from "./components/NavigationTabs";
import { LessonsView } from "./components/LessonsView";
import { ScripturesView } from "./components/ScripturesView";
import { NotepadView } from "./components/NotepadView";
import { JournalArchiveView } from "./components/JournalArchiveView";
import { AudioPlayerBar } from "./components/AudioPlayerBar";

function DevotionalApp() {
  const [activeTab, setActiveTab] = useState<TabId>("lessons");
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-[#f7f4ec] flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#f7edd4]">
      {/* Top Header */}
      <Header onOpenPlayer={() => setIsPlayerExpanded(true)} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto relative pt-2">
        {activeTab === "lessons" && (
          <LessonsView onOpenPlayer={() => setIsPlayerExpanded(true)} />
        )}
        {activeTab === "scriptures" && (
          <ScripturesView onOpenPlayer={() => setIsPlayerExpanded(true)} />
        )}
        {activeTab === "notepad" && (
          <NotepadView
            onOpenPlayer={() => setIsPlayerExpanded(true)}
            onNavigateToJournal={() => setActiveTab("journal")}
          />
        )}
        {activeTab === "journal" && (
          <JournalArchiveView
            onOpenPlayer={() => setIsPlayerExpanded(true)}
            onOpenLesson={(_lessonId) => setActiveTab("lessons")}
          />
        )}
      </main>

      {/* Floating Hands-Free Audio Player Bar */}
      <AudioPlayerBar
        isExpanded={isPlayerExpanded}
        setIsExpanded={setIsPlayerExpanded}
      />

      {/* Fixed Android Thumb Navigation */}
      <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <DevotionalProvider>
      <DevotionalApp />
    </DevotionalProvider>
  );
}
