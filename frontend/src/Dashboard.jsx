import React, { useEffect, useState, useCallback } from "react";
import TopNav from "./components/navigation/TopNav";
import BottomNav from "./components/navigation/BottomNav";
import WeatherHero from "./components/dashboard/WeatherHero";
import FarmActionHero from "./components/dashboard/FarmActionHero";
import CropStageCard from "./components/dashboard/CropStageCard";
import SoilCard from "./components/dashboard/SoilCard";
import FertilizerCard from "./components/dashboard/FertilizerCard";
import PestCard from "./components/dashboard/PestCard";
import YieldCard from "./components/dashboard/YieldCard";
import CropsView from "./components/crops/CropsView";
import FarmHistoryView from "./components/history/FarmHistoryView";
import AlertsView from "./components/alerts/AlertsView";
import ProfileView from "./components/profile/ProfileView";
import AIAssistant from "./AIAssistant";
import translations from "./translations";

export default function Dashboard({
  farmerDetails: initialFarmerDetails,
  language = "en",
  onLanguageChange,
  onSignOut
}) {
  const [farmerDetails, setFarmerDetails] = useState(initialFarmerDetails);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAIOpen, setIsAIOpen] = useState(false);
  const t = translations[language] || translations.en;

  // Sync initialFarmerDetails if changed
  useEffect(() => {
    if (initialFarmerDetails) {
      setFarmerDetails(initialFarmerDetails);
    }
  }, [initialFarmerDetails]);

  // ==========================================
  // TELEMETRY STATES
  // ==========================================
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  const [soilProfile, setSoilProfile] = useState(null);
  const [loadingSoil, setLoadingSoil] = useState(true);

  const [cropStage, setCropStage] = useState(null);
  const [loadingCropStage, setLoadingCropStage] = useState(true);

  const [yieldData, setYieldData] = useState(null);
  const [loadingYield, setLoadingYield] = useState(false);

  const [irrigationData, setIrrigationData] = useState(null);
  const [loadingIrrigation, setLoadingIrrigation] = useState(false);

  const [pestData, setPestData] = useState(null);
  const [loadingPest, setLoadingPest] = useState(false);

  const [fertilizerData, setFertilizerData] = useState(null);
  const [loadingFertilizer, setLoadingFertilizer] = useState(false);

  const [farmRecords, setFarmRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // ==========================================
  // FETCH WEATHER
  // ==========================================
  const fetchWeather = useCallback(async () => {
    const location = farmerDetails?.location || "Pune";
    try {
      setLoadingWeather(true);
      setWeatherError("");
      const res = await fetch(`http://127.0.0.1:8000/api/weather?city=${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error("Weather request failed");
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error("Weather error:", err);
      setWeatherError(err.message || "Failed to load weather");
      setWeather(null);
    } finally {
      setLoadingWeather(false);
    }
  }, [farmerDetails?.location]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // ==========================================
  // FETCH SOIL PROFILE
  // ==========================================
  useEffect(() => {
    const fetchSoil = async () => {
      const location = farmerDetails?.location || "Pune";
      try {
        setLoadingSoil(true);
        const res = await fetch(`http://127.0.0.1:8000/api/soil-profile?district=${encodeURIComponent(location)}`);
        if (!res.ok) throw new Error("Soil profile request failed");
        const data = await res.json();
        setSoilProfile(data?.Soil_Profile || data);
      } catch (err) {
        console.error("Soil error:", err);
        setSoilProfile(null);
      } finally {
        setLoadingSoil(false);
      }
    };
    fetchSoil();
  }, [farmerDetails?.location]);

  // ==========================================
  // FETCH CROP RECOMMENDATIONS
  // ==========================================
  useEffect(() => {
    const fetchRecs = async () => {
      const location = farmerDetails?.location || "Pune";
      const season = farmerDetails?.season || "Kharif";
      try {
        setLoadingRecommendations(true);
        const res = await fetch(
          `http://127.0.0.1:8000/api/recommend-crops?district=${encodeURIComponent(location)}&season=${encodeURIComponent(season)}`
        );
        if (!res.ok) throw new Error("Crop recommendations request failed");
        const data = await res.json();
        setRecommendations(data?.Recommendations || data?.recommendations || []);
      } catch (err) {
        console.error("Recommendations error:", err);
        setRecommendations([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };
    fetchRecs();
  }, [farmerDetails?.location, farmerDetails?.season]);

  // ==========================================
  // FETCH CROP STAGE
  // ==========================================
  useEffect(() => {
    const fetchCropStage = async () => {
      if (!farmerDetails?.crop || !farmerDetails?.sowingDate) {
        setCropStage(null);
        setLoadingCropStage(false);
        return;
      }
      try {
        setLoadingCropStage(true);
        const sowing = new Date(farmerDetails.sowingDate);
        const today = new Date();
        const diffTime = today.getTime() - sowing.getTime();
        const ageDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        const res = await fetch(
          `http://127.0.0.1:8000/api/crop-stage?crop=${encodeURIComponent(farmerDetails.crop)}&crop_age_days=${ageDays}`
        );
        if (!res.ok) throw new Error("Crop stage request failed");
        const data = await res.json();
        setCropStage(data.Status === "Success" ? data : null);
      } catch (err) {
        console.error("Crop stage error:", err);
        setCropStage(null);
      } finally {
        setLoadingCropStage(false);
      }
    };
    fetchCropStage();
  }, [farmerDetails?.crop, farmerDetails?.sowingDate]);

  // ==========================================
  // FETCH FERTILIZER ADVISORY
  // ==========================================
  useEffect(() => {
    const fetchFertilizer = async () => {
      if (!farmerDetails?.crop || !soilProfile) {
        setFertilizerData(null);
        return;
      }
      try {
        setLoadingFertilizer(true);
        const params = new URLSearchParams({
          crop: farmerDetails.crop,
          nitrogen: soilProfile.Nitrogen || 250,
          phosphorus: soilProfile.Phosphorus || 20,
          potassium: soilProfile.Potassium || 180,
          ph: soilProfile.pH || 7.0
        });

        const res = await fetch(`http://127.0.0.1:8000/api/recommend-fertilizer?${params.toString()}`);
        if (!res.ok) throw new Error("Fertilizer request failed");
        const data = await res.json();
        setFertilizerData(data);
      } catch (err) {
        console.error("Fertilizer error:", err);
        setFertilizerData(null);
      } finally {
        setLoadingFertilizer(false);
      }
    };
    fetchFertilizer();
  }, [farmerDetails?.crop, soilProfile]);

  // ==========================================
  // FETCH IRRIGATION & PEST DATA
  // ==========================================
  useEffect(() => {
    const fetchAdvisories = async () => {
      if (!farmerDetails?.crop || !weather) return;

      // Irrigation
      try {
        setLoadingIrrigation(true);
        const params = new URLSearchParams({
          crop: farmerDetails.crop,
          crop_stage: cropStage?.Crop_Stage || "Vegetative",
          rainfall: weather.Rainfall_mm || 0,
          temperature: weather.Temperature_C || 28,
          humidity: weather["Humidity_%"] || weather.Humidity || 60
        });
        const res = await fetch(`http://127.0.0.1:8000/api/irrigation?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setIrrigationData(data);
        }
      } catch (e) {
        console.error("Irrigation error:", e);
      } finally {
        setLoadingIrrigation(false);
      }

      // Pest Risk
      try {
        setLoadingPest(true);
        const pStage = cropStage?.Crop_Stage || "Vegetative";
        const params = new URLSearchParams({
          crop: farmerDetails.crop,
          crop_stage: pStage,
          rainfall: weather.Rainfall_mm || 0,
          temperature: weather.Temperature_C || 28,
          humidity: weather["Humidity_%"] || weather.Humidity || 60
        });
        const res = await fetch(`http://127.0.0.1:8000/api/pest-risk?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPestData(data.Status === "Success" ? data : null);
        }
      } catch (e) {
        console.error("Pest error:", e);
      } finally {
        setLoadingPest(false);
      }
    };

    fetchAdvisories();
  }, [farmerDetails?.crop, weather, cropStage]);

  // ==========================================
  // FETCH YIELD PREDICTION
  // ==========================================
  useEffect(() => {
    const fetchYield = async () => {
      if (!farmerDetails?.crop || !farmerDetails?.area || !weather || !soilProfile) {
        setYieldData(null);
        return;
      }
      try {
        setLoadingYield(true);
        const areaHa = parseFloat(farmerDetails.area) * 0.404686;
        const currentYear = new Date().getFullYear();

        const params = new URLSearchParams({
          crop: farmerDetails.crop,
          area_ha: areaHa.toFixed(2),
          year: currentYear,
          temperature: weather.Temperature_C || 28,
          humidity: weather["Humidity_%"] || weather.Humidity || 60,
          ph: soilProfile.pH || 7.0,
          rainfall: weather.Rainfall_mm || 800,
          wind_speed: weather.Wind_Speed_kmh || 10
        });

        const res = await fetch(`http://127.0.0.1:8000/api/yield-prediction?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setYieldData(data.Status === "Success" ? data : null);
        }
      } catch (e) {
        console.error("Yield error:", e);
        setYieldData(null);
      } finally {
        setLoadingYield(false);
      }
    };
    fetchYield();
  }, [farmerDetails, weather, soilProfile]);

  // ==========================================
  // FETCH FARM HISTORY RECORDS
  // ==========================================
  useEffect(() => {
    const fetchRecords = async () => {
      if (!farmerDetails?.id) return;
      try {
        setLoadingRecords(true);
        const res = await fetch(`http://127.0.0.1:8000/api/farmers/${farmerDetails.id}/records`);
        if (res.ok) {
          const data = await res.json();
          setFarmRecords(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Records error:", e);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [farmerDetails?.id]);

  // Calculate unread alerts
  const unreadAlertsCount = (
    (irrigationData?.Irrigation_Priority?.toLowerCase().includes("high") ? 1 : 0) +
    (pestData?.Pest_Disease_Risk?.toLowerCase().includes("high") ? 1 : 0) +
    (fertilizerData?.Deficiencies?.length > 0 ? 1 : 0)
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || "Good morning";
    if (hour < 17) return t.goodAfternoon || "Good afternoon";
    return t.goodEvening || "Good evening";
  };

  return (
    <div className="dashboard-app-shell">
      {/* Top Header */}
      <TopNav
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAI={() => setIsAIOpen(true)}
        farmerDetails={farmerDetails}
        language={language}
        onLanguageChange={onLanguageChange}
        unreadAlertsCount={unreadAlertsCount}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="content-container">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="dashboard-view-wrapper">
              {/* Farmer Greeting Banner */}
              <div className="greeting-banner">
                <div className="greeting-text-wrap">
                  <h1 className="greeting-title">
                    {getGreeting()}, {farmerDetails?.farmerName || "Farmer"} 👋
                  </h1>
                  <p className="greeting-subtitle">
                    {t.dashboardSubtitle || "Here is what Agrinexa AI recommends for your farm today."}
                  </p>
                </div>
              </div>

              {/* Weather Hero Card */}
              <WeatherHero
                weather={weather}
                loading={loadingWeather}
                error={weatherError}
                onRetry={fetchWeather}
                locationName={farmerDetails?.location}
                language={language}
              />

              {/* Today's Farm Action Prioritized Hero */}
              <FarmActionHero
                weather={weather}
                cropStage={cropStage}
                irrigationData={irrigationData}
                pestData={pestData}
                fertilizerData={fertilizerData}
                language={language}
                onActionClick={(actionType) => {
                  if (actionType === "stage") setActiveTab("crops");
                  else if (actionType === "pest" || actionType === "irrigation") setActiveTab("alerts");
                }}
              />

              {/* Main Telemetry & Insights 2-Column Grid */}
              <div className="dashboard-telemetry-grid">
                <div className="telemetry-column">
                  <CropStageCard
                    cropStage={cropStage}
                    loading={loadingCropStage}
                    cropName={farmerDetails?.crop}
                    sowingDate={farmerDetails?.sowingDate}
                    language={language}
                  />

                  <SoilCard
                    soilProfile={soilProfile}
                    loading={loadingSoil}
                    locationName={farmerDetails?.location}
                    language={language}
                  />

                  <YieldCard
                    yieldData={yieldData}
                    loading={loadingYield}
                    cropName={farmerDetails?.crop}
                    areaAcres={farmerDetails?.area}
                    language={language}
                  />
                </div>

                <div className="telemetry-column">
                  <FertilizerCard
                    fertilizerData={fertilizerData}
                    loading={loadingFertilizer}
                    cropName={farmerDetails?.crop}
                    language={language}
                  />

                  <PestCard
                    pestData={pestData}
                    loading={loadingPest}
                    cropName={farmerDetails?.crop}
                    language={language}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Crops Tab */}
          {activeTab === "crops" && (
            <CropsView
              recommendations={recommendations}
              loading={loadingRecommendations}
              currentCrop={farmerDetails?.crop}
              locationName={farmerDetails?.location}
              season={farmerDetails?.season}
              language={language}
            />
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <FarmHistoryView
              farmRecords={farmRecords}
              loading={loadingRecords}
              farmerId={farmerDetails?.id}
              language={language}
              onRecordAdded={(newRec) => setFarmRecords((prev) => [newRec, ...prev])}
            />
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <AlertsView
              weather={weather}
              cropStage={cropStage}
              irrigationData={irrigationData}
              pestData={pestData}
              fertilizerData={fertilizerData}
              farmerDetails={farmerDetails}
              language={language}
            />
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <ProfileView
              farmerDetails={farmerDetails}
              language={language}
              onLanguageChange={onLanguageChange}
              onProfileUpdated={(updated) => setFarmerDetails(updated)}
              onSignOut={onSignOut}
            />
          )}
        </div>
      </main>

      {/* Floating AI Assistant Trigger (Bottom Right on Desktop) */}
      <button
        type="button"
        className="floating-ai-fab"
        onClick={() => setIsAIOpen(true)}
        aria-label="Open AI Assistant"
      >
        <span className="fab-ai-icon">🤖</span>
        <span className="fab-ai-label">
          {language === "hi" ? "एआई से पूछें" : language === "mr" ? "एआयला विचारा" : "Ask AI"}
        </span>
        <span className="fab-ai-dot" />
      </button>

      {/* AI Assistant Sheet / Modal */}
      <AIAssistant
        farmerDetails={farmerDetails}
        weather={weather}
        soilProfile={soilProfile}
        cropStage={cropStage}
        irrigationData={irrigationData}
        pestData={pestData}
        yieldData={yieldData}
        appLanguage={language}
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <BottomNav
        currentTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "assistant") {
            setIsAIOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAI={() => setIsAIOpen(true)}
        language={language}
        unreadAlertsCount={unreadAlertsCount}
      />
    </div>
  );
}