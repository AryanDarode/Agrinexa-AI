import { useEffect, useState } from "react";

import MobileLogin from "./MobileLogin.jsx";
import LanguageSelection from "./LanguageSelection.jsx";
import FarmerSetup from "./FarmerSetup.jsx";
import Dashboard from "./Dashboard.jsx";


function App() {

  // ==========================================
  // SCREEN STATE MACHINE
  // Screens: "login" | "language" | "setup" | "dashboard"
  // ==========================================

  const [screen, setScreen] = useState("login");


  // ==========================================
  // VERIFIED MOBILE
  // ==========================================

  const [verifiedMobile, setVerifiedMobile] =
    useState("");


  // ==========================================
  // LANGUAGE PREFERENCE
  // ==========================================

  const [preferredLanguage, setPreferredLanguage] =
    useState(
      () =>
        localStorage.getItem("agrinexa_language") || ""
    );


  // ==========================================
  // FARMER DETAILS
  // ==========================================

  const [farmerDetails, setFarmerDetails] =
    useState(null);


  // ==========================================
  // LOADING FARMER FROM LOCALSTORAGE
  // ==========================================

  const [initializing, setInitializing] =
    useState(true);


  // ==========================================
  // APPLY LANGUAGE TO DOCUMENT
  // ==========================================

  const applyLanguage = (lang) => {
    document.documentElement.lang = lang || "en";
    document.documentElement.setAttribute(
      "data-lang",
      lang || "en"
    );
  };

  useEffect(() => {
    if (preferredLanguage) {
      applyLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);


  // ==========================================
  // BOOT: DETERMINE WHERE TO START
  // On app load, check if we have an existing session
  // If farmer ID in localStorage → auto-login to dashboard
  // If language but no farmer → go to setup
  // If no language → start from login
  // ==========================================

  useEffect(() => {

    const init = async () => {

      const savedLang =
        localStorage.getItem("agrinexa_language");

      const savedFarmerId =
        localStorage.getItem("agrinexa_farmer_id");

      const savedMobile =
        localStorage.getItem("agrinexa_mobile");


      // No language saved — start from scratch
      if (!savedLang) {
        setScreen("login");
        setInitializing(false);
        return;
      }

      applyLanguage(savedLang);
      setPreferredLanguage(savedLang);


      // No farmer ID — they authenticated but haven't set up
      if (!savedFarmerId) {
        if (savedMobile) {
          setVerifiedMobile(savedMobile);
          setScreen("setup");
        } else {
          setScreen("login");
        }
        setInitializing(false);
        return;
      }


      // Load existing farmer from backend
      try {

        const res = await fetch(
          `http://127.0.0.1:8000/api/farmers/${savedFarmerId}`
        );

        if (!res.ok) {
          throw new Error("Farmer not found");
        }

        const data = await res.json();

        setFarmerDetails({
          id: data.id,
          farmerName: data.farmer_name,
          mobile: data.mobile,
          location: data.location,
          area: data.area,
          season: data.season,
          crop: data.crop,
          sowingDate: data.sowing_date
        });

        setScreen("dashboard");

      } catch {

        // Could not load farmer — restart setup
        localStorage.removeItem("agrinexa_farmer_id");
        setScreen("setup");

      } finally {
        setInitializing(false);
      }
    };

    init();

  }, []);


  // ==========================================
  // HANDLERS
  // ==========================================

  const handleOtpVerified = (mobile) => {
    setVerifiedMobile(mobile);
    localStorage.setItem("agrinexa_mobile", mobile);
    setScreen("language");
  };

  const handleLanguageSelected = (lang) => {
    localStorage.setItem("agrinexa_language", lang);
    applyLanguage(lang);
    setPreferredLanguage(lang);

    // If farmer already exists (returning user), go to dashboard
    if (farmerDetails) {
      setScreen("dashboard");
    } else {
      setScreen("setup");
    }
  };

  const handleLanguageChange = (lang) => {
    localStorage.setItem("agrinexa_language", lang);
    applyLanguage(lang);
    setPreferredLanguage(lang);
  };

  const handleSetupComplete = (details) => {
    setFarmerDetails(details);
    localStorage.setItem(
      "agrinexa_farmer_id",
      details.id.toString()
    );
    setScreen("dashboard");
  };

  const handleSignOut = () => {
    localStorage.removeItem("agrinexa_farmer_id");
    localStorage.removeItem("agrinexa_language");
    localStorage.removeItem("agrinexa_mobile");
    setFarmerDetails(null);
    setPreferredLanguage("");
    setVerifiedMobile("");
    setScreen("login");
  };


  // ==========================================
  // INITIALIZING SPLASH
  // ==========================================

  if (initializing) {
    return (
      <div className="app-init-splash">
        <div className="app-init-logo">
          <span className="app-init-icon">🌱</span>
          <h1>Agrinexa AI</h1>
          <p>Smart Farming. Better Future.</p>
        </div>
        <div className="app-init-loader">
          <div className="init-bar" />
        </div>
      </div>
    );
  }


  // ==========================================
  // SCREEN: MOBILE LOGIN
  // ==========================================

  if (screen === "login") {
    return (
      <MobileLogin
        onVerified={handleOtpVerified}
      />
    );
  }


  // ==========================================
  // SCREEN: LANGUAGE SELECTION
  // ==========================================

  if (screen === "language") {
    return (
      <LanguageSelection
        onLanguageSelect={handleLanguageSelected}
        mobile={verifiedMobile}
      />
    );
  }


  // ==========================================
  // SCREEN: FARMER PROFILE SETUP
  // ==========================================

  if (screen === "setup") {
    return (
      <FarmerSetup
        language={preferredLanguage || "en"}
        mobile={verifiedMobile}
        onComplete={handleSetupComplete}
      />
    );
  }


  // ==========================================
  // SCREEN: MAIN DASHBOARD
  // ==========================================

  if (screen === "dashboard") {
    return (
      <Dashboard
        farmerDetails={farmerDetails}
        language={preferredLanguage || "en"}
        onLanguageChange={handleLanguageChange}
        onSignOut={handleSignOut}
      />
    );
  }


  // Fallback
  return null;
}


export default App;