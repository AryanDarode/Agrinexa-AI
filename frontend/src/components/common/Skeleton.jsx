import React from "react";

/**
 * Agrinexa AI — Shimmer Skeleton Loader
 * Variants: line | text | circle | tile | card | action
 */
export function Skeleton({
  variant = "line",
  width = "100%",
  height,
  borderRadius,
  className = "",
  style = {}
}) {
  const defaultHeights = {
    line: "16px",
    text: "14px",
    circle: "40px",
    tile: "84px",
    card: "140px",
    action: "88px"
  };

  const currentHeight = height || defaultHeights[variant] || "16px";
  const currentRadius = borderRadius || (variant === "circle" ? "50%" : variant === "tile" || variant === "card" ? "var(--radius-lg)" : "var(--radius-sm)");

  if (variant === "tile") {
    return (
      <div
        className={`ag-skeleton ${className}`}
        style={{
          width,
          height: currentHeight,
          borderRadius: currentRadius,
          ...style
        }}
      />
    );
  }

  if (variant === "action") {
    return (
      <div
        className="ag-card"
        style={{
          padding: "var(--space-4)",
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "flex-start",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-1)",
          ...style
        }}
      >
        <div className="ag-skeleton" style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          <div className="ag-skeleton" style={{ width: "30%", height: "12px" }} />
          <div className="ag-skeleton" style={{ width: "70%", height: "18px" }} />
          <div className="ag-skeleton" style={{ width: "90%", height: "14px" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`ag-skeleton ${className}`}
      style={{
        width: variant === "circle" ? currentHeight : width,
        height: currentHeight,
        borderRadius: currentRadius,
        ...style
      }}
    />
  );
}

export default Skeleton;
