import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";

/* ─── OpportunityCard ───────────────────────────────────────────────── */
interface OpportunityCardProps {
  title: string;
  category: string;
  image?: string;
  resources: string;
  dueDate: string;
  onClick?: () => void;
  className?: string;
}
export const OpportunityCard = ({ title, category, image, resources, dueDate, onClick, className = "" }: OpportunityCardProps) => (
  <motion.div whileTap={{ scale: 0.98 }} onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-200 ${className}`}
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
    {image && (
      <div className="aspect-video overflow-hidden rounded-t-2xl">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-1 rounded-full text-emerald-600"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          {category}
        </span>
        <span className="text-xs" style={{ color: "var(--text-3)" }}>{dueDate} left</span>
      </div>
      <h3 className="text-sm font-bold mb-2 line-clamp-2" style={{ color: "var(--text)" }}>{title}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--text-2)" }}>{resources} participants</span>
        <FiChevronRight style={{ color: "var(--text-3)" }} />
      </div>
    </div>
  </motion.div>
);

/* ─── PillarCard ────────────────────────────────────────────────────── */
interface PillarCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  stats: string;
  accentColor: string;   // e.g. "#3b82f6"
  onClick?: () => void;
  className?: string;
}
export const PillarCard = ({ title, subtitle, icon, stats, accentColor, onClick, className = "" }: PillarCardProps) => (
  <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl p-4 text-left w-full transition-all duration-200 ${className}`}
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
        style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold mb-0.5" style={{ color: "var(--text)" }}>{title}</h3>
        <p className="text-sm mb-0.5" style={{ color: "var(--text-2)" }}>{subtitle}</p>
        <p className="text-xs font-medium" style={{ color: "var(--text-3)" }}>{stats}</p>
      </div>
      <FiChevronRight style={{ color: "var(--text-3)" }} />
    </div>
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      style={{ background: `linear-gradient(135deg, ${accentColor}08, transparent)` }} />
  </motion.button>
);

/* ─── StatCard ──────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accentColor: string;
  className?: string;
}
export const StatCard = ({ label, value, icon, accentColor, className = "" }: StatCardProps) => (
  <div className={`rounded-2xl p-4 text-center ${className}`}
    style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
    <div className="text-2xl mb-2" style={{ color: accentColor }}>{icon}</div>
    <p className="text-xl font-black mb-1" style={{ color: "var(--text)" }}>{value}</p>
    <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{label}</p>
  </div>
);

/* ─── ActionCard ────────────────────────────────────────────────────── */
interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}
export const ActionCard = ({ title, subtitle, icon, accentColor = "#10b981", onClick, className = "" }: ActionCardProps) => (
  <motion.button whileTap={{ scale: 0.98 }} onClick={onClick}
    className={`group rounded-2xl p-4 text-left w-full transition-all duration-200 ${className}`}
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>{title}</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{subtitle}</p>
      </div>
      <FiChevronRight style={{ color: "var(--text-3)" }} />
    </div>
  </motion.button>
);

/* ─── SectionHeader ─────────────────────────────────────────────────── */
interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}
export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className="flex items-center justify-between">
    <h2 className="text-base font-black" style={{ color: "var(--text)" }}>{title}</h2>
    {action && (
      <button type="button" onClick={action.onClick}
        className="flex items-center gap-1 text-xs font-semibold text-emerald-500 active:opacity-70 transition-opacity">
        {action.label} <FiChevronRight className="text-[10px]" />
      </button>
    )}
  </div>
);

/* ─── ListRow ───────────────────────────────────────────────────────── */
interface ListRowProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
}
export const ListRow = ({ icon, iconBg, title, subtitle, right, onClick, divider = false }: ListRowProps) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${onClick ? "active:opacity-70" : ""}`}
      style={divider ? { borderBottom: "1px solid var(--border)" } : {}}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
        style={{ background: iconBg ?? "var(--bg-card)", border: "1px solid var(--border)" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{title}</p>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </Tag>
  );
};
