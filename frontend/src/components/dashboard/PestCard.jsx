import React from "react";
import Card from "../common/Card";
import StatusPill from "../common/StatusPill";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { AlertTriangleIcon, ShieldCheckIcon } from "../common/Icons";

export default function PestCard({
  pestData,
  loading,
  cropName,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <Card>
        <Skeleton width="180px" height="24px" style={{ marginBottom: "16px" }} />
        <Skeleton height="50px" borderRadius="var(--radius-md)" style={{ marginBottom: "12px" }} />
        <Skeleton height="40px" />
      </Card>
    );
  }

  if (!pestData) {
    return (
      <Card>
        <EmptyState
          icon="🐛"
          title={t.pestRiskDescription || "Pest Risk Monitoring"}
          description={
            cropName
              ? (language === "hi"
                  ? `${cropName} के लिए कीट जोखिम डेटा वर्तमान मौसम स्थितियों से मेल खा रहा है।`
                  : language === "mr"
                  ? `${cropName} साठी कीड जोखीम डेटा वर्तमान हवामान परिस्थितीशी जुळत आहे.`
                  : `Monitoring weather-induced pest vulnerabilities for ${cropName}.`)
              : (language === "hi"
                  ? "कृपया प्रोफ़ाइल में अपनी सक्रिय फसल चुनें।"
                  : language === "mr"
                  ? "कृपया प्रोफाइलमध्ये आपले सक्रिय पीक निवडा."
                  : "Select an active crop to enable pest monitoring.")
          }
        />
      </Card>
    );
  }

  const rawRisk = (pestData.Pest_Disease_Risk || pestData.Risk || "Low").toLowerCase();
  const isHigh = rawRisk.includes("high") || rawRisk.includes("severe");
  const isMed = rawRisk.includes("med") || rawRisk.includes("moderate");
  const tone = isHigh ? "risk" : isMed ? "act" : "good";
  const displayRisk = isHigh
    ? (language === "hi" ? "उच्च जोखिम" : language === "mr" ? "उच्च धोका" : "High Risk")
    : isMed
    ? (language === "hi" ? "मध्यम सतर्कता" : language === "mr" ? "मध्यम धोका" : "Moderate Risk")
    : (language === "hi" ? "कम जोखिम" : language === "mr" ? "कमी धोका" : "Low Risk");

  const advice = pestData.Advice || pestData.Recommendation || (
    language === "hi"
      ? "वर्तमान मौसम में कीट का कोई विशेष खतरा नहीं देखा गया है।"
      : language === "mr"
      ? "सध्याच्या हवामानात किडीचा कोणताही विशिष्ट धोका आढळलेला नाही."
      : "No severe pest pressure detected for the current weather parameters."
  );

  return (
    <Card className="pest-card">
      <div className="pest-card-header">
        <div>
          <h3 className="card-heading">
            {t.pestRisk || "Pest & Disease Risk"}
          </h3>
          <p className="card-subheading">
            {cropName ? `${cropName} • ` : ""}
            {language === "hi" ? "मौसम जनित जोखिम विश्लेषण" : language === "mr" ? "हवामान आधारित कीड विश्लेषण" : "Weather-Driven Risk Telemetry"}
          </p>
        </div>

        <StatusPill tone={tone} label={displayRisk} />
      </div>

      <div className={`pest-advice-box ${tone}`}>
        <div className="pest-advice-icon">
          {isHigh ? <AlertTriangleIcon size={20} /> : <ShieldCheckIcon size={20} />}
        </div>
        <p className="pest-advice-text">{advice}</p>
      </div>

      <div className="pest-status-footer">
        <span className="pest-status-indicator">
          {isHigh ? "⚠️ " : "✅ "}
          {isHigh
            ? (language === "hi" ? "नियमित निगरानी और अनुशंसित छिड़काव करें" : language === "mr" ? "नियमित तपासणी आणि योग्य फवारणी करा" : "Inspect underside of leaves & apply recommended IPM spray")
            : (language === "hi" ? "फसल स्वस्थ स्थिति में है" : language === "mr" ? "पीक निरोगी स्थितीत आहे" : "Crop foliage in healthy condition")}
        </span>
      </div>
    </Card>
  );
}
