import React from "react";
import translations from "../../translations";
import { LeafIcon, BellIcon, UserIcon, BotIcon } from "../common/Icons";

export default function BottomNav({
  currentTab,
  onTabChange,
  onOpenAI,
  language = "en",
  unreadAlertsCount = 0
}) {
  const t = translations[language] || translations.en;

  const tabs = [
    {
      id: "dashboard",
      label: language === "hi" ? "होम" : language === "mr" ? "मुख्य" : "Home",
      icon: "🏠"
    },
    {
      id: "crops",
      label: language === "hi" ? "फसलें" : language === "mr" ? "पिके" : "Crops",
      icon: "🌾"
    },
    {
      id: "assistant",
      label: language === "hi" ? "सहायक" : language === "mr" ? "सहाय्यक" : "AI",
      icon: "🤖",
      isSpecial: true
    },
    {
      id: "alerts",
      label: language === "hi" ? "अलर्ट" : language === "mr" ? "सूचना" : "Alerts",
      icon: "🔔",
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null
    },
    {
      id: "profile",
      label: language === "hi" ? "प्रोफ़ाइल" : language === "mr" ? "प्रोफाइल" : "Profile",
      icon: "👤"
    }
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      <div className="bottom-nav-inner">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          
          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                type="button"
                className="bottom-nav-item bottom-nav-ai-btn"
                onClick={onOpenAI}
                aria-label="Open AI Assistant"
              >
                <div className="bottom-nav-ai-bubble">
                  <BotIcon size={20} />
                </div>
                <span className="bottom-nav-label">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="bottom-nav-icon-wrapper">
                <span className="bottom-nav-emoji">{tab.icon}</span>
                {tab.badge && <span className="bottom-nav-badge">{tab.badge}</span>}
              </div>
              <span className="bottom-nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
