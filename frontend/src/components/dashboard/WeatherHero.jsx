import React from "react";
import Card from "../common/Card";
import MetricTile from "../common/MetricTile";
import Skeleton from "../common/Skeleton";
import ErrorState from "../common/ErrorState";
import translations from "../../translations";
import { DropletIcon, WindIcon, SparklesIcon } from "../common/Icons";

export default function WeatherHero({
  weather,
  loading,
  error,
  onRetry,
  locationName,
  language = "en"
}) {
  const t = translations[language] || translations.en;

  const getWeatherIcon = (condition) => {
    const c = (condition || "").toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
    if (c.includes("cloud") || c.includes("overcast")) return "⛅";
    if (c.includes("thunder") || c.includes("storm")) return "⛈️";
    if (c.includes("clear") || c.includes("sunny")) return "☀️";
    if (c.includes("fog") || c.includes("mist") || c.includes("haze")) return "🌫️";
    return "🌤️";
  };

  if (loading) {
    return (
      <Card variant="hero" className="weather-hero-card">
        <div className="weather-hero-loading">
          <div className="weather-hero-main-skeleton">
            <Skeleton variant="circle" width="64px" height="64px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="120px" height="36px" style={{ marginBottom: "8px" }} />
              <Skeleton width="180px" height="18px" />
            </div>
          </div>
          <div className="weather-metrics-grid">
            <Skeleton height="72px" borderRadius="var(--radius-md)" />
            <Skeleton height="72px" borderRadius="var(--radius-md)" />
            <Skeleton height="72px" borderRadius="var(--radius-md)" />
            <Skeleton height="72px" borderRadius="var(--radius-md)" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card variant="hero" className="weather-hero-card">
        <ErrorState
          title={t.weatherUnavailable || "Weather Unavailable"}
          message={error || t.weatherUnavailableDescription || "Unable to fetch live weather telemetry."}
          onRetry={onRetry}
          retryLabel={t.retry || "Retry"}
        />
      </Card>
    );
  }

  const temp = Math.round(weather.Temperature_C ?? 0);
  const humidity = weather["Humidity_%"] ?? weather.Humidity ?? "--";
  const rainfall = weather.Rainfall_mm ?? weather.Rainfall ?? 0;
  const windSpeed = weather.Wind_Speed_m_s ?? weather.Wind_Speed ?? "--";
  const condition = weather.Condition || (language === "hi" ? "साफ मौसम" : language === "mr" ? "स्वच्छ हवामान" : "Clear Sky");
  const weatherIcon = getWeatherIcon(condition);

  return (
    <div className="weather-hero-container">
      <Card variant="hero" className="weather-hero-card">
        <div className="weather-hero-inner">
          {/* Main Weather Display */}
          <div className="weather-hero-primary">
            <div className="weather-icon-badge" aria-hidden="true">
              <span className="weather-emoji">{weatherIcon}</span>
            </div>
            
            <div className="weather-temp-group">
              <div className="weather-temp-row">
                <span className="weather-temp-val">{temp}</span>
                <span className="weather-temp-unit">°C</span>
              </div>
              <div className="weather-condition-row">
                <span className="weather-condition-text">{condition}</span>
                {locationName && (
                  <span className="weather-location-sub">
                    📍 {locationName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4 Supporting MetricTiles */}
          <div className="weather-metrics-grid">
            <MetricTile
              label={t.humidity || "Humidity"}
              value={humidity}
              unit="%"
              icon={<DropletIcon size={16} />}
              trend={humidity > 70 ? "high" : humidity < 30 ? "low" : "normal"}
            />
            <MetricTile
              label={t.rainfall || "Rainfall"}
              value={rainfall}
              unit="mm"
              icon="🌧️"
              trend={rainfall > 0 ? "high" : "normal"}
            />
            <MetricTile
              label={t.wind || "Wind Speed"}
              value={windSpeed}
              unit="m/s"
              icon={<WindIcon size={16} />}
            />
            <MetricTile
              label={language === "hi" ? "स्थिति" : language === "mr" ? "स्थिती" : "Condition"}
              value={rainfall > 5 ? (language === "hi" ? "नम" : language === "mr" ? "दमट" : "Wet") : (language === "hi" ? "अनुकूल" : language === "mr" ? "योग्य" : "Favorable")}
              icon={<SparklesIcon size={16} />}
              tone={rainfall > 5 ? "water" : "good"}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
