import React, { useState } from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import Button from "../common/Button";
import Skeleton from "../common/Skeleton";
import EmptyState from "../common/EmptyState";
import translations from "../../translations";
import { PlusIcon, CalendarIcon, XIcon, CheckIcon } from "../common/Icons";

export default function FarmHistoryView({
  farmRecords = [],
  loading,
  farmerId,
  language = "en",
  onRecordAdded
}) {
  const t = translations[language] || translations.en;
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    crop: "",
    season: "Kharif",
    area: "",
    sowingDate: new Date().toISOString().split("T")[0],
    year: new Date().getFullYear()
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.crop.trim()) {
      setFormError(language === "hi" ? "कृपया फसल का नाम दर्ज करें।" : language === "mr" ? "कृपया पिकाचे नाव टाका." : "Please specify a crop name.");
      return;
    }
    if (!farmerId) {
      setFormError(language === "hi" ? "किसान आईडी नहीं मिली।" : "Farmer profile ID not found.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        crop: form.crop.trim(),
        season: form.season,
        area: form.area ? parseFloat(form.area) : 1.0,
        sowing_date: form.sowingDate,
        year: parseInt(form.year, 10) || new Date().getFullYear()
      };

      const res = await fetch(`http://127.0.0.1:8000/api/farmers/${farmerId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save historical farm record");
      }

      const savedRecord = await res.json();
      onRecordAdded?.(savedRecord);
      setShowAddModal(false);
      setForm({
        crop: "",
        season: "Kharif",
        area: "",
        sowingDate: new Date().toISOString().split("T")[0],
        year: new Date().getFullYear()
      });
    } catch (err) {
      console.error("Save record error:", err);
      setFormError(err.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="farm-history-container">
        <SectionHeader
          title={t.farmHistory || "Farm History"}
          subtitle={t.farmHistoryDescription || "Historical crop records"}
        />
        <div className="history-timeline">
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ marginBottom: "16px" }}>
              <Skeleton width="40%" height="22px" style={{ marginBottom: "8px" }} />
              <Skeleton width="70%" height="16px" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="farm-history-container">
      <SectionHeader
        title={t.farmHistory || "Farm History & Seasons"}
        subtitle={t.farmHistoryDescription || "Track previous crop yields, sowing dates, and harvest seasons"}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={() => setShowAddModal(true)}
          >
            {t.addFarmRecord || "Add Record"}
          </Button>
        }
      />

      {farmRecords.length === 0 ? (
        <Card>
          <EmptyState
            icon="📜"
            title={t.farmHistory || "No Farm Records Yet"}
            description={
              language === "hi"
                ? "अपने पिछले मौसमों और फसलों का इतिहास दर्ज करें ताकि एआई अधिक सटीक सुझाव दे सके।"
                : language === "mr"
                ? "मागील हंगाम आणि पिकांचा इतिहास नोंदवा जेणेकरून एआय अचूक मार्गदर्शन करू शकेल."
                : "Record your previous crop seasons to build personalized agricultural intelligence for your farm."
            }
            actionLabel={t.addFirstRecord || "Add First Record"}
            onAction={() => setShowAddModal(true)}
          />
        </Card>
      ) : (
        <div className="history-timeline">
          {farmRecords.map((rec, index) => (
            <Card key={rec.id || index} className="history-record-card">
              <div className="history-record-left">
                <div className="history-year-badge">
                  <span>{rec.year || rec.Year || "—"}</span>
                </div>
                <div className="history-details">
                  <h4 className="history-crop-name">{rec.crop || rec.Crop}</h4>
                  <div className="history-meta-row">
                    <span className="history-meta-item">
                      🌾 {rec.season || rec.Season}
                    </span>
                    {(rec.area || rec.Area) && (
                      <span className="history-meta-item">
                        📐 {rec.area || rec.Area} {language === "hi" ? "एकड़" : language === "mr" ? "एकर" : "acres"}
                      </span>
                    )}
                    {(rec.sowing_date || rec.sowingDate) && (
                      <span className="history-meta-item">
                        <CalendarIcon size={12} />
                        {new Date(rec.sowing_date || rec.sowingDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="history-status-tag">Recorded</span>
            </Card>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="history-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-record-modal-title"
          >
            <div className="history-modal-header">
              <h3 id="add-record-modal-title" className="modal-title">
                {t.addFarmRecord || "Add Farm Record"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="history-form">
              {formError && (
                <div className="form-error-banner">
                  <span>⚠️ {formError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t.currentCrop || "Crop Name"} *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rice, Cotton, Soybean, Wheat"
                  value={form.crop}
                  onChange={(e) => setForm({ ...form, crop: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.season || "Season"}</label>
                  <select
                    className="form-input"
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                  >
                    <option value="Kharif">Kharif (खरीफ)</option>
                    <option value="Rabi">Rabi (रबी)</option>
                    <option value="Zaid">Zaid (ज़ायद / उन्हाळी)</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.year || "Year"}</label>
                  <input
                    type="number"
                    className="form-input"
                    min="2000"
                    max="2099"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.farmArea || "Area (Acres)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="e.g. 2.5"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.sowingDate || "Sowing Date"}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.sowingDate}
                    onChange={(e) => setForm({ ...form, sowingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="history-form-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  {language === "hi" ? "रद्द करें" : language === "mr" ? "रद्द करा" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  {language === "hi" ? "सुरक्षित करें" : language === "mr" ? "जतन करा" : "Save Record"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
