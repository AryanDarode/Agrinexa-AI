import React from "react";
import Icon from "./Icons";
import StatusPill from "./StatusPill";

/**
 * Agrinexa AI — Action Card
 * Core component for "Today's Farm Action" & urgent decision advisories.
 * Features: category icon, imperative headline, one-line why, status badge, and action trigger.
 */
export function ActionCard({
  iconName = "sprout",
  category,
  title,
  reason,
  statusTone = "watch",
  statusLabel,
  onClick,
  className = "",
  style = {}
}) {
  const categoryToneColors = {
    irrigation: { icon: "var(--water)", bg: "var(--water-bg)" },
    pest: { icon: "var(--danger)", bg: "var(--danger-bg)" },
    fertilizer: { icon: "var(--green-700)", bg: "var(--green-100)" },
    stage: { icon: "var(--green-700)", bg: "var(--green-100)" },
    weather: { icon: "var(--warn)", bg: "var(--warn-bg)" }
  };

  const currentTheme = categoryToneColors[category] || {
    icon: "var(--green-700)",
    bg: "var(--green-100)"
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      className={`ag-action-card ${className}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-1)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        transition: "var(--transition-default)",
        cursor: isClickable ? "pointer" : "default",
        ...style
      }}
    >
      {/* Icon Badge */}
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "var(--radius-md)",
          backgroundColor: currentTheme.bg,
          color: currentTheme.icon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px"
        }}
      >
        <Icon name={iconName} size={20} color={currentTheme.icon} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "4px" }}>
          {category && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.04em"
              }}
            >
              {category}
            </span>
          )}
          {statusLabel && (
            <StatusPill tone={statusTone} label={statusLabel} size="sm" />
          )}
        </div>

        <h3
          style={{
            fontSize: "var(--text-base)",
            fontWeight: 700,
            color: "var(--text-1)",
            lineHeight: 1.3,
            margin: "0 0 4px 0"
          }}
        >
          {title}
        </h3>

        {reason && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-2)",
              lineHeight: 1.4,
              margin: 0
            }}
          >
            {reason}
          </p>
        )}
      </div>

      {isClickable && (
        <div style={{ alignSelf: "center", color: "var(--text-3)", flexShrink: 0 }}>
          <Icon name="chevronRight" size={18} />
        </div>
      )}
    </div>
  );
}

export default ActionCard;
