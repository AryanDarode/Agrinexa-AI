import React from "react";
import Card from "../common/Card";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { SparklesIcon } from "../common/Icons";

export default function YieldCard({
  yieldData,
  loading,
  cropName,
  areaAcres,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  const supportedCrops = ["Rice", "Maize", "Chickpea", "Cotton", "Cotton(lint)", "Gram"];
  const isSupported = cropName && supportedCrops.some(
    (c) => c.toLowerCase() === cropName.toLowerCase()
  );

  if (loading) {
    return (
      <Card>
        <Skeleton width="180px" height="24px" style={{ marginBottom: "16px" }} />
        <Skeleton width="120px" height="48px" style={{ marginBottom: "12px" }} />
        <Skeleton width="200px" height="16px" />
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card className="yield-card">
        <div className="yield-card-header">
          <div className="yield-title-group">
            <div className="yield-icon-badge">
              <SparklesIcon size={18} />
            </div>
            <div>
              <h3 className="card-heading">{t.expectedYield || "Expected Yield Prediction"}</h3>
              <p className="card-subheading">{cropName || "Crop Forecast"}</p>
            </div>
          </div>
        </div>

        <div className="yield-unsupported-box">
          <p className="yield-unsupported-msg">
            {t.yieldUnavailable ||
              (language === "hi"
                ? "उपज भविष्यवाणी मॉडल वर्तमान में चावल, मक्का, चना और कपास के लिए उपलब्ध है।"
                : language === "mr"
                ? "उत्पादन अंदाज मॉडेल सध्या भात, मका, हरभरा आणि कापूस पिकांसाठी उपलब्ध आहे."
                : "Machine Learning yield prediction model is currently calibrated for Rice, Maize, Chickpea & Cotton.")}
          </p>
          <div className="supported-crops-pills">
            {["🌾 Rice", "🌽 Maize", "🌱 Chickpea", "☁️ Cotton"].map((c, i) => (
              <span key={i} className="supported-crop-pill">{c}</span>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!yieldData) {
    return (
      <Card className="yield-card">
        <EmptyState
          icon="📈"
          title={t.expectedYield || "Yield Prediction"}
          description={
            language === "hi"
              ? "उपज गणना के लिए मौसम और मिट्टी के आंकड़े एकत्र किए जा रहे हैं।"
              : language === "mr"
              ? "उत्पादन अंदाजासाठी हवामान आणि मातीची आकडेवारी गोळा केली जात आहे."
              : "Gathering weather & soil telemetry for yield calculation."
          }
        />
      </Card>
    );
  }

  const predictedYield = Math.round(
    yieldData.Predicted_Yield ?? yieldData.predicted_yield ?? 0
  );
  const unit = yieldData.Unit || yieldData.unit || "kg / ha";

  // Calculate estimated farm total
  const acres = parseFloat(areaAcres) || 1;
  const hectares = acres * 0.404686;
  const totalFarmYieldKg = Math.round(predictedYield * hectares);
  const totalQuintals = (totalFarmYieldKg / 100).toFixed(1);

  return (
    <Card className="yield-card">
      <div className="yield-card-header">
        <div className="yield-title-group">
          <div className="yield-icon-badge">
            <SparklesIcon size={18} />
          </div>
          <div>
            <h3 className="card-heading">{t.expectedYield || "Expected Yield"}</h3>
            <p className="card-subheading">
              {t.predictedYieldFor || "Predicted for"} {cropName} ({acres} {language === "hi" ? "एकड़" : language === "mr" ? "एकर" : "acres"})
            </p>
          </div>
        </div>

        <span className="ml-model-badge">AI Forecast</span>
      </div>

      <div className="yield-numbers-row">
        <div className="yield-main-stat">
          <span className="yield-val-large">{predictedYield.toLocaleString()}</span>
          <span className="yield-unit-sub">{unit}</span>
        </div>

        {totalFarmYieldKg > 0 && (
          <div className="yield-farm-total-box">
            <span className="yield-total-label">
              {language === "hi" ? "खेत कुल अनुमान:" : language === "mr" ? "शेताचा एकूण अंदाज:" : "Estimated Total:"}
            </span>
            <span className="yield-total-val">
              {totalQuintals} {language === "hi" ? "क्विंटल" : language === "mr" ? "क्विंटल" : "Quintals"}
            </span>
          </div>
        )}
      </div>

      <p className="yield-disclaimer">
        {language === "hi"
          ? "⚠️ उपज पूर्वानुमान ऐतिहासिक जलवायु डेटा और औसत मिट्टी प्रबंधन पर आधारित एक सांख्यिकीय अनुमान है।"
          : language === "mr"
          ? "⚠️ उत्पादन अंदाज ऐतिहासिक हवामान डेटा आणि सरासरी व्यवस्थापनावर आधारित आहे."
          : "⚠️ Prediction is an AI projection based on historical seasonal trends, localized soil, and standard IPM practices."}
      </p>
    </Card>
  );
}
