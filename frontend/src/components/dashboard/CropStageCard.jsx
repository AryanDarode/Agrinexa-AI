import React from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import StatusPill from "../common/StatusPill";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { LeafIcon, CalendarIcon } from "../common/Icons";

export default function CropStageCard({
  cropStage,
  loading,
  cropName,
  sowingDate,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  if (loading) {
    return (
      <Card>
        <Skeleton width="180px" height="24px" style={{ marginBottom: "16px" }} />
        <Skeleton width="100%" height="16px" borderRadius="999px" style={{ marginBottom: "16px" }} />
        <Skeleton width="80%" height="18px" />
      </Card>
    );
  }

  if (!cropStage) {
    return (
      <Card>
        <EmptyState
          icon="🌱"
          title={t.cropStageUnavailable || "Crop Stage Unavailable"}
          description={
            cropName
              ? (language === "hi"
                  ? `${cropName} के लिए बुवाई की तारीख दर्ज करके विकास अवस्था ट्रैक करें।`
                  : language === "mr"
                  ? `${cropName} साठी पेरणी तारीख नोंदवून वाढीची अवस्था ट्रॅक करा.`
                  : `Set sowing date to track growth progression for ${cropName}.`)
              : (language === "hi"
                  ? "कृपया प्रोफ़ाइल में अपनी सक्रिय फसल चुनें।"
                  : language === "mr"
                  ? "कृपया प्रोफाइलमध्ये आपले सक्रिय पीक निवडा."
                  : "Select an active crop in your profile to view stage progress.")
          }
        />
      </Card>
    );
  }

  const ageDays = cropStage.Crop_Age_Days ?? 0;
  const currentStageName = cropStage.Crop_Stage || cropStage.Stage || "Vegetative";
  const startDay = cropStage.Start_Day ?? 0;
  const endDay = cropStage.End_Day ?? Math.max(120, ageDays + 30);
  const stageAction = cropStage.Stage_Action || cropStage.Action;

  // Stages array for progress timeline
  const standardStages = [
    { key: "sowing", label: language === "hi" ? "बुवाई" : language === "mr" ? "पेरणी" : "Sowing", days: "0-15" },
    { key: "vegetative", label: language === "hi" ? "वानस्पतिक" : language === "mr" ? "शाकीय वाढ" : "Vegetative", days: "15-45" },
    { key: "flowering", label: language === "hi" ? "फूल आना" : language === "mr" ? "फुलोरा" : "Flowering", days: "45-75" },
    { key: "grain", label: language === "hi" ? "दाना भराव" : language === "mr" ? "दाणे भरणे" : "Grain Filling", days: "75-105" },
    { key: "maturity", label: language === "hi" ? "परिपक्वता" : language === "mr" ? "कापणी" : "Maturity", days: "105+" }
  ];

  // Calculate percentage through current stage or total cycle
  const maxCycle = Math.max(endDay, 120);
  const progressPercent = Math.min(100, Math.round((ageDays / maxCycle) * 100));

  return (
    <Card className="crop-stage-card">
      <div className="crop-stage-header">
        <div className="crop-stage-title-group">
          <div className="crop-stage-icon">
            <LeafIcon size={20} />
          </div>
          <div>
            <h3 className="card-heading">
              {cropStage.Crop || cropName || "Current Crop"}
            </h3>
            <p className="card-subheading">
              {language === "hi" ? "सक्रिय विकास अवस्था" : language === "mr" ? "सक्रिय वाढीची अवस्था" : "Active Crop Growth Stage"}
            </p>
          </div>
        </div>

        <div className="crop-age-badge">
          <span className="crop-age-number">{ageDays}</span>
          <span className="crop-age-unit">{t.days || "days"}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="stage-progress-container">
        <div className="stage-progress-track">
          <div
            className="stage-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {/* Stage Nodes */}
        <div className="stage-nodes-row">
          {standardStages.map((st, idx) => {
            const isPassed = (idx / standardStages.length) * 100 <= progressPercent;
            const isCurrent = currentStageName.toLowerCase().includes(st.key) ||
              (idx === Math.floor((progressPercent / 100) * standardStages.length));

            return (
              <div
                key={st.key}
                className={`stage-node-item ${isPassed ? "passed" : ""} ${isCurrent ? "current" : ""}`}
              >
                <div className="stage-node-dot" />
                <span className="stage-node-label">{st.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Info Box */}
      <div className="current-stage-info-box">
        <div className="current-stage-top">
          <div className="stage-pill-group">
            <span className="stage-status-label">
              {language === "hi" ? "वर्तमान चरण:" : language === "mr" ? "सध्याचा टप्पा:" : "Current Stage:"}
            </span>
            <StatusPill tone="good" label={currentStageName} />
          </div>

          {sowingDate && (
            <div className="sowing-date-tag">
              <CalendarIcon size={14} />
              <span>
                {language === "hi" ? "बुवाई:" : language === "mr" ? "पेरणी:" : "Sown:"}{" "}
                {new Date(sowingDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {stageAction && (
          <div className="stage-action-notice">
            <span className="stage-action-icon">💡</span>
            <p className="stage-action-text">{stageAction}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
