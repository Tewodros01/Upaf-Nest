import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "gold" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export default function Button({
  loading, children, disabled, variant = "primary",
  size = "md", icon, className = "", style, ...props
}: ButtonProps) {
  const base = "w-full flex items-center justify-center gap-2 font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const sizeClass = {
    sm: "px-3 py-2 text-xs rounded-xl",
    md: "px-5 py-3 text-sm rounded-2xl",
    lg: "px-5 py-4 text-base rounded-2xl",
  }[size];

  const variantStyle: React.CSSProperties = (() => {
    switch (variant) {
      case "primary":
        return { background: "#10b981", color: "#fff", boxShadow: "0 0 24px rgba(16,185,129,0.35)" };
      case "secondary":
        return { background: "var(--bg-card)", border: "1px solid var(--border-md)", color: "var(--text)" };
      case "danger":
        return { background: "#f43f5e", color: "#fff" };
      case "gold":
        return { background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#0f172a", fontWeight: 900, boxShadow: "0 0 24px rgba(245,158,11,0.35)" };
      case "ghost":
        return { background: "transparent", color: "var(--text-2)", width: "auto" };
      case "outline":
        return { background: "transparent", border: "1px solid var(--border-md)", color: "var(--text)" };
      default:
        return {};
    }
  })();

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizeClass} ${className}`}
      style={{ ...variantStyle, ...style }}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
          Loading...
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
