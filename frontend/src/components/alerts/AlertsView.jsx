import React, { useState } from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import StatusPill from "../common/StatusPill";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { AlertTriangleIcon, DropletIcon, LeafIcon, SparklesIcon, ShieldCheckIcon } from "../common/Icons";

export default function AlertsView({
  weather,
  cropStage,
  irrigationData,
  pestData,
  fertilizerData,
  farmerDetails,
  language = "en"
}) {
  const t = translations[language] || translations.en;
  const [filter, setFilter] = useState("all");

  const alerts = [];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Irrigation Alert
  if (irrigationData) {
    const p = (irrigationData.Irrigation_Priority || irrigationData.Priority || "").toLowerCase();
    const isHigh = p.includes("high") || p.includes("urgent");
    alerts.push({
      id: "irrigation-alert",
      category: "irrigation",
      urgency: isHigh ? "urgent" : "advisory",
      tone: isHigh ? "act" : "good",
      icon: <DropletIcon size={20} />,
      title: language === "hi" ? "सिंचाई सलाह सूचना" : language === "mr" ? "सिंचन सल्ला सूचना" : "Irrigation Priority Update",
      message: irrigationData.Irrigation_Advice || irrigationData.Advice || "Check soil moisture before next irrigation.",
      time: currentTime,
      tag: isHigh ? "High Priority" : "Standard"
    });
  }

  // 2. Pest Alert
  if (pestData) {
    const risk = (pestData.Pest_Disease_Risk || "").toLowerCase();
    const isHigh = risk.includes("high") || risk.includes("severe");
    const isMed = risk.includes("med");
    alerts.push({
      id: "pest-alert",
      category: "pest",
      urgency: isHigh ? "urgent" : isMed ? "advisory" : "info",
      tone: isHigh ? "risk" : isMed ? "act" : "good",
      icon: <AlertTriangleIcon size={20} />,
      title: language === "hi" ? "कीट एवं रोग चेतावनी" : language === "mr" ? "कीड व रोग इशारा" : "Pest & Disease Risk Warning",
      message: pestData.Advice || `Pest risk is currently ${pestData.Pest_Disease_Risk}. Inspect crop leaves regularly.`,
      time: currentTime,
      tag: pestData.Pest_Disease_Risk || "Normal"
    });
  }

  // 3. Weather Alert
  if (weather) {
    const rain = weather.Rainfall_mm || 0;
    const temp = weather.Temperature_C || 0;
    const isRainy = rain > 10;
    const isHot = temp > 38;

    alerts.push({
      id: "weather-alert",
      category: "weather",
      urgency: isRainy || isHot ? "urgent" : "info",
      tone: isRainy || isHot ? "act" : "good",
      icon: isRainy ? "🌧️" : "🌤️",
      title: language === "hi" ? "मौसम अपडेट व चेतावनी" : language === "mr" ? "हवामान अपडेट व सूचना" : "Live Weather Telemetry",
      message: isRainy
        ? (language === "hi" ? `भारी बारिश (${rain}mm) की संभावना है। जल निकासी की व्यवस्था करें।` : language === "mr" ? `मुसळधार पाऊस (${rain}mm) अपेक्षित आहे. पाण्याचा निचरा योग्य करा.` : `Significant rainfall recorded (${rain}mm). Ensure proper field drainage.`)
        : isHot
        ? (language === "hi" ? `उच्च तापमान (${temp}°C) दर्ज किया गया है। नमी बनाए रखें।` : `High temperature recorded (${temp}°C). Guard against heat stress.`)
        : (language === "hi" ? `मौसम अनुकूल है (${temp}°C, आर्द्रता ${weather["Humidity_%"] || weather.Humidity}%).` : `Weather conditions favorable (${temp}°C, Humidity ${weather["Humidity_%"] || weather.Humidity}%).`),
      time: currentTime,
      tag: weather.Condition || "Weather Live"
    });
  }

  // 4. Crop Stage Alert
  if (cropStage && (cropStage.Stage_Action || cropStage.Action)) {
    alerts.push({
      id: "stage-alert",
      category: "stage",
      urgency: "advisory",
      tone: "good",
      icon: <LeafIcon size={20} />,
      title: language === "hi" ? `${cropStage.Crop} विकास अवस्था कार्य` : `${cropStage.Crop || "Crop"} Stage Guidance`,
      message: cropStage.Stage_Action || cropStage.Action,
      time: currentTime,
      tag: cropStage.Crop_Stage || "Active"
    });
  }

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "urgent") return a.urgency === "urgent";
    if (filter === "advisory") return a.urgency === "advisory";
    if (filter === "weather") return a.category === "weather";
    return true;
  });

  return (
    <div className="alerts-view-container">
      <SectionHeader
        title={t.alerts || "Farm Advisories & Live Alerts"}
        subtitle={
          language === "hi"
            ? "आपके खेत के लिए रीयल-टाइम अलर्ट और कृषि विशेषज्ञ सलाह"
            : language === "mr"
            ? "तुमच्या शेतासाठी रिअल-टाइम सूचना आणि कृषी सल्ला"
            : "Real-time notifications and decision support updates for your farm"
        }
      />

      {/* Filter Chips */}
      <div className="alert-filter-bar">
        {[
          { id: "all", label: language === "hi" ? "सभी" : language === "mr" ? "सर्व" : "All Alerts", count: alerts.length },
          { id: "urgent", label: language === "hi" ? "प्राथमिकता" : language === "mr" ? "तातडीचे" : "Urgent", count: alerts.filter(a => a.urgency === "urgent").length },
          { id: "advisory", label: language === "hi" ? "सलाह" : language === "mr" ? "सल्ला" : "Advisories", count: alerts.filter(a => a.urgency === "advisory").length },
          { id: "weather", label: language === "hi" ? "मौसम" : language === "mr" ? "हवामान" : "Weather", count: alerts.filter(a => a.category === "weather").length }
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            className={`alert-filter-btn ${filter === btn.id ? "active" : ""}`}
            onClick={() => setFilter(btn.id)}
          >
            {btn.label}
            <span className="alert-count-pill">{btn.count}</span>
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <Card>
          <EmptyState
            icon="🔔"
            title={language === "hi" ? "कोई सक्रिय अलर्ट नहीं" : language === "mr" ? "कोणतीही सक्रिय सूचना नाही" : "No Active Advisories"}
            description={
              language === "hi"
                ? "आपके खेत की सभी स्थितियां सामान्य हैं और कोई तत्काल चेतावनी सक्रिय नहीं है।"
                : language === "mr"
                ? "तुमच्या शेताची सर्व परिस्थिती सामान्य असून कोणतीही चेतावणी नाही."
                : "All live telemetry parameters are within optimal ranges."
            }
          />
        </Card>
      ) : (
        <div className="alerts-list">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`alert-card tone-${alert.tone}`}>
              <div className="alert-card-header">
                <div className="alert-title-row">
                  <div className="alert-icon-wrap">{alert.icon}</div>
                  <div>
                    <h4 className="alert-title">{alert.title}</h4>
                    <span className="alert-time-tag">⏱️ {alert.time}</span>
                  </div>
                </div>
                <StatusPill tone={alert.tone} label={alert.tag} size="sm" />
              </div>

              <p className="alert-message-text">{alert.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
