import React from "react";
import Icon from "./Icons";
import Button from "./Button";

/**
 * Agrinexa AI — Standard Error State with Retry
 */
export function ErrorState({
  title = "Unable to load information",
  message = "Please check your network connection or verify that the Agrinexa backend is running.",
  onRetry,
  retryText = "Retry",
  className = "",
  style = {}
}) {
  return (
    <div
      className={`ag-error-state ${className}`}
      style={{
        padding: "var(--space-6) var(--space-4)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--danger-bg)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--danger-border)",
        ...style
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "#FCE8E8",
          color: "var(--danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-2)"
        }}
      >
        <Icon name="alertTriangle" size={22} color="var(--danger)" />
      </div>

      <h3
        style={{
          fontSize: "var(--text-base)",
          fontWeight: 700,
          color: "var(--danger)",
          margin: "0 0 var(--space-1) 0"
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: "var(--text-sm)",
          color: "var(--text-2)",
          maxWidth: "360px",
          lineHeight: 1.4,
          margin: "0 0 var(--space-4) 0"
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          iconName="refresh"
          onClick={onRetry}
          style={{ borderColor: "var(--danger-border)", color: "var(--danger)" }}
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
