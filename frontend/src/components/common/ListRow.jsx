import React from "react";
import Icon from "./Icons";

/**
 * Agrinexa AI — Standard Inset List Row
 * Used in profile overview, crop records, and settings.
 */
export function ListRow({
  iconName,
  iconNode,
  label,
  value,
  subtitle,
  onClick,
  showChevron = true,
  className = "",
  style = {}
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={`ag-list-row ${className}`}
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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        minHeight: "52px",
        cursor: isClickable ? "pointer" : "default",
        transition: "var(--transition-default)",
        ...style
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: 1, minWidth: 0 }}>
        {(iconNode || iconName) && (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--green-100)",
              color: "var(--green-900)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {iconNode || <Icon name={iconName} size={18} color="var(--green-900)" />}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "var(--text-base)",
              fontWeight: 600,
              color: "var(--text-1)",
              lineHeight: 1.3
            }}
          >
            {label}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--text-2)",
                marginTop: "2px"
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
        {value && (
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--text-2)"
            }}
          >
            {value}
          </span>
        )}
        {isClickable && showChevron && (
          <div style={{ color: "var(--text-3)" }}>
            <Icon name="chevronRight" size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListRow;
