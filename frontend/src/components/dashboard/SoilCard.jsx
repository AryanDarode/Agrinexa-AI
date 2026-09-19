import React from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import StatusPill from "../common/StatusPill";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { AlertTriangleIcon } from "../common/Icons";

export default function SoilCard({
  soilProfile,
  loading,
  locationName,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <Card>
        <Skeleton width="160px" height="24px" style={{ marginBottom: "16px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
          <Skeleton height="60px" borderRadius="var(--radius-md)" />
          <Skeleton height="60px" borderRadius="var(--radius-md)" />
          <Skeleton height="60px" borderRadius="var(--radius-md)" />
          <Skeleton height="60px" borderRadius="var(--radius-md)" />
        </div>
        <Skeleton height="36px" />
      </Card>
    );
  }

  if (!soilProfile) {
    return (
      <Card>
        <EmptyState
          icon="🏜️"
          title={t.soilUnavailable || "Soil Data Unavailable"}
          description={
            locationName
              ? (language === "hi"
                  ? `${locationName} क्षेत्र के लिए मिट्टी डेटा उपलब्ध नहीं है।`
                  : language === "mr"
                  ? `${locationName} क्षेत्रासाठी माती डेटा उपलब्ध नाही.`
                  : `Regional soil profile is unavailable for ${locationName}.`)
              : (language === "hi"
                  ? "कृपया प्रोफ़ाइल में अपना जिला या स्थान चुनें।"
                  : language === "mr"
                  ? "कृपया प्रोफाइलमध्ये आपला जिल्हा किंवा स्थान निवडा."
                  : "Please select a location in your profile.")
          }
        />
      </Card>
    );
  }

  const n = soilProfile.Nitrogen ?? 0;
  const p = soilProfile.Phosphorus ?? 0;
  const k = soilProfile.Potassium ?? 0;
  const ph = soilProfile.pH ?? 7.0;
  const soilColor = soilProfile.Soil_color || soilProfile.Soil_Type || "Black Soil";

  // Nutrient evaluation thresholds
  const getNutrientStatus = (val, lowThresh, highThresh) => {
    if (val < lowThresh) return { label: language === "hi" ? "कम" : language === "mr" ? "कमी" : "Low", tone: "act" };
    if (val > highThresh) return { label: language === "hi" ? "अधिक" : language === "mr" ? "जास्त" : "High", tone: "watch" };
    return { label: language === "hi" ? "पर्याप्त" : language === "mr" ? "पुरेसे" : "Adequate", tone: "good" };
  };

  const nStatus = getNutrientStatus(n, 200, 450);
  const pStatus = getNutrientStatus(p, 15, 35);
  const kStatus = getNutrientStatus(k, 120, 280);

  return (
    <Card className="soil-card">
      <div className="soil-card-header">
        <div>
          <h3 className="card-heading">{t.soilProfile || "Soil Health Profile"}</h3>
          <p className="card-subheading">
            {locationName ? `${locationName} • ` : ""}
            {soilColor}
          </p>
        </div>

        <div className="ph-badge">
          <span className="ph-label">pH</span>
          <span className="ph-val">{ph}</span>
        </div>
      </div>

      {/* NPK Nutrients Grid */}
      <div className="soil-nutrients-grid">
        <div className="nutrient-tile">
          <div className="nutrient-tile-top">
            <span className="nutrient-symbol">N</span>
            <StatusPill tone={nStatus.tone} label={nStatus.label} size="sm" />
          </div>
          <div className="nutrient-value-row">
            <span className="nutrient-val">{n}</span>
            <span className="nutrient-unit">kg/ha</span>
          </div>
          <span className="nutrient-name">{t.nitrogen || "Nitrogen"}</span>
        </div>

        <div className="nutrient-tile">
          <div className="nutrient-tile-top">
            <span className="nutrient-symbol">P</span>
            <StatusPill tone={pStatus.tone} label={pStatus.label} size="sm" />
          </div>
          <div className="nutrient-value-row">
            <span className="nutrient-val">{p}</span>
            <span className="nutrient-unit">kg/ha</span>
          </div>
          <span className="nutrient-name">{t.phosphorus || "Phosphorus"}</span>
        </div>

        <div className="nutrient-tile">
          <div className="nutrient-tile-top">
            <span className="nutrient-symbol">K</span>
            <StatusPill tone={kStatus.tone} label={kStatus.label} size="sm" />
          </div>
          <div className="nutrient-value-row">
            <span className="nutrient-val">{k}</span>
            <span className="nutrient-unit">kg/ha</span>
          </div>
          <span className="nutrient-name">{t.potassium || "Potassium"}</span>
        </div>
      </div>

      {/* Advisory Alert Notice */}
      <div className="soil-lab-warning">
        <AlertTriangleIcon size={16} />
        <p>
          {t.estimatedSoilWarning ||
            (language === "hi"
              ? "यह एक अनुमानित क्षेत्रीय मिट्टी प्रोफ़ाइल है। सटीक पोषण मान के लिए प्रयोगशाला परीक्षण करवाएं।"
              : language === "mr"
              ? "हे एक अंदाजित प्रादेशिक माती प्रोफाइल आहे. अचूक पोषण मूल्यासाठी प्रयोगशाळा चाचणी करा."
              : "Regional estimated profile. For exact nutrient levels, conduct a certified soil lab test.")}
        </p>
      </div>
    </Card>
  );
}
