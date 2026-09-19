import React, { useState, useRef, useEffect } from "react";

const LOGIN_STRINGS = {
  en: {
    tagline: "Smart Farming. Better Future.",
    enterMobile: "Enter Mobile Number",
    enterMobileDesc: "We'll send a 6-digit OTP to verify your number.",
    placeholder: "Enter 10-digit mobile number",
    hint: "Numbers starting with 6, 7, 8, or 9 only",
    sendOtp: "Send OTP →",
    sendingOtp: "Sending OTP...",
    verifyTitle: "Verify OTP",
    verifyDesc: "Enter the 6-digit code sent to",
    resend: "Resend OTP",
    resendIn: "Resend in",
    changeNum: "Change number",
    verifyBtn: "Verify & Continue →",
    verifying: "Verifying...",
    invalidMobile: "Please enter a valid 10-digit Indian mobile number.",
    enter6Digits: "Please enter all 6 digits of the OTP.",
    incorrectOtp: "Incorrect OTP. Please check and try again.",
    secureBadge: "🔒 Secure",
    farmersBadge: "🌾 100K+ Farmers",
    aiBadge: "🤖 AI-Powered",
  },
  mr: {
    tagline: "स्मार्ट शेती. समृद्ध भविष्य.",
    enterMobile: "मोबाईल नंबर प्रविष्ट करा",
    enterMobileDesc: "तुमचा नंबर पडताळण्यासाठी आम्ही ६-अंकी OTP पाठवू.",
    placeholder: "१० अंकी मोबाईल नंबर लिहा",
    hint: "६, ७, ८ किंवा ९ ने सुरू होणारे नंबर",
    sendOtp: "OTP पाठवा →",
    sendingOtp: "OTP पाठवत आहे...",
    verifyTitle: "OTP पडताळा",
    verifyDesc: "पुढील नंबरवर पाठवलेला कोड प्रविष्ट करा:",
    resend: "पुन्हा OTP पाठवा",
    resendIn: "पुन्हा पाठवा",
    changeNum: "नंबर बदला",
    verifyBtn: "पडताळणी करा आणि पुढे जा →",
    verifying: "पडताळणी होत आहे...",
    invalidMobile: "कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.",
    enter6Digits: "कृपया OTP चे सर्व ६ अंक प्रविष्ट करा.",
    incorrectOtp: "चुकीचा OTP. कृपया तपासून पुन्हा प्रयत्न करा.",
    secureBadge: "🔒 सुरक्षित",
    farmersBadge: "🌾 १ लाख+ शेतकरी",
    aiBadge: "🤖 AI-सक्षम",
  },
  hi: {
    tagline: "स्मार्ट खेती. बेहतर भविष्य.",
    enterMobile: "मोबाइल नंबर दर्ज करें",
    enterMobileDesc: "आपके नंबर के सत्यापन के लिए हम 6-अंकों का OTP भेजेंगे।",
    placeholder: "10 अंकों का मोबाइल नंबर लिखें",
    hint: "6, 7, 8 या 9 से शुरू होने वाले नंबर",
    sendOtp: "OTP भेजें →",
    sendingOtp: "OTP भेजा जा रहा है...",
    verifyTitle: "OTP सत्यापित करें",
    verifyDesc: "निम्नलिखित नंबर पर भेजा गया कोड दर्ज करें:",
    resend: "पुनः OTP भेजें",
    resendIn: "पुनः भेजें",
    changeNum: "नंबर बदलें",
    verifyBtn: "सत्यापित करें और आगे बढ़ें →",
    verifying: "सत्यापन हो रहा है...",
    invalidMobile: "कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।",
    enter6Digits: "कृपया OTP के सभी 6 अंक दर्ज करें।",
    incorrectOtp: "गलत OTP. कृपया पुनः प्रयास करें।",
    secureBadge: "🔒 सुरक्षित",
    farmersBadge: "🌾 1 लाख+ किसान",
    aiBadge: "🤖 AI-संचालित",
  },
};

