import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface BottomSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function BottomSheet({ open, title, subtitle, onClose, children, footer }: BottomSheetProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[82vh] flex-col overflow-hidden rounded-t-[28px] p-5"
        style={{
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full" style={{ background: "var(--border-md)" }} />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black" style={{ color: "var(--text)" }}>{title}</p>
            {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <FiX className="text-sm" style={{ color: "var(--text)" }} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        {footer}
      </div>
    </div>
  );
}
