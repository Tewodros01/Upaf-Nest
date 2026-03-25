import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { useToastStore, type ToastType } from "../../../store/toast.store";

const META: Record<ToastType, { icon: React.ReactNode; barColor: string; iconColor: string }> = {
  success: { icon: <FiCheckCircle />, barColor: "#10b981", iconColor: "#10b981" },
  error:   { icon: <FiAlertCircle />, barColor: "#f43f5e", iconColor: "#f43f5e" },
  warning: { icon: <FiAlertTriangle />, barColor: "#f59e0b", iconColor: "#f59e0b" },
  info:    { icon: <FiInfo />, barColor: "#3b82f6", iconColor: "#3b82f6" },
};

export default function Toaster() {
  const { toasts, dismiss } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => {
        const m = META[t.type];
        return (
          <div key={t.id}
            className="w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-top-2 duration-200"
            style={{ background: "var(--bg)", border: `1px solid ${m.barColor}33`, boxShadow: "var(--shadow-md)" }}>
            <div className="w-1 h-8 rounded-full shrink-0" style={{ background: m.barColor }} />
            <span className="text-base shrink-0" style={{ color: m.iconColor }}>{m.icon}</span>
            <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
              {t.message}
            </p>
            <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}
              className="shrink-0 transition-opacity hover:opacity-100 opacity-50"
              style={{ color: "var(--text-2)" }}>
              <FiX className="text-sm" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
