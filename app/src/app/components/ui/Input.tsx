import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-3)" }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-sm pointer-events-none" style={{ color: "var(--text-3)" }}>
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-label={props["aria-label"] ?? label}
            aria-invalid={!!error}
            className={`w-full rounded-2xl py-3.5 text-sm outline-none transition-all ${leftIcon ? "pl-10" : "pl-4"} ${rightIcon ? "pr-10" : "pr-4"} ${className}`}
            style={{
              background: "var(--bg-input)",
              border: `1px solid ${error ? "#f43f5e55" : "var(--border-md)"}`,
              color: "var(--text)",
              ...style,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? "#f43f5e" : "#10b981";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? "#f43f5e55" : "var(--border-md)";
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-sm" style={{ color: "var(--text-3)" }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--text-3)" }}>{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
