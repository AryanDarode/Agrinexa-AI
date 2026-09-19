import React from "react";
import translations from "../../translations";
import { LeafIcon, BellIcon, UserIcon, BotIcon } from "../common/Icons";

export default function TopNav({
  currentTab,
  onTabChange,
  onOpenAI,
  farmerDetails,
  language = "en",
  onLanguageChange,
  unreadAlertsCount = 0,
  onSignOut
}) {
  const t = translations[language] || translations.en;

  const languages = [
    { code: "en", label: "EN", title: "English" },
    { code: "hi", label: "हिं", title: "हिन्दी" },
    { code: "mr", label: "मरा", title: "मराठी" }
  ];

  return (
    <header className="top-nav">
      <div className="top-nav-container">
        {/* Brand & Location */}
        <div className="top-nav-brand-group">
          <button
            type="button"
            className="brand-logo-btn"
            onClick={() => onTabChange?.("dashboard")}
            title={t.appName}
          >
            <span className="brand-icon-wrapper">
              <LeafIcon size={18} />
            </span>
            <div className="brand-text">
              <span className="brand-title">{t.appName}</span>
              <span className="brand-live-pulse" title="System Live"></span>
            </div>
          </button>

          {farmerDetails?.location && (
            <div className="location-chip" title={farmerDetails.location}>
              <span className="location-pin">📍</span>
              <span className="location-name">{farmerDetails.location}</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          <button
            type="button"
            className={`nav-link-btn ${currentTab === "dashboard" ? "active" : ""}`}
            onClick={() => onTabChange("dashboard")}
          >
            {t.home || "Dashboard"}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${currentTab === "crops" ? "active" : ""}`}
            onClick={() => onTabChange("crops")}
          >
            {t.recommendedCrops || "Crops"}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${currentTab === "history" ? "active" : ""}`}
            onClick={() => onTabChange("history")}
          >
            {t.farmHistory || "History"}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${currentTab === "alerts" ? "active" : ""}`}
            onClick={() => onTabChange("alerts")}
          >
            {t.alerts || "Alerts"}
            {unreadAlertsCount > 0 && (
              <span className="nav-badge">{unreadAlertsCount}</span>
            )}
          </button>
        </nav>

        {/* Action Controls */}
        <div className="top-nav-actions">
          {/* AI Assistant Quick Trigger */}
          <button
            type="button"
            className="ai-trigger-btn"
            onClick={onOpenAI}
            aria-label={t.aiAssistant || "AI Assistant"}
            title={t.aiAssistant || "AI Assistant"}
          >
            <BotIcon size={16} />
            <span className="ai-trigger-text">
              {language === "hi" ? "एआई सहायक" : language === "mr" ? "एआय सहाय्यक" : "AI Assistant"}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="lang-switcher" role="group" aria-label="Select Language">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-btn ${language === l.code ? "active" : ""}`}
                onClick={() => onLanguageChange(l.code)}
                title={l.title}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Profile Quick Button */}
          <button
            type="button"
            className={`profile-nav-btn ${currentTab === "profile" ? "active" : ""}`}
            onClick={() => onTabChange("profile")}
            aria-label="Farmer Profile"
            title={farmerDetails?.farmerName || "Farmer Profile"}
          >
            <UserIcon size={18} />
            {farmerDetails?.farmerName && (
              <span className="profile-nav-name">{farmerDetails.farmerName.split(" ")[0]}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
