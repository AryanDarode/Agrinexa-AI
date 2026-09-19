import React from "react";
import ActionCard from "../common/ActionCard";
import SectionHeader from "../common/SectionHeader";
import Card from "../common/Card";
import translations from "../../translations";
import { SparklesIcon, DropletIcon, AlertTriangleIcon, LeafIcon, ShieldCheckIcon } from "../common/Icons";

export default function FarmActionHero({
  weather,
  cropStage,
  irrigationData,
  pestData,
  fertilizerData,
  language = "en",
  onActionClick
}) {
  const t = translations[language] || translations.en;

  const actions = [];

  // 1. Irrigation Priority Check
  if (irrigationData) {
    const priority = (irrigationData.Irrigation_Priority || irrigationData.Priority || "").toLowerCase();
    const isHigh = priority.includes("high") || priority.includes("urgent");
    const isMedium = priority.includes("med");

    const advice =
      irrigationData.Irrigation_Advice ||
      irrigationData.Advice ||
      (language === "hi"
        ? "मिट्टी की नमी जांचें और आवश्यकता पड़ने पर सिंचाई करें।"
        : language === "mr"
        ? "मातीतील ओलावा तपासा आणि गरज असल्यास पाणी द्या."
        : "Check soil moisture and irrigate if required.");

    actions.push({
      id: "irrigation",
      priorityOrder: isHigh ? 1 : isMedium ? 3 : 5,
      tone: isHigh ? "act" : isMedium ? "watch" : "good",
      icon: <DropletIcon size={20} />,
      title: language === "hi" ? "सिंचाई सलाह" : language === "mr" ? "सिंचन सल्ला" : "Irrigation Advisory",
      description: advice,
      badgeText: isHigh
        ? (language === "hi" ? "उच्च प्राथमिकता" : language === "mr" ? "उच्च प्राधान्य" : "High Priority")
        : (language === "hi" ? "सामान्य" : language === "mr" ? "सामान्य" : "Normal"),
      actionLabel: isHigh ? (language === "hi" ? "सिंचाई विवरण" : language === "mr" ? "सिंचन तपशील" : "View Irrigation") : null,
      onClick: () => onActionClick?.("irrigation")
    });
  }

  // 2. Pest & Disease Risk Check
  if (pestData) {
    const risk = (pestData.Pest_Disease_Risk || pestData.Risk || "").toLowerCase();
    const isHighRisk = risk.includes("high") || risk.includes("severe") || risk.includes("alert");
    const isMedRisk = risk.includes("med") || risk.includes("moderate");

    const advice =
      pestData.Advice ||
      (language === "hi"
        ? `वर्तमान कीट और रोग जोखिम: ${pestData.Pest_Disease_Risk || "सामान्य"}`
        : language === "mr"
        ? `सध्याचा कीड आणि रोग धोका: ${pestData.Pest_Disease_Risk || "सामान्य"}`
        : `Current pest and disease risk is ${pestData.Pest_Disease_Risk || "Normal"}.`);

    actions.push({
      id: "pest",
      priorityOrder: isHighRisk ? 1 : isMedRisk ? 2 : 6,
      tone: isHighRisk ? "risk" : isMedRisk ? "act" : "good",
      icon: <AlertTriangleIcon size={20} />,
      title: language === "hi" ? "कीट व रोग सुरक्षा" : language === "mr" ? "कीड व रोग संरक्षण" : "Pest & Disease Risk",
      description: advice,
      badgeText: isHighRisk
        ? (language === "hi" ? "उच्च जोखिम" : language === "mr" ? "उच्च धोका" : "High Risk")
        : (language === "hi" ? "सतर्कता" : language === "mr" ? "सतर्कता" : "Monitored"),
      actionLabel: isHighRisk ? (language === "hi" ? "उपचार देखें" : language === "mr" ? "उपाय पहा" : "View Advisory") : null,
      onClick: () => onActionClick?.("pest")
    });
  }

  // 3. Crop Stage Action Check
  if (cropStage && (cropStage.Stage_Action || cropStage.Action)) {
    const actionText = cropStage.Stage_Action || cropStage.Action;
    actions.push({
      id: "stage",
      priorityOrder: 4,
      tone: "good",
      icon: <LeafIcon size={20} />,
      title: language === "hi"
        ? `${cropStage.Crop || "फसल"} - वर्तमान अवस्था`
        : language === "mr"
        ? `${cropStage.Crop || "पीक"} - सध्याची अवस्था`
        : `${cropStage.Crop || "Crop"} - Growth Stage`,
      description: actionText,
      badgeText: cropStage.Crop_Stage || cropStage.Stage || "Active Stage",
      actionLabel: language === "hi" ? "अवस्था विवरण" : language === "mr" ? "अवस्था तपशील" : "Stage Details",
      onClick: () => onActionClick?.("stage")
    });
  }

  // 4. Fertilizer Action Check
  if (fertilizerData && (fertilizerData.Recommendation || fertilizerData.Deficiencies?.length > 0)) {
    const hasDeficiency = fertilizerData.Deficiencies && fertilizerData.Deficiencies.length > 0;
    const recText = fertilizerData.Recommendation ||
      (language === "hi"
        ? `सिफारिश किए गए उर्वरक: ${fertilizerData.Recommendations?.map(r => r.Fertilizer).join(", ") || "संतुलित मात्रा"}`
        : language === "mr"
        ? `शिफारस केलेली खते: ${fertilizerData.Recommendations?.map(r => r.Fertilizer).join(", ") || "संतुलित मात्रा"}`
        : `Recommended fertilizers: ${fertilizerData.Recommendations?.map(r => r.Fertilizer).join(", ") || "Standard dosage"}`);

    actions.push({
      id: "fertilizer",
      priorityOrder: hasDeficiency ? 2 : 5,
      tone: hasDeficiency ? "act" : "good",
      icon: "🧪",
      title: language === "hi" ? "उर्वरक पोषण सलाह" : language === "mr" ? "खत पोषण सल्ला" : "Fertilizer Advisory",
      description: recText,
      badgeText: hasDeficiency
        ? (language === "hi" ? "पोषक तत्व कमी" : language === "mr" ? "पोषकद्रव्य कमतरता" : "Nutrient Deficit")
        : (language === "hi" ? "संतुलित" : language === "mr" ? "संतुलित" : "Balanced"),
      actionLabel: language === "hi" ? "मात्रा देखें" : language === "mr" ? "मात्रा पहा" : "View Dosage",
      onClick: () => onActionClick?.("fertilizer")
    });
  }

  // Sort by highest priority
  actions.sort((a, b) => a.priorityOrder - b.priorityOrder);

  return (
    <section className="farm-actions-section" aria-labelledby="today-actions-heading">
      <SectionHeader
        title={t.todayFarmAction || (language === "hi" ? "आज के कृषि कार्य" : language === "mr" ? "आजची शेती कामे" : "Today's Farm Action")}
        subtitle={language === "hi" ? "आपके खेत की वर्तमान परिस्थितियों पर आधारित प्राथमिकताएं" : language === "mr" ? "तुमच्या शेताच्या सद्यस्थितीवर आधारित प्राधान्ये" : "Prioritized decisions generated from live farm telemetry"}
        action={
          actions.length > 0 ? (
            <span className="actions-count-badge">
              {actions.length} {language === "hi" ? "कार्य" : language === "mr" ? "कामे" : "Advisories"}
            </span>
          ) : null
        }
      />

      <div className="farm-actions-grid">
        {actions.length > 0 ? (
          actions.map((act) => (
            <ActionCard
              key={act.id}
              tone={act.tone}
              icon={act.icon}
              title={act.title}
              description={act.description}
              badgeText={act.badgeText}
              actionLabel={act.actionLabel}
              onAction={act.onClick}
            />
          ))
        ) : (
          <Card variant="default" className="calm-status-card">
            <div className="calm-status-content">
              <div className="calm-status-icon">
                <ShieldCheckIcon size={28} />
              </div>
              <div>
                <h3 className="calm-status-title">
                  {language === "hi" ? "सभी स्थितियां अनुकूल हैं" : language === "mr" ? "सर्व परिस्थिती अनुकूल आहे" : "All Farm Conditions Optimal"}
                </h3>
                <p className="calm-status-desc">
                  {language === "hi"
                    ? "आज किसी तत्काल हस्तक्षेप की आवश्यकता नहीं है। मौसम और मिट्टी की स्थिति आपकी फसल के लिए स्थिर है।"
                    : language === "mr"
                    ? "आज कोणत्याही तातडीच्या हस्तक्षेपाची गरज नाही. हवामान आणि मातीची स्थिती तुमच्या पिकासाठी स्थिर आहे."
                    : "No urgent actions needed today. Weather, soil moisture, and pest telemetry are within safe thresholds."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}
