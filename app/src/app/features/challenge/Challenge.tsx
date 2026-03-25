import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FaTrophy, FaMedal, FaFire } from "react-icons/fa";
import { FiChevronRight, FiClock, FiUsers, FiAward, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../config/routes";
import { haptic } from "../../../lib/haptic";
import { BottomNav } from "../../components/ui/Layout";
import { competitionsApi, type Competition } from "../../../api/competitions.api";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const TYPE_ACCENT: Record<string, string> = {
  CODING: "#6366f1", DESIGN: "#ec4899", HACKATHON: "#f59e0b",
  QUIZ: "#10b981", ALGORITHM: "#8b5cf6", DATA_SCIENCE: "#06b6d4",
};
const STATUS_LABEL: Record<string, string> = {
  UPCOMING: "Soon", REGISTRATION_OPEN: "Open", ONGOING: "Live",
  JUDGING: "Judging", COMPLETED: "Ended", CANCELLED: "Cancelled",
};

function ContestCard({ c, onClick }: { c: Competition; onClick: () => void }) {
  const accent = TYPE_ACCENT[c.type] ?? "#6366f1";
  const status = STATUS_LABEL[c.status] ?? c.status;
  const isLive = c.status === "ONGOING" || c.status === "REGISTRATION_OPEN";
  return (
    <button type="button" onClick={onClick}
      className="flex flex-col gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
          <FaTrophy className="text-lg" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{c.title}</p>
          <p className="text-xs font-black" style={{ color: accent }}>🏆 {c.prize.toLocaleString()} coins</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px]" style={{ color: "var(--text-3)" }}>
        <span className="flex items-center gap-1">
          <FiClock className="text-[10px]" />
          {new Date(c.endDate).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <FiUsers className="text-[10px]" />{c._count.entries} joined
        </span>
        {c.entryFee > 0 && (
          <span className="flex items-center gap-1">
            <FiZap className="text-[10px]" />{c.entryFee} fee
          </span>
        )}
        {isLive && (
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
          </span>
        )}
      </div>
    </button>
  );
}

export default function Challenge() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["competitions", filter],
    queryFn: () => competitionsApi.getAll(filter !== "all" ? { status: filter } : undefined).then(r => r.data),
  });

  const competitions = data?.competitions ?? [];
  const filters = [
    { key: "all", label: "All" },
    { key: "REGISTRATION_OPEN", label: "Open" },
    { key: "ONGOING", label: "Live" },
    { key: "UPCOMING", label: "Soon" },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Challenge</h1>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Hackathons & contests</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <FaFire className="text-xs text-orange-500" />
          <span className="text-xs font-black text-yellow-500">
            {data?.pagination.total ?? "—"} Live
          </span>
        </div>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 px-4 pt-4">

        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#92400e,#b45309,#d97706)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(245,158,11,0.3)" }} />
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-amber-200 rounded-full px-2.5 py-0.5 inline-block mb-2"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
              🏆 Win Real Prizes
            </span>
            <h2 className="text-lg font-black text-white mb-1">Compete & Earn</h2>
            <p className="text-amber-100 text-xs">Join hackathons, win coins & build your reputation</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Contests",   value: data?.pagination.total ? `${data.pagination.total}+` : "—", accent: "#f59e0b", Icon: FaTrophy },
            { label: "Prize Pool", value: "10K+", accent: "#6366f1", Icon: FiAward  },
            { label: "Winners",    value: "500+", accent: "#10b981", Icon: FaMedal  },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}25` }}>
                <s.Icon className="text-sm" style={{ color: s.accent }} />
              </div>
              <p className="text-base font-black" style={{ color: "var(--text)" }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map(f => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)}
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              style={filter === f.key
                ? { background: "#f59e0b", color: "#fff" }
                : { background: "var(--bg-card)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Contest List */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>
              {filter === "all" ? "All Contests" : filters.find(f => f.key === filter)?.label}
            </h3>
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
              {competitions.length} results
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
            ))
          ) : competitions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FaTrophy className="text-3xl" style={{ color: "var(--text-3)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No contests found</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Check back soon</p>
            </div>
          ) : (
            competitions.map(c => (
              <ContestCard key={c.id} c={c}
                onClick={() => { haptic.light(); navigate(`${APP_ROUTES.competitions}/${c.id}`); }} />
            ))
          )}
        </motion.div>

        {/* Tournaments CTA */}
        <motion.div variants={fadeUp}>
          <button type="button" onClick={() => { haptic.light(); navigate(APP_ROUTES.tournament); }}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-indigo-500">
              <FaTrophy className="text-white text-lg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black" style={{ color: "var(--text)" }}>Tournaments</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Compete in structured tournaments & win big</p>
            </div>
            <FiChevronRight style={{ color: "var(--text-3)" }} />
          </button>
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
