import React, { useState, useEffect } from "react";
import { getTranslation } from "./translations";

const DISTRICT_CHIPS = [
  { name: "Pune", mr: "पुणे", hi: "पुणे" },
  { name: "Nashik", mr: "नाशिक", hi: "नासिक" },
  { name: "Kolhapur", mr: "कोल्हापूर", hi: "कोल्हापुर" },
  { name: "Satara", mr: "सातारा", hi: "सतारा" },
  { name: "Solapur", mr: "सोलापूर", hi: "सोलापुर" },
  { name: "Chhatrapati Sambhajinagar", mr: "छत्रपती संभाजीनगर", hi: "छत्रपति संभाजीनगर" },
  { name: "Nagpur", mr: "नागपूर", hi: "नागपुर" },
  { name: "Amravati", mr: "अमरावती", hi: "अमरावती" },
  { name: "Jalgaon", mr: "जळगाव", hi: "जलगांव" },
  { name: "Ahilyanagar", mr: "अहिल्यानगर", hi: "अहिल्यानगर" },
];

const ACRE_CHIPS = ["1", "2", "3", "5", "8", "10", "15"];

const SEASONS = [
  {
    id: "Kharif",
    icon: "🌧️",
    title: { en: "Kharif", mr: "खरीप", hi: "खरीफ" },
    desc: { en: "Monsoon (June - Oct)", mr: "पावसाळी हंगाम (जून ते ऑक्टो)", hi: "मानसून मौसम (जून - अक्टू)" },
  },
  {
    id: "Rabi",
    icon: "❄️",
    title: { en: "Rabi", mr: "रब्बी", hi: "रबी" },
    desc: { en: "Winter (Oct - March)", mr: "हिवाळी हंगाम (ऑक्टो ते मार्च)", hi: "सर्दियों का मौसम (अक्टू - मार्च)" },
  },
  {
    id: "Whole Year",
    icon: "☀️",
    title: { en: "Whole Year", mr: "बारमाही", hi: "पूरे साल" },
    desc: { en: "Annual / Perennial", mr: "वार्षिक / उन्हाळी पिके", hi: "वार्षिक / ग्रीष्मकालीन फसलें" },
  },
];

const CROPS = [
  { id: "Soybean", icon: "🌿", name: { en: "Soybean", mr: "सोयाबीन", hi: "सोयाबीन" } },
  { id: "Cotton", icon: "☁️", name: { en: "Cotton", mr: "कापूस", hi: "कपास" } },
  { id: "Rice", icon: "🌾", name: { en: "Rice", mr: "भात (तांदूळ)", hi: "चावल (धान)" } },
  { id: "Sugarcane", icon: "🎋", name: { en: "Sugarcane", mr: "ऊस", hi: "गन्ना" } },
  { id: "Wheat", icon: "🌾", name: { en: "Wheat", mr: "गहू", hi: "गेहूं" } },
  { id: "Maize", icon: "🌽", name: { en: "Maize", mr: "मका", hi: "मक्का" } },
  { id: "Groundnut", icon: "🥜", name: { en: "Groundnut", mr: "भुईमूग", hi: "मूंगफली" } },
  { id: "Tur", icon: "🫘", name: { en: "Tur / Arhar", mr: "तूर", hi: "अरहर (तूर)" } },
  { id: "Gram", icon: "🫘", name: { en: "Gram / Chana", mr: "हरभरा (चना)", hi: "चना" } },
  { id: "Onion", icon: "🧅", name: { en: "Onion", mr: "कांदा", hi: "प्याज़" } },
  { id: "Turmeric", icon: "🫚", name: { en: "Turmeric", mr: "हळद", hi: "हल्दी" } },
  { id: "Ginger", icon: "🫚", name: { en: "Ginger", mr: "आले", hi: "अदरक" } },
  { id: "Moong", icon: "🫘", name: { en: "Moong", mr: "मूग", hi: "मूंग" } },
  { id: "Urad", icon: "🫘", name: { en: "Urad", mr: "उडीद", hi: "उड़द" } },
  { id: "Jowar", icon: "🌾", name: { en: "Jowar", mr: "ज्वारी", hi: "ज्वार" } },
];

