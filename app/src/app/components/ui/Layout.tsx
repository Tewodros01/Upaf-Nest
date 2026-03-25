import type { ReactNode } from "react";
import { FaBook, FaBriefcase, FaCode, FaGraduationCap, FaTrophy, FaUser } from "react-icons/fa";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../config/routes";
import { haptic } from "../../../lib/haptic";
import { getAvatarInitials, getPublicAssetUrl } from "../../../lib/assets";

/* ─── Avatar ────────────────────────────────────────────────────────── */
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}
export const Avatar = ({ src, name, size = "md" }: AvatarProps) => {
  const avatarSrc = getPublicAssetUrl(src);
  const dim = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm";
  const initials = getAvatarInitials(name.split(" ")[0], name.split(" ").slice(1).join(" "), "?");
  return avatarSrc ? (
    <img src={avatarSrc} alt={name} className={`${dim} rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0`} />
  ) : (
    <div className={`${dim} rounded-full ring-2 ring-emerald-500/40 shrink-0 flex items-center justify-center font-black`}
      style={{ background: "var(--bg-card)", color: "var(--text)" }}>
      {initials}
    </div>
  );
};

/* ─── Pill ──────────────────────────────────────────────────────────── */
interface PillProps { icon?: ReactNode; children: ReactNode; className?: string; }
export const Pill = ({ icon, children, className = "" }: PillProps) => (
  <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 ${className}`}
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}>
    {icon && <span className="text-xs">{icon}</span>}
    {children}
  </div>
);

/* ─── Divider ───────────────────────────────────────────────────────── */
export const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    <span className="text-xs shrink-0" style={{ color: "var(--text-3)" }}>{label}</span>
    <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
  </div>
);

/* ─── SocialBtn ─────────────────────────────────────────────────────── */
export const SocialBtn = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <button type="button" aria-label={label}
    className="flex-1 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
    <span className="text-lg">{icon}</span>
  </button>
);

/* ─── PageHeader ────────────────────────────────────────────────────── */
/* Replaces AppBar — supports both new (title/onBack/right) and         */
/* legacy (left/center/right) prop shapes for backward compatibility.   */
interface PageHeaderProps {
  /* new API */
  title?: string;
  onBack?: () => void;
  /* legacy AppBar API */
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
}
export const PageHeader = ({ title, onBack, left, center, right, className = "" }: PageHeaderProps) => {
  const navigate = useNavigate();

  /* ── New API: title + optional back + optional right ── */
  if (title !== undefined) {
    const handleBack = onBack ?? (() => navigate(-1));
    return (
      <div className={`sticky top-0 z-40 flex items-center gap-3 px-4 py-3 backdrop-blur-xl ${className}`}
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <button type="button" onClick={handleBack} aria-label="Go back"
          className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <FiArrowLeft className="text-sm" style={{ color: "var(--text)" }} />
        </button>
        <span className="flex-1 text-base font-black truncate" style={{ color: "var(--text)" }}>{title}</span>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    );
  }

  /* ── Legacy AppBar API: left / center / right ── */
  return (
    <div className={`sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-xl ${className}`}
      style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
      <div>{left}</div>
      {center && <div className="absolute left-1/2 -translate-x-1/2">{center}</div>}
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
};

/* ─── BottomNav ─────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { path: APP_ROUTES.dashboard, label: "Home",      Icon: FiHome         },
  { path: APP_ROUTES.learn,     label: "Learn",     Icon: FaBook         },
  { path: APP_ROUTES.challenge, label: "Challenge", Icon: FaTrophy       },
  { path: APP_ROUTES.jobs,      label: "Jobs",      Icon: FaBriefcase    },
  { path: APP_ROUTES.profile,   label: "Profile",   Icon: FaUser         },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2 pointer-events-none">
      <div className="pointer-events-auto flex items-center rounded-3xl px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        style={{ background: "var(--nav-bg)", border: "1px solid var(--nav-border)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button key={path} type="button"
              onClick={() => { haptic.light(); navigate(path); }}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition-all active:scale-90">
              <div className={`w-10 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                active ? "bg-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.5)]" : ""
              }`} style={!active ? { background: "transparent" } : {}}>
                <Icon className={`text-base transition-colors duration-200 ${active ? "text-white" : ""}`}
                  style={!active ? { color: "var(--text-3)" } : {}} />
              </div>
              <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${active ? "text-emerald-400" : ""}`}
                style={!active ? { color: "var(--text-3)" } : {}}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
