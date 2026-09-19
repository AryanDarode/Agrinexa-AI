import React from "react";
import Icon from "./Icons";

/**
 * Agrinexa AI — Accessible Button Component
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes: sm | md | lg (guarantees ≥48px touch target for interactive buttons)
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconName,
  iconRightName,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  style = {},
  ...props
}) {
  const variantStyles = {
    primary: {
      backgroundColor: "var(--green-700)",
      color: "var(--text-inverse)",
      border: "1px solid transparent",
      boxShadow: "0 1px 2px rgba(16, 25, 15, 0.12)"
    },
    secondary: {
      backgroundColor: "var(--green-100)",
      color: "var(--green-900)",
      border: "1px solid var(--green-200)"
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--text-1)",
      border: "1px solid var(--border)"
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--text-2)",
      border: "1px solid transparent"
    },
    danger: {
      backgroundColor: "var(--danger-bg)",
      color: "var(--danger)",
      border: "1px solid var(--danger-border)"
    }
  };

  const sizeStyles = {
    sm: {
      minHeight: "36px",
      padding: "6px 14px",
      fontSize: "var(--text-sm)",
      gap: "6px",
      borderRadius: "var(--radius-md)"
    },
    md: {
      minHeight: "48px",
      padding: "12px 20px",
      fontSize: "var(--text-base)",
      gap: "8px",
      borderRadius: "var(--radius-md)"
    },
    lg: {
      minHeight: "54px",
      padding: "14px 24px",
      fontSize: "var(--text-md)",
      gap: "10px",
      borderRadius: "var(--radius-lg)"
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      className={`ag-btn ag-btn-${variant} ag-btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...currentVariant,
        ...currentSize,
        width: fullWidth ? "100%" : "auto",
        fontWeight: 600,
        letterSpacing: "0.01em",
        ...style
      }}
      {...props}
    >
      {loading ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid currentColor",
              borderRightColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "ag-spin 0.75s linear infinite"
            }}
          />
          <span>{children}</span>
        </span>
      ) : (
        <>
          {iconName && <Icon name={iconName} size={size === "sm" ? 16 : 18} />}
          <span>{children}</span>
          {iconRightName && <Icon name={iconRightName} size={size === "sm" ? 16 : 18} />}
        </>
      )}
    </button>
  );
}

export default Button;
