import React, { useState } from "react";

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    greeting: "Hello, Farmer! 👋",
    desc: "Smart farming made simple",
    icon: "🇬🇧",
    sample: "Welcome to Agrinexa AI"
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    greeting: "नमस्ते, किसान! 👋",
    desc: "किसानों के लिए स्मार्ट खेती",
    icon: "🇮🇳",
    sample: "एग्रीनेक्सा एआई में आपका स्वागत है"
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    greeting: "नमस्कार, शेतकरी! 👋",
    desc: "शेतकऱ्यांसाठी स्मार्ट शेती",
    icon: "🇮🇳",
    sample: "अ‍ॅग्रीनेक्सा एआयमध्ये आपले स्वागत आहे"
  }
];

export default function LanguageSelection({ onLanguageSelect }) {
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const handleSelect = (code) => {
    setSelected(code);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 400));
    onLanguageSelect(selected);
  };

  const selectedLang = LANGUAGES.find((l) => l.code === selected);

  return (
    <div className="lang-sel-page">
      {/* Decorative Background */}
      <div className="lang-sel-bg" aria-hidden="true">
        <div className="lang-bg-blob lang-bg-blob-1" />
        <div className="lang-bg-blob lang-bg-blob-2" />
      </div>

      <div className="lang-sel-content">
        {/* Brand */}
        <div className="lang-brand-row">
          <div className="lang-brand-dot">🌱</div>
          <span className="lang-brand-label">Agrinexa AI</span>
        </div>

        {/* Heading */}
        <div className="lang-heading-block">
          <div className="lang-globe-icon">🌐</div>
          <h1 className="lang-heading">
            Choose Your Language
            <span className="lang-heading-sub">
              <br />अपनी भाषा चुनें • तुमची भाषा निवडा
            </span>
          </h1>
          <p className="lang-heading-desc">
            Select the language you're most comfortable with. You can change this anytime from your profile.
          </p>
        </div>

        {/* Language Cards */}
        <div className="lang-cards-grid">
          {LANGUAGES.map((lang) => {
            const isActive = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-card ${isActive ? "lang-card-active" : ""}`}
                onClick={() => handleSelect(lang.code)}
                aria-pressed={isActive}
              >
                <div className="lang-card-flag">{lang.icon}</div>

                <div className="lang-card-body">
                  <div className="lang-card-names">
                    <span className="lang-card-native">{lang.nativeName}</span>
                    <span className="lang-card-english">{lang.name}</span>
                  </div>
                  <p className="lang-card-desc">{lang.desc}</p>
                  <div className="lang-card-sample">{lang.sample}</div>
                </div>

                <div className={`lang-card-selector ${isActive ? "selected" : ""}`}>
                  {isActive ? "✓" : ""}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview of selected language */}
        {selectedLang && (
          <div className="lang-preview-toast">
            <span className="lang-preview-wave">{selectedLang.greeting}</span>
            <span className="lang-preview-label">
              App will use <strong>{selectedLang.nativeName}</strong> throughout
            </span>
          </div>
        )}

        {/* Confirm Button */}
        <button
          type="button"
          className={`lang-confirm-btn ${selected ? "active" : "disabled"}`}
          disabled={!selected || confirming}
          onClick={handleConfirm}
        >
          {confirming ? (
            <span className="auth-btn-loader">
              <span className="auth-spinner" style={{ borderTopColor: "#fff" }} />
              Setting up...
            </span>
          ) : selected ? (
            `Continue in ${selectedLang?.nativeName} →`
          ) : (
            "Select a language to continue"
          )}
        </button>

        <p className="lang-privacy-note">
          🔒 Your preference is saved locally and can be changed anytime from Profile Settings.
        </p>
      </div>
    </div>
  );
}