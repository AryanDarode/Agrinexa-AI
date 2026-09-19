import React from "react";
import Card from "../common/Card";
import StatusPill from "../common/StatusPill";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";

export default function FertilizerCard({
  fertilizerData,
  loading,
  cropName,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <Card>
        <Skeleton width="180px" height="24px" style={{ marginBottom: "16px" }} />
        <Skeleton height="40px" borderRadius="var(--radius-md)" style={{ marginBottom: "12px" }} />
        <Skeleton height="60px" borderRadius="var(--radius-md)" />
      </Card>
    );
  }

  if (!fertilizerData) {
    return (
      <Card>
        <EmptyState
          icon="🧪"
          title={t.fertilizerUnavailable || "Fertilizer Data Unavailable"}
          description={
            cropName
              ? (language === "hi"
                  ? `${cropName} के लिए उर्वरक विश्लेषण उपलब्ध नहीं है।`
                  : language === "mr"
                  ? `${cropName} साठी खत विश्लेषण उपलब्ध नाही.`
                  : `Fertilizer analysis unavailable for ${cropName}.`)
              : (language === "hi"
                  ? "कृपया प्रोफ़ाइल में अपनी सक्रिय फसल चुनें।"
                  : language === "mr"
                  ? "कृपया प्रोफाइलमध्ये आपले सक्रिय पीक निवडा."
                  : "Please select an active crop in your profile.")
          }
        />
      </Card>
    );
  }

  const deficiencies = fertilizerData.Deficiencies || [];
  const recommendations = fertilizerData.Recommendations || [];
  const hasDeficiency = deficiencies.length > 0;

  return (
    <Card className="fertilizer-card">
      <div className="fertilizer-card-header">
        <div>
          <h3 className="card-heading">
            {t.fertilizer || "Fertilizer Advisory"}
          </h3>
          <p className="card-subheading">
            {cropName ? `${t.fertilizerAnalysis || "Analysis for"} ${cropName}` : "Crop Nutrition"}
          </p>
        </div>

        <StatusPill
          tone={hasDeficiency ? "act" : "good"}
          label={
            hasDeficiency
              ? (language === "hi" ? "पोषक तत्व कमी" : language === "mr" ? "कमतरता आढळली" : "Deficiency Found")
              : (language === "hi" ? "संतुलित पोषण" : language === "mr" ? "संतुलित पोषण" : "Balanced Nutrition")
          }
        />
      </div>

      {/* Deficiency Tags */}
      {hasDeficiency && (
        <div className="deficiency-section">
          <span className="deficiency-label">
            {language === "hi" ? "कमी वाले तत्व:" : language === "mr" ? "कमतरता असलेली पोषकद्रव्ये:" : "Deficient Nutrients:"}
          </span>
          <div className="deficiency-tags-row">
            {deficiencies.map((def, idx) => (
              <span key={idx} className="deficiency-tag">
                ⚠️ {def}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Fertilizers List */}
      <div className="recommended-fertilizers-list">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx} className="fertilizer-item-row">
              <div className="fertilizer-item-icon">🌱</div>
              <div className="fertilizer-item-info">
                <span className="fertilizer-item-name">{rec.Fertilizer}</span>
                {rec.Addresses && (
                  <span className="fertilizer-item-address">
                    {language === "hi" ? "उपचार: " : language === "mr" ? "उपाय: " : "Addresses: "}
                    {rec.Addresses}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="fertilizer-balanced-box">
            <span className="fertilizer-balanced-icon">✅</span>
            <p className="fertilizer-balanced-text">
              {t.noMajorDeficiency || "No major N/P/K deficiency detected. Maintain standard scheduled basal dosage."}
            </p>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="fertilizer-disclaimer">
        {t.fertilizerNote ||
          "⚠️ Dosages are indicative models. Verify with your local Krishi Vigyan Kendra (KVK) soil testing lab."}
      </p>
    </Card>
  );
}
