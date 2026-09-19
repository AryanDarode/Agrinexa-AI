import React from "react";
import Icon from "./Icons";

/**
 * Agrinexa AI — Metric Tile
 * Used across weather, soil, farm overview, and crop parameters.
 * Highlights the primary numeric value (28-34px bold) with icon, label, and unit.
 */
export function MetricTile({
  iconName,
  iconNode,
  label,
  value,
  unit = "",
  tone = "default",
  variant = "sunk",
  className = "",
  style = {}
}) {
  const toneColors = {
    default: {
      iconColor: "var(--green-700)",
      bg: "var(--surface-sunk)"
    },
    water: {
      iconColor: "var(--water)",
      bg: "var(--water-bg)"
    },
    warn: {
      iconColor: "var(--warn)",
      bg: "var(--warn-bg)"
    },
    danger: {
      iconColor: "var(--danger)",
      bg: "var(--danger-bg)"
    },
    good: {
      iconColor: "var(--good)",
      bg: "var(--good-bg)"
    }
  };

  const currentTone = toneColors[tone] || toneColors.default;

  return (
    <div
      className={`ag-metric-tile ${className}`}
      style={{
        backgroundColor: variant === "sunk" ? "var(--surface-sunk)" : "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-2)",
        minHeight: "84px",
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: currentTone.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: currentTone.iconColor,
            flexShrink: 0
          }}
        >
          {iconNode ? iconNode : iconName ? <Icon name={iconName} size={16} color={currentTone.iconColor} /> : null}
        </div>
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: "var(--text-2)",
            letterSpacing: "0.02em",
            textTransform: "capitalize"
          }}
        >
          {label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-1)" }}>
        <span
          style={{
            fontSize: "var(--text-xl)",
            fontWeight: 700,
            color: "var(--text-1)",
            lineHeight: 1.1
          }}
        >
          {value !== undefined && value !== null ? value : "—"}
        </span>
        {unit && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              color: "var(--text-3)"
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricTile;
