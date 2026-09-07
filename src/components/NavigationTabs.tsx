import React from "react";
import { Headphones, BookMarked, PenLine, BookmarkCheck } from "lucide-react";
import { triggerHaptic } from "../utils/haptics";

export type TabId = "lessons" | "scriptures" | "notepad" | "journal";

interface NavigationTabsProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: "lessons" as TabId,
      label: "Lessons",
      sublabel: "Audio Guides",
      icon: Headphones,
    },
    {
      id: "scriptures" as TabId,
      label: "Scripture",
      sublabel: "Exegesis",
      icon: BookMarked,
    },
    {
      id: "notepad" as TabId,
      label: "Notepad & AI",
      sublabel: "Custom Prayer",
      icon: PenLine,
    },
    {
      id: "journal" as TabId,
      label: "Journal",
      sublabel: "Saved & History",
      icon: BookmarkCheck,
    },
  ];

  const handleTabClick = (tabId: TabId) => {
    triggerHaptic("selection");
    onSelectTab(tabId);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#0c0e12]/95 backdrop-blur-md border-t border-[#212631] py-1.5 px-2"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? "bg-[#181d26] text-[#e5c158] font-semibold shadow-inner"
                  : "text-[#8e897a] hover:text-[#c5c0b0] active:scale-95"
              }`}
              style={{ minHeight: "48px" }}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-transform ${
                  isActive ? "scale-110 text-[#e5c158]" : "text-[#8e897a]"
                }`}
              />
              <span className="text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
