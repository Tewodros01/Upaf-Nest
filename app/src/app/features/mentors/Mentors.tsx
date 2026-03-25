import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FaGraduationCap, FaStar } from "react-icons/fa";
import { FiSearch, FiCalendar, FiMessageCircle } from "react-icons/fi";
import { BottomNav } from "../../components/ui/Layout";
import { mentorsApi, type MentorProfile } from "../../../api/mentors.api";
import { getPublicAssetUrl, getAvatarInitials } from "../../../lib/assets";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const EXPERTISE_ACCENT: Record<string, string> = {
  frontend: "#6366f1", backend: "#10b981", design: "#ec4899",
  data: "#8b5cf6", mobile: "#f59e0b", devops: "#06b6d4",
};

function accentFor(expertise: string) {
  const key = expertise.toLowerCase().split(/[\s,]/)[0];
  return EXPERTISE_ACCENT[key] ?? "#6366f1";
}

function MentorCard({ m }: { m: MentorProfile }) {
  const accent = accentFor(m.expertise);
  const avatarUrl = getPublicAssetUrl(m.user.avatar);
  return (
    <button type="button"
      className="flex items-center gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={m.user.firstName}
          className="w-12 h-12 rounded-2xl object-cover shrink-0"
          style={{ border: `2px solid ${accent}40` }} />
      ) : (
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-base"
          style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
          {getAvatarInitials(m.user.firstName, m.user.lastName, "?")}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
          {m.user.firstName} {m.user.lastName}
        </p>
        <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>
          {m.expertise}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-500">
            <FaStar className="text-[8px]" />{m.rating.toFixed(1)}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
            {m._count.sessions} sessions
          </span>
          {m.hourlyRate > 0 && (
            <span className="text-[10px] font-bold" style={{ color: accent }}>
              {m.hourlyRate} coins/hr
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-white"
        style={{ background: accent }}>
        Book
      </span>
    </button>
  );
}

export default function Mentors() {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["mentors", search],
    queryFn: () => mentorsApi.getAll(search ? { search } : undefined).then(r => r.data),
  });

  const mentors = data?.mentors ?? [];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Mentors</h1>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>1-on-1 expert guidance</p>
        </div>
        <button type="button" onClick={() => setShowSearch(s => !s)}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <FiSearch className="text-sm" style={{ color: "var(--text-2)" }} />
        </button>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 px-4 pt-4">

        {/* Search */}
        {showSearch && (
          <motion.div variants={fadeUp}>
            <input
              type="text"
              placeholder="Search by expertise, name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </motion.div>
        )}

        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#4c1d95,#6d28d9,#7c3aed)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.3)" }} />
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-violet-200 rounded-full px-2.5 py-0.5 inline-block mb-2"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              🎓 {data?.pagination.total ?? "100"}+ Expert Mentors
            </span>
            <h2 className="text-lg font-black text-white mb-1">Find Your Mentor</h2>
            <p className="text-violet-200 text-xs">Get personalised 1-on-1 guidance from industry leaders</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Mentors",  value: data?.pagination.total ? `${data.pagination.total}+` : "—", accent: "#8b5cf6", Icon: FaGraduationCap },
            { label: "Sessions", value: "2K+",  accent: "#6366f1", Icon: FiCalendar      },
            { label: "Rating",   value: "4.9",  accent: "#f59e0b", Icon: FaStar          },
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

        {/* Mentor List */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>Top Mentors</h3>
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{mentors.length} available</span>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
            ))
          ) : mentors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FiMessageCircle className="text-3xl" style={{ color: "var(--text-3)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No mentors found</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Try a different search</p>
            </div>
          ) : (
            mentors.map(m => <MentorCard key={m.id} m={m} />)
          )}
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
