import React from "react";
import Icon from "./Icons";

/**
 * Agrinexa AI — Status Pill
 * Contextual badge paired with an icon and label.
 * Tones: good (green) | watch (amber) | act (blue) | risk (red) | neutral (gray)
 */
export function StatusPill({
  tone = "good",
  label,
  iconName,
  size = "md",
  className = "",
  style = {}
}) {
  const toneMap = {
    good: {
      bg: "var(--good-bg)",
      color: "var(--good)",
      border: "var(--good-border)",
      defaultIcon: "checkCircle"
    },
    watch: {
      bg: "var(--warn-bg)",
      color: "var(--warn)",
      border: "var(--warn-border)",
      defaultIcon: "alertTriangle"
    },
    act: {
      bg: "var(--water-bg)",
      color: "var(--water)",
      border: "var(--water-border)",
      defaultIcon: "droplet"
    },
    risk: {
      bg: "var(--danger-bg)",
      color: "var(--danger)",
      border: "var(--danger-border)",
      defaultIcon: "alertTriangle"
    },
    neutral: {
      bg: "var(--surface-sunk)",
      color: "var(--text-2)",
      border: "var(--border)",
      defaultIcon: null
    }
  };

  const current = toneMap[tone] || toneMap.good;
  const icon = iconName || current.defaultIcon;

  const sizeStyles = {
    sm: {
      padding: "2px 8px",
      fontSize: "var(--text-xs)",
      iconSize: 12,
      gap: "4px"
    },
    md: {
      padding: "4px 10px",
      fontSize: "var(--text-sm)",
      iconSize: 14,
      gap: "6px"
    }
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`ag-status-pill ag-status-pill-${tone} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: currentSize.gap,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        fontWeight: 600,
        borderRadius: "var(--radius-full)",
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...style
      }}
    >
      {icon && <Icon name={icon} size={currentSize.iconSize} color={current.color} />}
      <span>{label}</span>
    </span>
  );
}

export default StatusPill;