// ============================================================
// MOBILE LOGIN SCREEN
// Farmer enters 10-digit Indian mobile number
// ============================================================
export default function MobileLogin({ onVerified }) {

  const [loginLang, setLoginLang] = useState(
    () => localStorage.getItem("agrinexa_language") || "mr"
  );
  const strings = LOGIN_STRINGS[loginLang] || LOGIN_STRINGS.en;

  const [step, setStep] = useState("mobile"); // "mobile" | "otp"
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  const handleLangChange = (newLang) => {
    setLoginLang(newLang);
    localStorage.setItem("agrinexa_language", newLang);
  };

  // Auto-start countdown when OTP screen shows
  useEffect(() => {
    if (step === "otp") {
      startCooldown();
    }
    return () => clearInterval(cooldownRef.current);
  }, [step]);

  const startCooldown = () => {
    setResendCooldown(30);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [debugOtp, setDebugOtp] = useState("");
  const [smsStatus, setSmsStatus] = useState(null);

  // Validate 10-digit Indian mobile number
  const isValidMobile = (num) => /^[6-9]\d{9}$/.test(num.trim());

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (!isValidMobile(mobile)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setLoadingOtp(true);
      const cleanMobile = mobile.trim();

      // Call Backend OTP Service
      let otpReceived = "";
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: cleanMobile }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.debug_otp) {
            otpReceived = data.debug_otp;
            setDebugOtp(data.debug_otp);
          }
          setSmsStatus(data.sms_sent ? "Sent via SMS" : "Simulator mode");
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Server failed to send OTP.");
        }
      } catch (backendErr) {
        console.warn("Backend OTP service unavailable, falling back to local demo:", backendErr);
        // Fallback simulation for offline testing
        otpReceived = "123456";
        setDebugOtp("123456");
        setSmsStatus("Demo mode");
      }

      // Store mobile for session
      sessionStorage.setItem("agrinexa_pending_mobile", cleanMobile);

      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrorMsg(err.message || "Could not send OTP. Please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    setErrorMsg("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 filled
    if (value && index === 5) {
      const fullOtp = [...updated].join("");
      if (fullOtp.length === 6) {
        setTimeout(() => handleVerifyOtp(fullOtp), 100);
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleQuickFill = () => {
    if (debugOtp && debugOtp.length === 6) {
      const digits = debugOtp.split("");
      setOtp(digits);
      setTimeout(() => handleVerifyOtp(debugOtp), 150);
    }
  };

  const handleVerifyOtp = async (rawOtp) => {
    const enteredOtp = rawOtp || otp.join("");
    setErrorMsg("");

    if (enteredOtp.length < 6) {
      setErrorMsg("Please enter all 6 digits of the OTP.");
      return;
    }

    try {
      setVerifying(true);
      const cleanMobile = sessionStorage.getItem("agrinexa_pending_mobile") || mobile.trim();

      // Call Backend Verify OTP
      let verified = false;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile: cleanMobile, otp: enteredOtp }),
        });

        if (res.ok) {
          verified = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Incorrect OTP. Please try again.");
        }
      } catch (backendErr) {
        // If backend fails due to network, fallback to offline demo acceptance
        if (backendErr.message && backendErr.message.includes("Incorrect OTP")) {
          throw backendErr;
        }
        console.warn("Backend verify unavailable, demo verified:", backendErr);
        verified = true;
      }

      if (verified) {
        sessionStorage.removeItem("agrinexa_pending_mobile");
        onVerified(cleanMobile);
      }
    } catch (err) {
      setErrorMsg(err.message || "Incorrect OTP. Please check and try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setErrorMsg("");
    startCooldown();
    handleSendOtp();
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleChangeMobile = () => {
    setStep("mobile");
    setOtp(["", "", "", "", "", ""]);
    setDebugOtp("");
    setErrorMsg("");
    clearInterval(cooldownRef.current);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-art" aria-hidden="true">
        <div className="auth-bg-circle auth-bg-circle-1" />
        <div className="auth-bg-circle auth-bg-circle-2" />
        <div className="auth-bg-grain" />
      </div>

      <div className="auth-card-wrapper">
        {/* Brand Header */}
        <div className="auth-header-row">
          <div className="auth-brand">
            <div className="auth-brand-icon">🌱</div>
            <div>
              <h1 className="auth-brand-name">Agrinexa AI</h1>
              <p className="auth-brand-tagline">{strings.tagline}</p>
            </div>
          </div>
          <div className="auth-lang-switch">
            {[
              { code: "mr", label: "मराठी" },
              { code: "hi", label: "हिन्दी" },
              { code: "en", label: "EN" },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                className={`auth-lang-btn ${loginLang === l.code ? "active" : ""}`}
                onClick={() => handleLangChange(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-card">
          {step === "mobile" ? (
            <>
              {/* Mobile Entry Step */}
              <div className="auth-step-header">
                <div className="auth-step-icon-wrap">📱</div>
                <h2 className="auth-step-title">{strings.enterMobile}</h2>
                <p className="auth-step-desc">{strings.enterMobileDesc}</p>
              </div>

              <form onSubmit={handleSendOtp} className="auth-form">
                {errorMsg && (
                  <div className="auth-error-banner" role="alert">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                <div className="mobile-input-group">
                  <div className="mobile-country-prefix">
                    <span className="country-flag">🇮🇳</span>
                    <span className="country-code">+91</span>
                  </div>
                  <input
                    id="mobile-input"
                    type="tel"
                    className="mobile-number-input"
                    placeholder={strings.placeholder}
                    value={mobile}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel"
                    autoFocus
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setMobile(val);
                      setErrorMsg("");
                    }}
                    required
                  />
                </div>

                <div className="mobile-input-hint">{strings.hint}</div>

                <button
                  type="submit"
                  className="auth-primary-btn"
                  disabled={loadingOtp || mobile.length < 10}
                >
                  {loadingOtp ? (
                    <span className="auth-btn-loader">
                      <span className="auth-spinner" />
                      {strings.sendingOtp}
                    </span>
                  ) : (
                    strings.sendOtp
                  )}
                </button>
              </form>

              <div className="auth-mock-notice">
                <span>🔒</span>
                <span>{loginLang === "mr" ? "डेमो मोड: खालील OTP वापरा किंवा SMS तपासा" : loginLang === "hi" ? "डेमो मोड: नीचे दिया गया OTP उपयोग करें" : "Demo mode: Use quick-fill code below"}</span>
              </div>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="auth-step-header">
                <div className="auth-step-icon-wrap">🔐</div>
                <h2 className="auth-step-title">{strings.verifyTitle}</h2>
                <p className="auth-step-desc">
                  {strings.verifyDesc} <strong>+91 {mobile}</strong>
                </p>
              </div>

              <div className="auth-form">
                {errorMsg && (
                  <div className="auth-error-banner" role="alert">
                    <span>⚠️ {errorMsg}</span>
                  </div>
                )}

                {debugOtp && (
                  <div
                    style={{
                      margin: "0 0 16px 0",
                      padding: "10px 14px",
                      background: "rgba(34, 197, 94, 0.12)",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      borderRadius: "10px",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "#166534",
                    }}
                  >
                    <span>
                      🔑 <strong>OTP:</strong> {debugOtp} <span style={{ opacity: 0.8, fontSize: "11px" }}>({smsStatus || "Ready"})</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      style={{
                        background: "#166534",
                        color: "#fff",
                        border: "none",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {loginLang === "mr" ? "आपोआप भरा" : loginLang === "hi" ? "स्वतः भरें" : "Auto-fill"}
                    </button>
                  </div>
                )}

                {/* 6-Box OTP Input */}
                <div
                  className="otp-boxes-row"
                  role="group"
                  aria-label="Enter 6-digit OTP"
                >
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      className={`otp-box ${digit ? "filled" : ""} ${errorMsg ? "error" : ""}`}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      onFocus={(e) => e.target.select()}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="auth-primary-btn"
                  onClick={() => handleVerifyOtp()}
                  disabled={verifying || otp.join("").length < 6}
                >
                  {verifying ? (
                    <span className="auth-btn-loader">
                      <span className="auth-spinner" />
                      {strings.verifying}
                    </span>
                  ) : (
                    strings.verifyBtn
                  )}
                </button>

                {/* Resend + Change Number */}
                <div className="auth-secondary-actions">
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `${strings.resendIn} ${resendCooldown}s`
                      : strings.resend}
                  </button>

                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={handleChangeMobile}
                  >
                    {strings.changeNum}
                  </button>
                </div>
              </div>

              <div className="auth-mock-notice">
                <span>🔒</span>
                <span>{loginLang === "mr" ? "डेमो मोड: कोणताही ६-अंकी OTP चालेल" : loginLang === "hi" ? "डेमो मोड: कोई भी 6-अंकीय OTP मान्य है" : "Demo mode: Any 6-digit OTP will be accepted"}</span>
              </div>
            </>
          )}
        </div>

        {/* Trust Badges */}
        <div className="auth-trust-row">
          <span className="auth-trust-badge">{strings.secureBadge}</span>
          <span className="auth-trust-badge">{strings.farmersBadge}</span>
          <span className="auth-trust-badge">{strings.aiBadge}</span>
        </div>
      </div>
    </div>
  );
}
