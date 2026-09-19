import React from "react";

/**
 * Agrinexa AI — Base Card Container
 * Variants: default | sunk | elevated | interactive | hero
 */
export function Card({
  children,
  variant = "default",
  padding = "16px",
  className = "",
  onClick,
  style = {},
  ...props
}) {
  const variantStyles = {
    default: {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-1)",
      borderRadius: "var(--radius-lg)"
    },
    sunk: {
      backgroundColor: "var(--surface-sunk)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "none",
      borderRadius: "var(--radius-md)"
    },
    elevated: {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-2)",
      borderRadius: "var(--radius-lg)"
    },
    interactive: {
      backgroundColor: "var(--surface)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-1)",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer"
    },
    hero: {
      background: "linear-gradient(180deg, var(--green-900) 0%, #134B38 100%)",
      color: "var(--text-inverse)",
      border: "none",
      boxShadow: "var(--shadow-2)",
      borderRadius: "var(--radius-xl)"
    }
  };

  const isClickable = Boolean(onClick) || variant === "interactive";

  return (
    <div
      className={`ag-card ag-card-${variant} ${className}`}
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
        ...variantStyles[variant],
        padding,
        transition: "var(--transition-default)",
        ...(isClickable ? { userSelect: "none" } : {}),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
