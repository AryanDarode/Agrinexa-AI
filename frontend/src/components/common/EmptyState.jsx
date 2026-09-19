import React from "react";
import Icon from "./Icons";
import Button from "./Button";

/**
 * Agrinexa AI — Standard Empty State
 * Renders when data is genuinely absent (no invented values).
 */
export function EmptyState({
  iconName = "sprout",
  title = "No information available",
  description,
  actionText,
  onAction,
  className = "",
  style = {}
}) {
  return (
    <div
      className={`ag-empty-state ${className}`}
      style={{
        padding: "var(--space-8) var(--space-4)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--surface-sunk)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border)",
        ...style
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--earth-200)",
          color: "var(--green-900)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-3)"
        }}
      >
        <Icon name={iconName} size={24} />
      </div>

      <h3
        style={{
          fontSize: "var(--text-base)",
          fontWeight: 700,
          color: "var(--text-1)",
          margin: "0 0 var(--space-1) 0"
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-2)",
            maxWidth: "380px",
            lineHeight: 1.5,
            margin: "0 0 var(--space-4) 0"
          }}
        >
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
