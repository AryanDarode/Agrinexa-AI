import React, { useState } from "react";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import Button from "../common/Button";
import translations from "../../translations";
import { UserIcon, MapPinIcon, CalendarIcon, EditIcon, XIcon, CheckIcon } from "../common/Icons";

export default function ProfileView({
  farmerDetails,
  language = "en",
  onLanguageChange,
  onProfileUpdated,
  onSignOut
}) {
  const t = translations[language] || translations.en;
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    farmerName: farmerDetails?.farmerName || "",
    mobile: farmerDetails?.mobile || "",
    location: farmerDetails?.location || "",
    area: farmerDetails?.area || "",
    season: farmerDetails?.season || "Kharif",
    crop: farmerDetails?.crop || "",
    sowingDate: farmerDetails?.sowingDate || ""
  });

  const handleOpenEdit = () => {
    setFormData({
      farmerName: farmerDetails?.farmerName || "",
      mobile: farmerDetails?.mobile || "",
      location: farmerDetails?.location || "",
      area: farmerDetails?.area || "",
      season: farmerDetails?.season || "Kharif",
      crop: farmerDetails?.crop || "",
      sowingDate: farmerDetails?.sowingDate || ""
    });
    setErrorMsg("");
    setSuccessMsg("");
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!farmerDetails?.id) {
      setErrorMsg("Farmer ID not found.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        farmer_name: formData.farmerName.trim(),
        mobile: formData.mobile.trim(),
        location: formData.location.trim(),
        area: parseFloat(formData.area) || 1.0,
        season: formData.season,
        crop: formData.crop.trim(),
        sowing_date: formData.sowingDate
      };

      const res = await fetch(`http://127.0.0.1:8000/api/farmers/${farmerDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to update farmer profile in database.");
      }

      const updated = await res.json();
      const mappedDetails = {
        id: updated.id,
        farmerName: updated.farmer_name,
        mobile: updated.mobile,
        location: updated.location,
        area: updated.area,
        season: updated.season,
        crop: updated.crop,
        sowingDate: updated.sowing_date
      };

      onProfileUpdated?.(mappedDetails);
      setIsEditing(false);
      setSuccessMsg(language === "hi" ? "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!" : language === "mr" ? "प्रोफाइल यशस्वीरित्या अपडेट केली!" : "Profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMsg(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-view-container">
      <SectionHeader
        title={t.farmerProfile || "Farmer Profile & Farm Settings"}
        subtitle={language === "hi" ? "आपकी व्यक्तिगत एवं कृषि संबंधी जानकारी" : language === "mr" ? "तुमची वैयक्तिक व शेतीविषयक माहिती" : "Manage your farm location, crops, and application preferences"}
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={<EditIcon size={16} />}
            onClick={handleOpenEdit}
          >
            {language === "hi" ? "प्रोफ़ाइल बदलें" : language === "mr" ? "प्रोफाइल बदला" : "Edit Profile"}
          </Button>
        }
      />

      {successMsg && (
        <div className="form-success-banner">
          <CheckIcon size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="profile-summary-card">
        <div className="profile-avatar-row">
          <div className="profile-avatar-circle">
            <UserIcon size={36} />
          </div>
          <div className="profile-avatar-info">
            <h3 className="profile-name-text">{farmerDetails?.farmerName || "Farmer"}</h3>
            <p className="profile-phone-text">📱 +91 {farmerDetails?.mobile || "—"}</p>
            <span className="profile-location-chip">
              <MapPinIcon size={14} />
              {farmerDetails?.location || "India"}
            </span>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span className="profile-stat-label">{t.currentCrop || "Current Crop"}</span>
            <span className="profile-stat-val">🌱 {farmerDetails?.crop || "Not Selected"}</span>
          </div>

          <div className="profile-stat-box">
            <span className="profile-stat-label">{t.season || "Season"}</span>
            <span className="profile-stat-val">☀️ {farmerDetails?.season || "Kharif"}</span>
          </div>

          <div className="profile-stat-box">
            <span className="profile-stat-label">{t.farmArea || "Total Land Area"}</span>
            <span className="profile-stat-val">📐 {farmerDetails?.area || "—"} {language === "hi" ? "एकड़" : language === "mr" ? "एकर" : "Acres"}</span>
          </div>

          <div className="profile-stat-box">
            <span className="profile-stat-label">{t.sowingDate || "Sowing Date"}</span>
            <span className="profile-stat-val">
              <CalendarIcon size={14} />
              {farmerDetails?.sowingDate ? new Date(farmerDetails.sowingDate).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </Card>

      {/* App Preferences */}
      <Card className="preferences-card">
        <h4 className="preferences-title">🌐 {language === "hi" ? "भाषा प्राथमिकता" : language === "mr" ? "भाषा प्राधान्य" : "Language Preferences"}</h4>
        <p className="preferences-desc">
          {language === "hi"
            ? "ऐप्लिकेशन में उपयोग की जाने वाली मुख्य भाषा चुनें:"
            : language === "mr"
            ? "अ‍ॅपमध्ये वापरली जाणारी मुख्य भाषा निवडा:"
            : "Choose your preferred interface language across Agrinexa AI:"}
        </p>

        <div className="lang-buttons-row">
          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिन्दी (Hindi)" },
            { code: "mr", label: "मराठी (Marathi)" }
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              className={`pref-lang-btn ${language === l.code ? "active" : ""}`}
              onClick={() => onLanguageChange?.(l.code)}
            >
              {l.label}
              {language === l.code && <CheckIcon size={16} />}
            </button>
          ))}
        </div>
      </Card>

      {/* Sign Out Section */}
      {onSignOut && (
        <Card className="signout-card">
          <div className="signout-card-content">
            <div className="signout-card-info">
              <span className="signout-icon">🚪</span>
              <div>
                <h4 className="signout-title">
                  {language === "hi" ? "खाते से बाहर निकलें" : language === "mr" ? "खाते बाहेर पडा" : "Sign Out"}
                </h4>
                <p className="signout-desc">
                  {language === "hi"
                    ? "आप अपने खाते से सुरक्षित रूप से बाहर निकल जाएंगे।"
                    : language === "mr"
                    ? "तुमच्या खात्यातून सुरक्षितपणे बाहेर पडा."
                    : "You will be securely signed out from your account."}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="signout-btn"
              onClick={onSignOut}
            >
              {language === "hi" ? "बाहर निकलें →" : language === "mr" ? "बाहेर पडा →" : "Sign Out →"}
            </button>
          </div>
        </Card>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-backdrop" onClick={() => setIsEditing(false)}>
          <div
            className="profile-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="profile-modal-header">
              <h3 id="edit-profile-title" className="modal-title">
                {language === "hi" ? "प्रोफ़ाइल संपादित करें" : language === "mr" ? "प्रोफाइल संपादित करा" : "Edit Farmer Profile"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditing(false)}
                aria-label="Close"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="profile-form">
              {errorMsg && (
                <div className="form-error-banner">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t.farmerName || "Farmer Name"} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.farmerName}
                  onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.mobileNumber || "Mobile Number"} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.locationDistrict || "Location (District)"} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.currentCrop || "Current Crop"} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.season || "Season"}</label>
                  <select
                    className="form-input"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{t.farmArea || "Farm Area (Acres)"}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t.sowingDate || "Sowing Date"}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.sowingDate}
                    onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="profile-form-footer">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  {language === "hi" ? "रद्द करें" : language === "mr" ? "रद्द करा" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                >
                  {language === "hi" ? "सुरक्षित करें" : language === "mr" ? "जतन करा" : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
