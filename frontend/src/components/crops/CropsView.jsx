import React, { useState } from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import StatusPill from "../common/StatusPill";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";
import translations from "../../translations";
import { LeafIcon, ChevronRightIcon, SparklesIcon, CheckIcon, XIcon } from "../common/Icons";

export default function CropsView({
  recommendations = [],
  loading,
  currentCrop,
  locationName,
  season,
  language = "en",
  onSelectCrop
}) {
  const t = translations[language] || translations.en;
  const [selectedCropDetail, setSelectedCropDetail] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");

  if (loading) {
    return (
      <div className="crops-view-container">
        <SectionHeader
          title={t.recommendedCrops || "Crop Recommendations"}
          subtitle={language === "hi" ? "आपके क्षेत्र और मौसम के लिए उपयुक्त फसलें" : language === "mr" ? "तुमच्या क्षेत्रासाठी व हंगामासाठी योग्य पिके" : "AI recommendations for your district & season"}
        />
        <div className="crops-grid">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton width="60%" height="24px" style={{ marginBottom: "12px" }} />
              <Skeleton width="40%" height="18px" style={{ marginBottom: "16px" }} />
              <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="crops-view-container">
      <SectionHeader
        title={t.recommendedCrops || "Crop Intelligence & Recommendations"}
        subtitle={
          locationName && season
            ? `${locationName} • ${season} Season`
            : (language === "hi" ? "जलवायु और मिट्टी के आधार पर फसलों की उपयुक्तता" : language === "mr" ? "हवामान आणि मातीवर आधारित पिकांची शिफारस" : "Ranked by historical yield & soil compatibility")
        }
      />

      {recommendations.length === 0 ? (
        <Card>
          <EmptyState
            icon="🌾"
            title={t.recommendationsUnavailable || "No Recommendations Found"}
            description={
              t.noHistoricalCropData ||
              (language === "hi"
                ? "इस स्थान और मौसम के लिए कोई ऐतिहासिक फसल रिकॉर्ड नहीं मिला।"
                : language === "mr"
                ? "या ठिकाणासाठी आणि हंगामासाठी कोणताही ऐतिहासिक पीक डेटा सापडला नाही."
                : "No historical crop records found for this district and season.")
            }
          />
        </Card>
      ) : (
        <div className="crops-grid">
          {recommendations.map((rec, index) => {
            const cropName = rec.Crop || rec.crop || "Unknown Crop";
            const finalScore = Math.round(rec.Final_Score ?? rec.final_score ?? rec.Suitability_Score ?? 80);
            const soilScore = Math.round(rec.Soil_Score ?? rec.soil_score ?? 75);
            const histScore = Math.round(rec.Historical_Score ?? rec.historical_score ?? 85);
            const soilStatus = rec.Soil_Status || rec.soil_status || "Compatible";
            const isCurrent = currentCrop && currentCrop.toLowerCase() === cropName.toLowerCase();

            return (
              <Card
                key={index}
                className={`crop-rec-card ${isCurrent ? "current-crop-border" : ""}`}
              >
                <div className="crop-rec-top">
                  <div className="crop-rec-badge-group">
                    <span className="crop-rank-pill">#{index + 1}</span>
                    {isCurrent && (
                      <span className="current-crop-tag">
                        {language === "hi" ? "सक्रिय फसल" : language === "mr" ? "सक्रिय पीक" : "Active Crop"}
                      </span>
                    )}
                  </div>
                  <div className="match-score-badge">
                    <span className="match-score-num">{finalScore}%</span>
                    <span className="match-score-label">
                      {language === "hi" ? "मैच" : language === "mr" ? "योग्य" : "Match"}
                    </span>
                  </div>
                </div>

                <div className="crop-rec-info">
                  <h3 className="crop-rec-name">{cropName}</h3>
                  <div className="crop-scores-row">
                    <div className="score-item">
                      <span className="score-item-label">{t.historicalSuitability || "Historical"}</span>
                      <span className="score-item-val">{histScore}%</span>
                    </div>
                    <div className="score-item">
                      <span className="score-item-label">{t.soilCompatibility || "Soil Match"}</span>
                      <span className="score-item-val">{soilScore}%</span>
                    </div>
                  </div>
                </div>

                <div className="crop-rec-footer">
                  <StatusPill
                    tone={soilStatus.toLowerCase().includes("high") || soilStatus.toLowerCase().includes("comp") ? "good" : "watch"}
                    label={soilStatus}
                    size="sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCropDetail(rec);
                      setDetailTab("overview");
                    }}
                  >
                    {language === "hi" ? "विवरण देखें" : language === "mr" ? "तपशील पहा" : "Details"}
                    <ChevronRightIcon size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Crop Details Drill-Down Modal */}
      {selectedCropDetail && (
        <div className="modal-backdrop" onClick={() => setSelectedCropDetail(null)}>
          <div
            className="crop-details-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-modal-title"
          >
            <div className="crop-modal-header">
              <div>
                <div className="crop-modal-tag">
                  <LeafIcon size={16} />
                  <span>{season || "Kharif"} Recommendation</span>
                </div>
                <h2 id="crop-modal-title" className="crop-modal-title">
                  {selectedCropDetail.Crop || selectedCropDetail.crop}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCropDetail(null)}
                aria-label="Close modal"
              >
                <XIcon size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="crop-modal-tabs">
              {[
                { id: "overview", label: language === "hi" ? "अवलोकन" : language === "mr" ? "आढावा" : "Overview" },
                { id: "irrigation", label: language === "hi" ? "सिंचाई" : language === "mr" ? "सिंचन" : "Irrigation" },
                { id: "fertilizer", label: language === "hi" ? "उर्वरक" : language === "mr" ? "खत व्यवस्थापन" : "Fertilizer" },
                { id: "pest", label: language === "hi" ? "कीट प्रबंधन" : language === "mr" ? "कीड नियंत्रण" : "Pest Care" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`crop-modal-tab-btn ${detailTab === tab.id ? "active" : ""}`}
                  onClick={() => setDetailTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Tab Content */}
            <div className="crop-modal-body">
              {detailTab === "overview" && (
                <div className="modal-tab-content">
                  <div className="overview-stats-grid">
                    <div className="overview-stat-tile">
                      <span className="overview-stat-label">Total Suitability</span>
                      <span className="overview-stat-val">
                        {Math.round(selectedCropDetail.Final_Score ?? 80)}%
                      </span>
                    </div>
                    <div className="overview-stat-tile">
                      <span className="overview-stat-label">Soil Affinity</span>
                      <span className="overview-stat-val">
                        {Math.round(selectedCropDetail.Soil_Score ?? 75)}%
                      </span>
                    </div>
                    <div className="overview-stat-tile">
                      <span className="overview-stat-label">District Yield Trend</span>
                      <span className="overview-stat-val">
                        {Math.round(selectedCropDetail.Historical_Score ?? 85)}%
                      </span>
                    </div>
                  </div>
                  <p className="overview-desc-text">
                    {language === "hi"
                      ? `${selectedCropDetail.Crop} आपके जिले (${locationName || "स्थानीय क्षेत्र"}) की जलवायु और मिट्टी के लिए उच्च अनुकूलता प्रदर्शित करती है।`
                      : language === "mr"
                      ? `${selectedCropDetail.Crop} हे पीक आपल्या जिल्ह्यातील (${locationName || "स्थानिक क्षेत्र"}) हवामान आणि मातीसाठी अतिशय योग्य आहे.`
                      : `${selectedCropDetail.Crop} is highly aligned with the regional rainfall, temperature, and soil characteristics of ${locationName || "your district"}.`}
                  </p>
                </div>
              )}

              {detailTab === "irrigation" && (
                <div className="modal-tab-content">
                  <div className="advice-detail-box">
                    <h4>💧 {language === "hi" ? "सिंचाई अनुसूची" : language === "mr" ? "सिंचन वेळापत्रक" : "Irrigation Requirement"}</h4>
                    <p>
                      {language === "hi"
                        ? "अंकुरण, शाखा वृद्धि और फूल आने के नाजुक चरणों में मिट्टी में पर्याप्त नमी बनाए रखें। जलभराव से बचें।"
                        : language === "mr"
                        ? "उगवण, फुटवे फुटणे आणि फुलोरा या महत्त्वाच्या टप्प्यांवर जमिनीत योग्य ओलावा ठेवा. पाणी साचू देऊ नका."
                        : "Requires consistent moisture during flowering and pod/grain formation stages. Avoid water stagnation."}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === "fertilizer" && (
                <div className="modal-tab-content">
                  <div className="advice-detail-box">
                    <h4>🧪 {language === "hi" ? "पोषण प्रबंधन" : language === "mr" ? "खत नियोजन" : "Nutrient Management"}</h4>
                    <p>
                      {language === "hi"
                        ? "बुवाई के समय डीएपी (DAP) या एनपीके (NPK) की संतुलित खुराक दें। फसल की आवश्यकतानुसार यूरिया का छिड़काव करें।"
                        : language === "mr"
                        ? "पेरणीच्या वेळी डीएपी किंवा एनपीके खताचा योग्य वापर करा. गरजेनुसार युरियाची मात्रा विभागून द्या."
                        : "Apply balanced basal dose of NPK during sowing. Top-dress with Urea in split applications according to growth vigor."}
                    </p>
                  </div>
                </div>
              )}

              {detailTab === "pest" && (
                <div className="modal-tab-content">
                  <div className="advice-detail-box">
                    <h4>🐛 {language === "hi" ? "एकीकृत कीट प्रबंधन (IPM)" : language === "mr" ? "एकात्मिक कीड व्यवस्थापन" : "IPM Guidelines"}</h4>
                    <p>
                      {language === "hi"
                        ? "शुरुआती अवस्था में नीम के तेल (1500 PPM) का छिड़काव करें। पीले चिपचिपे ट्रैप का उपयोग करें।"
                        : language === "mr"
                        ? "सुरुवातीच्या टप्प्यात निंबोळी अर्क किंवा निम तेल (1500 PPM) फवारा. पिवळे चिकट सापळे लावा."
                        : "Proactively deploy yellow sticky traps and apply prophylactic neem oil (1500 PPM) spray during early vegetative stage."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="crop-modal-footer">
              <Button
                variant="secondary"
                onClick={() => setSelectedCropDetail(null)}
              >
                {language === "hi" ? "बंद करें" : language === "mr" ? "बंद करा" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