export default function FarmerSetup({ onComplete, language = "en", mobile: initialMobile = "" }) {
  const [step, setStep] = useState(1);
  const [farmerName, setFarmerName] = useState("");
  const [mobile, setMobile] = useState(initialMobile || localStorage.getItem("agrinexa_mobile") || "");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [crop, setCrop] = useState("Soybean");
  const [sowingDate, setSowingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const t = (key) => getTranslation(language || "en", key);
  const isMr = language === "mr";
  const isHi = language === "hi";

  // If initialMobile changes, update state
  useEffect(() => {
    if (initialMobile && !mobile) {
      setMobile(initialMobile);
    }
  }, [initialMobile]);

  // Validation per step
  const handleNextStep = () => {
    setErrorMsg("");

    if (step === 1) {
      if (!farmerName.trim()) {
        setErrorMsg(isMr ? "कृपया आपले पूर्ण नाव लिहा." : isHi ? "कृपया अपना पूरा नाम लिखें।" : "Please enter your full name.");
        return;
      }
      if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
        setErrorMsg(isMr ? "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा." : isHi ? "कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!location.trim()) {
        setErrorMsg(isMr ? "कृपया शेताचे गाव किंवा जिल्हा निवडा." : isHi ? "कृपया अपने खेत का गांव या जिला चुनें।" : "Please enter or select your farm location / district.");
        return;
      }
      const numArea = parseFloat(area);
      if (!area || isNaN(numArea) || numArea <= 0) {
        setErrorMsg(isMr ? "कृपया वैध शेत क्षेत्रफळ (एकरमध्ये) प्रविष्ट करा." : isHi ? "कृपया वैध खेत का क्षेत्रफल (एकड़ में) दर्ज करें।" : "Please enter a valid farm area in acres.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setSowingDate(today);
  };

  // Submit to Backend
  const handleFinalSubmit = async () => {
    setErrorMsg("");

    if (!farmerName.trim() || !mobile.trim() || !location.trim() || !area || !season || !crop || !sowingDate) {
      setErrorMsg(isMr ? "कृपया सर्व माहिती पूर्ण भरा." : isHi ? "कृपया सभी विवरण भरें।" : "Please complete all farm details.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        farmer_name: farmerName.trim(),
        mobile: mobile.trim(),
        location: location.trim(),
        area: parseFloat(area),
        season: season,
        crop: crop,
        sowing_date: sowingDate,
      };

      let farmerData = null;

      try {
        const response = await fetch("http://127.0.0.1:8000/api/farmers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          farmerData = await response.json();
        } else {
          console.warn("Backend returned non-200, creating local profile");
        }
      } catch (netErr) {
        console.warn("Backend offline or unreachable, proceeding with offline profile:", netErr);
      }

      // If backend succeeded, use backend data; otherwise, generate reliable local session
      const finalProfile = farmerData
        ? {
            id: farmerData.id,
            farmerName: farmerData.farmer_name,
            mobile: farmerData.mobile,
            location: farmerData.location,
            area: farmerData.area,
            season: farmerData.season,
            crop: farmerData.crop,
            sowingDate: farmerData.sowing_date,
          }
        : {
            id: Date.now(),
            farmerName: payload.farmer_name,
            mobile: payload.mobile,
            location: payload.location,
            area: payload.area,
            season: payload.season,
            crop: payload.crop,
            sowingDate: payload.sowing_date,
          };

      // Save to localStorage
      localStorage.setItem("agrinexa_farmer_id", finalProfile.id.toString());
      localStorage.setItem("agrinexa_mobile", finalProfile.mobile);

      onComplete(finalProfile);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg(isMr ? "माहिती जतन करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा." : isHi ? "प्रोफाइल सहेजने में त्रुटि। कृपया पुनः प्रयास करें।" : "Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      {/* Decorative ambient background */}
      <div className="setup-bg-art" aria-hidden="true">
        <div className="setup-bg-circle-1" />
        <div className="setup-bg-circle-2" />
      </div>

      <div className="setup-container">
        {/* Brand bar */}
        <div className="setup-brand-bar">
          <div className="setup-brand-badge">
            <span>🌱</span>
            <span>Agrinexa AI</span>
          </div>
          <span className="setup-lang-badge">
            {isMr ? "🇮🇳 मराठी" : isHi ? "🇮🇳 हिन्दी" : "🇬🇧 English"}
          </span>
        </div>

        {/* Card */}
        <div className="setup-card">
          {/* Header */}
          <div className="setup-header">
            <h1>
              {isMr
                ? "तुमच्या शेताची माहिती भरूया"
                : isHi
                ? "आपके खेत की जानकारी भरें"
                : "Let's set up your farm"}
            </h1>
            <p>
              {isMr
                ? "तुमच्या शेताची माहिती द्या, जेणेकरून अ‍ॅग्रीनेक्सा AI तुम्हाला अचूक शिफारसी देऊ शकेल."
                : isHi
                ? "अपने खेत की जानकारी दें ताकि एग्रीनेक्सा AI आपको सटीक मार्गदर्शन दे सके।"
                : "Enter your farm details so Agrinexa AI can provide tailored weather, soil, and crop guidance."}
            </p>
          </div>

          {/* Interactive Stepper */}
          <div className="setup-stepper">
            <button
              type="button"
              className={`setup-step-item ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}
              onClick={() => setStep(1)}
            >
              <div className="setup-step-circle">
                {step > 1 ? "✓" : "1"}
              </div>
              <span className="setup-step-title">
                {isMr ? "शेतकरी माहिती" : isHi ? "किसान विवरण" : "Farmer Profile"}
              </span>
            </button>

            <div className="setup-stepper-line">
              <div
                className="setup-stepper-line-fill"
                style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
              />
            </div>

            <button
              type="button"
              className={`setup-step-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}
              onClick={() => {
                if (farmerName && mobile) setStep(2);
              }}
            >
              <div className="setup-step-circle">
                {step > 2 ? "✓" : "2"}
              </div>
              <span className="setup-step-title">
                {isMr ? "शेताचा तपशील" : isHi ? "खेत विवरण" : "Land & Location"}
              </span>
            </button>

            <div className="setup-stepper-line">
              <div
                className="setup-stepper-line-fill"
                style={{ width: step <= 2 ? "0%" : "100%" }}
              />
            </div>

            <button
              type="button"
              className={`setup-step-item ${step === 3 ? "active" : ""}`}
              onClick={() => {
                if (farmerName && mobile && location && area) setStep(3);
              }}
            >
              <div className="setup-step-circle">3</div>
              <span className="setup-step-title">
                {isMr ? "पीक व हंगाम" : isHi ? "फसल और मौसम" : "Crop & Season"}
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="setup-error-banner" role="alert">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: FARMER INFORMATION */}
          {step === 1 && (
            <div className="setup-form-panel">
              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "शेतकऱ्याचे पूर्ण नाव" : isHi ? "किसान का पूरा नाम" : "Farmer's Full Name"}</span>
                  <span className="setup-label-badge">* {isMr ? "आवश्यक" : isHi ? "अनिवार्य" : "Required"}</span>
                </label>
                <div className="setup-input-wrap">
                  <span className="setup-input-icon">👤</span>
                  <input
                    type="text"
                    className="setup-input"
                    placeholder={isMr ? "उदा. रमेश तुकाराम पाटील" : isHi ? "उदा. रमेश तुकाराम पाटिल" : "e.g. Ramesh Tukaram Patil"}
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "मोबाईल क्रमांक" : isHi ? "मोबाइल नंबर" : "Mobile Number"}</span>
                  {initialMobile ? (
                    <span className="setup-label-badge">✓ {isMr ? "सत्यापित" : isHi ? "सत्यापित" : "Verified"}</span>
                  ) : (
                    <span className="setup-label-badge">* 10 digits</span>
                  )}
                </label>
                <div className="setup-input-wrap">
                  <span className="setup-input-icon">📱</span>
                  <input
                    type="tel"
                    className="setup-input"
                    placeholder="9876543210"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="setup-actions">
                <div />
                <button
                  type="button"
                  className="setup-primary-btn"
                  onClick={handleNextStep}
                >
                  <span>{isMr ? "शेताचा तपशील भरा →" : isHi ? "खेत का विवरण भरें →" : "Next: Land Details →"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LAND & LOCATION */}
          {step === 2 && (
            <div className="setup-form-panel">
              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "गाव / तालुका / जिल्हा" : isHi ? "गांव / तालुका / जिला" : "Farm Location / District"}</span>
                  <span className="setup-label-badge">{isMr ? "महाराष्ट्र" : "Maharashtra"}</span>
                </label>
                <div className="setup-input-wrap">
                  <span className="setup-input-icon">📍</span>
                  <input
                    type="text"
                    className="setup-input"
                    placeholder={isMr ? "जिल्हा किंवा गावाचे नाव लिहा (उदा. Pune, Nashik)" : "Enter village or district name (e.g. Pune)"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Popular district chips */}
                <div className="setup-chips-row">
                  <span className="setup-chip-label">{isMr ? "लोकप्रिय:" : "Popular:"}</span>
                  {DISTRICT_CHIPS.map((dist) => (
                    <button
                      key={dist.name}
                      type="button"
                      className={`setup-chip ${location.toLowerCase() === dist.name.toLowerCase() ? "selected" : ""}`}
                      onClick={() => setLocation(dist.name)}
                    >
                      {isMr ? dist.mr : isHi ? dist.hi : dist.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "शेताचे क्षेत्रफळ (एकर)" : isHi ? "खेत का क्षेत्रफल (एकड़)" : "Farm Area (Acres)"}</span>
                  <span className="setup-label-badge">{isMr ? "एकरमध्ये" : "In Acres"}</span>
                </label>
                <div className="setup-input-wrap">
                  <span className="setup-input-icon">📐</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className="setup-input"
                    placeholder={isMr ? "उदा. 2.5" : "e.g. 2.5"}
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>

                {/* Quick acre chips */}
                <div className="setup-chips-row">
                  <span className="setup-chip-label">{isMr ? "त्वरित निवडा:" : "Quick pick:"}</span>
                  {ACRE_CHIPS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`setup-chip ${area === val ? "selected" : ""}`}
                      onClick={() => setArea(val)}
                    >
                      {val} {isMr ? "एकर" : isHi ? "एकड़" : "Acres"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="setup-actions">
                <button
                  type="button"
                  className="setup-back-btn"
                  onClick={handlePrevStep}
                >
                  {isMr ? "← मागे या" : isHi ? "← पीछे" : "← Back"}
                </button>
                <button
                  type="button"
                  className="setup-primary-btn"
                  onClick={handleNextStep}
                >
                  <span>{isMr ? "पीक तपशील भरा →" : isHi ? "फसल विवरण भरें →" : "Next: Crop Details →"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CROP & SOWING DETAILS */}
          {step === 3 && (
            <div className="setup-form-panel">
              {/* Season Selection */}
              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "शेतीचा हंगाम निवडा" : isHi ? "खेती का मौसम चुनें" : "Select Farming Season"}</span>
                </label>
                <div className="setup-seasons-grid">
                  {SEASONS.map((s) => {
                    const isSelected = season === s.id;
                    return (
                      <div
                        key={s.id}
                        className={`setup-season-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSeason(s.id)}
                      >
                        <span className="setup-season-icon">{s.icon}</span>
                        <span className="setup-season-name">{s.title[language] || s.title.en}</span>
                        <span className="setup-season-desc">{s.desc[language] || s.desc.en}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Crop Selection */}
              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "सध्याचे पीक निवडा" : isHi ? "वर्तमान फसल चुनें" : "Select Current Crop"}</span>
                  <span className="setup-label-badge">{crop}</span>
                </label>
                <div className="setup-crops-grid">
                  {CROPS.map((c) => {
                    const isSelected = crop === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`setup-crop-pill ${isSelected ? "selected" : ""}`}
                        onClick={() => setCrop(c.id)}
                      >
                        <span className="setup-crop-icon">{c.icon}</span>
                        <div className="setup-crop-info">
                          <span className="setup-crop-title">{c.name[language] || c.name.en}</span>
                          <span className="setup-crop-sub">{c.id}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sowing Date */}
              <div className="setup-field">
                <label className="setup-label">
                  <span>{isMr ? "पेरणी / लागवड तारीख" : isHi ? "बुवाई की तारीख" : "Sowing Date"}</span>
                  <button
                    type="button"
                    onClick={handleSetToday}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#16704A",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    📅 {isMr ? "आजची तारीख वापरा" : isHi ? "आज की तारीख" : "Use Today"}
                  </button>
                </label>
                <div className="setup-input-wrap">
                  <span className="setup-input-icon">📅</span>
                  <input
                    type="date"
                    className="setup-input"
                    value={sowingDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSowingDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Farm Summary Box */}
              <div className="setup-review-box">
                <div className="setup-review-item">
                  <span className="setup-review-label">{isMr ? "शेतकरी" : "Farmer"}</span>
                  <span className="setup-review-value">{farmerName || "—"}</span>
                </div>
                <div className="setup-review-item">
                  <span className="setup-review-label">{isMr ? "ठिकाण व क्षेत्र" : "Location & Area"}</span>
                  <span className="setup-review-value">{location || "—"} ({area || "0"} {isMr ? "एकर" : "Acres"})</span>
                </div>
                <div className="setup-review-item">
                  <span className="setup-review-label">{isMr ? "हंगाम" : "Season"}</span>
                  <span className="setup-review-value">{season}</span>
                </div>
                <div className="setup-review-item">
                  <span className="setup-review-label">{isMr ? "निवडलेले पीक" : "Crop & Sowing"}</span>
                  <span className="setup-review-value">🌱 {crop} ({sowingDate})</span>
                </div>
              </div>

              {/* Actions */}
              <div className="setup-actions">
                <button
                  type="button"
                  className="setup-back-btn"
                  onClick={handlePrevStep}
                  disabled={loading}
                >
                  {isMr ? "← मागे या" : isHi ? "← पीछे" : "← Back"}
                </button>
                <button
                  type="button"
                  className="setup-primary-btn"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span>⏳ {isMr ? "नोंदणी होत आहे..." : isHi ? "सहेजा जा रहा है..." : "Registering farm..."}</span>
                  ) : (
                    <span>🌾 {isMr ? "शेताची सुरुवात करा →" : isHi ? "शुरुआत करें →" : "Start My Farm →"}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}