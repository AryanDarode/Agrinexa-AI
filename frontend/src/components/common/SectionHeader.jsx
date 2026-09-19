import React from "react";

/**
 * Agrinexa AI — Section Header
 * Standard header with title, subtitle, optional badge, and optional action link
 */
export function SectionHeader({
  title,
  subtitle,
  badge,
  actionText,
  onAction,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`ag-section-header ${className}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        marginBottom: "var(--space-3)",
        ...style
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <h2
            style={{
              fontSize: "var(--text-md)",
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.01em",
              margin: 0
            }}
          >
            {title}
          </h2>
          {badge && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--green-100)",
                color: "var(--green-700)"
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-2)",
              marginTop: "var(--space-1)",
              margin: 0
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actionText && (
        <button
          type="button"
          onClick={onAction}
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--green-700)",
            padding: "var(--space-1) var(--space-2)",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "nowrap",
            minHeight: "36px"
          }}
        >
          {actionText} →
        </button>
      )}
    </div>
  );
}

export default SectionHeader;
