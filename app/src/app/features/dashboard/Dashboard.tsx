import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  FaBook, FaBriefcase, FaCode, FaGraduationCap, FaTrophy,
  FaFire, FaCoins, FaChartLine,
} from "react-icons/fa";
import {
  FiBell, FiChevronRight, FiShield, FiAward,
  FiTrendingUp, FiZap, FiCreditCard,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useMe, useUnreadCount } from "./hooks";
import { useMyStats } from "../../../hooks/useUser";
import { APP_ROUTES } from "../../../config/routes";
import { getAvatarInitials, getPublicAssetUrl } from "../../../lib/assets";
import { haptic } from "../../../lib/haptic";
import { useAuthStore } from "../../../store/auth.store";
import { useWalletStore } from "../../../store/wallet.store";
import { BottomNav } from "../../components/ui/Layout";

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const PILLARS = [
  { id: "learn",     title: "Learn",     sub: "Courses & certifications", Icon: FaBook,          accent: "#6366f1", bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.2)",  path: APP_ROUTES.learn,     stat: "120+ Courses"  },
  { id: "build",     title: "Build",     sub: "Projects & portfolio",     Icon: FaCode,          accent: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  path: APP_ROUTES.build,     stat: "50+ Projects"  },
  { id: "challenge", title: "Challenge", sub: "Hackathons & contests",    Icon: FaTrophy,        accent: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  path: APP_ROUTES.challenge, stat: "25+ Live Now"  },
  { id: "mentors",   title: "Mentors",   sub: "1-on-1 expert guidance",   Icon: FaGraduationCap, accent: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.2)",  path: APP_ROUTES.mentors,   stat: "100+ Mentors"  },
  { id: "jobs",      title: "Jobs",      sub: "Internships & full-time",  Icon: FaBriefcase,     accent: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)",   path: APP_ROUTES.jobs,      stat: "200+ Openings" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { balance, syncFromUser } = useWalletStore();
  const currentUser = useAuthStore((s) => s.user);
  const { data: me, isLoading: meLoading } = useMe();
  const { data: unreadCount } = useUnreadCount();
  const { data: stats } = useMyStats();

  useEffect(() => {
    if (me?.coinsBalance !== undefined) syncFromUser(me.coinsBalance);
  }, [me?.coinsBalance, syncFromUser]);

  const nav = (path: string) => { haptic.light(); navigate(path); };
  const meAvatar = getPublicAssetUrl(me?.avatar);
  const firstName = me?.firstName ?? currentUser?.firstName ?? "there";

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => nav(APP_ROUTES.profile)} className="relative">
              {meLoading ? (
                <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "var(--bg-card)" }} />
              ) : meAvatar ? (
                <img src={meAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid var(--brand)" }} />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ background: "var(--brand-dim)", border: "2px solid var(--brand)", color: "var(--brand)" }}>
                  {getAvatarInitials(me?.firstName, me?.lastName, "?")}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2" style={{ borderColor: "var(--bg)" }} />
            </button>
            <div>
              <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Good day 👋</p>
              <p className="text-sm font-black leading-tight" style={{ color: "var(--text)" }}>
                {meLoading
                  ? <span className="inline-block w-24 h-4 rounded animate-pulse" style={{ background: "var(--bg-card)" }} />
                  : `Hi, ${firstName}!`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser?.role === "ADMIN" && (
              <button type="button" onClick={() => nav(APP_ROUTES.admin.panel)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <FiShield className="text-sm text-yellow-500" />
              </button>
            )}
            <button type="button" onClick={() => nav(APP_ROUTES.wallet)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <FaCoins className="text-xs text-yellow-500" />
              <span className="text-sm font-black text-yellow-500">{balance.toLocaleString()}</span>
            </button>
            <button type="button" onClick={() => nav(APP_ROUTES.notifications)}
              className="w-9 h-9 rounded-xl flex items-center justify-center relative"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FiBell className="text-sm" style={{ color: "var(--text-2)" }} />
              {(unreadCount?.count ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="px-4 pt-4 flex flex-col gap-5">

        {/* ── Hero Banner ── */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#2563eb 100%)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full blur-2xl" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-300"
                style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)" }}>
                <FaFire className="text-[8px]" /> Live Platform
              </span>
            </div>
            <h1 className="text-xl font-black text-white leading-tight mb-1">
              Unlock Your{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#fde68a,#fb923c)" }}>
                Potential
              </span>
            </h1>
            <p className="text-indigo-200 text-xs mb-4">Learn · Build · Compete · Get Hired</p>
            <div className="flex gap-2">
              <button onClick={() => nav(APP_ROUTES.learn)}
                className="bg-white text-indigo-700 font-bold text-xs px-4 py-2 rounded-lg active:scale-95 transition-all shadow-lg">
                Start Learning
              </button>
              <button onClick={() => nav(APP_ROUTES.challenge)}
                className="text-white font-bold text-xs px-4 py-2 rounded-lg active:scale-95 transition-all"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}>
                Challenges
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "Games",  value: stats?.totalGames ?? "—", Icon: FiZap,        accent: "#6366f1" },
            { label: "Wins",   value: stats?.wins        ?? "—", Icon: FiAward,      accent: "#10b981" },
            { label: "Earned", value: stats ? `${(stats.totalEarned / 1000).toFixed(1)}k` : "—", Icon: FiTrendingUp, accent: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-3 flex flex-col items-center gap-1"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}30` }}>
                <s.Icon className="text-sm" style={{ color: s.accent }} />
              </div>
              <p className="text-base font-black leading-none" style={{ color: "var(--text)" }}>{String(s.value)}</p>
              <p className="text-[10px] font-medium" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Wallet Card ── */}
        <motion.button variants={fadeUp} type="button" onClick={() => nav(APP_ROUTES.wallet)}
          className="w-full flex items-center gap-4 rounded-2xl p-4 text-left active:scale-[0.98] transition-all"
          style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500">
            <FiCreditCard className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>My Wallet</p>
            <p className="text-lg font-black" style={{ color: "var(--text)" }}>
              {balance.toLocaleString()} <span className="text-xs font-semibold text-emerald-500">coins</span>
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg px-2.5 py-1"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <FaChartLine className="text-[10px] text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500">Active</span>
          </div>
        </motion.button>

        {/* ── Pillars ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black" style={{ color: "var(--text)" }}>Explore Opportunities</h2>
            <button className="text-xs font-semibold" style={{ color: "var(--brand)" }}>See all</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {PILLARS.map((p) => (
              <motion.button key={p.id} variants={fadeUp} type="button" onClick={() => nav(p.path)}
                className="group flex items-center gap-4 rounded-2xl p-3.5 text-left w-full active:scale-[0.98] transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  <p.Icon className="text-lg" style={{ color: p.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>{p.title}</h3>
                    <span className="text-[9px] font-bold rounded-full px-2 py-0.5"
                      style={{ background: p.bg, color: p.accent, border: `1px solid ${p.border}` }}>{p.stat}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{p.sub}</p>
                </div>
                <FiChevronRight className="shrink-0" style={{ color: "var(--text-3)" }} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <h2 className="text-sm font-black" style={{ color: "var(--text)" }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Leaderboard", sub: "See top players",   Icon: FaTrophy,   accent: "#f59e0b", path: APP_ROUTES.leaderboard },
              { label: "Missions",    sub: "Daily tasks",       Icon: FaFire,     accent: "#f43f5e", path: APP_ROUTES.missions    },
              { label: "Tournament",  sub: "Compete & win",     Icon: FiAward,    accent: "#8b5cf6", path: APP_ROUTES.tournament  },
              { label: "Wallet",      sub: "Deposit & withdraw",Icon: FiCreditCard,accent: "#10b981", path: APP_ROUTES.wallet     },
            ].map((q) => (
              <button key={q.label} type="button" onClick={() => nav(q.path)}
                className="flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-95 transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${q.accent}15`, border: `1px solid ${q.accent}25` }}>
                  <q.Icon className="text-sm" style={{ color: q.accent }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black truncate" style={{ color: "var(--text)" }}>{q.label}</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-3)" }}>{q.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
