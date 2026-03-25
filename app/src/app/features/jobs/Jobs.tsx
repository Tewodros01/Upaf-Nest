import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FaBriefcase, FaBuilding, FaGlobe } from "react-icons/fa";
import { FiSearch, FiMapPin, FiClock, FiBookmark } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/ui/Layout";
import { jobsApi, type Job } from "../../../api/jobs.api";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const MODE_ACCENT: Record<string, string> = {
  REMOTE: "#10b981", ONSITE: "#6366f1", HYBRID: "#f59e0b",
};
const TYPE_LABEL: Record<string, string> = {
  INTERNSHIP: "Internship", FULL_TIME: "Full-time",
  PART_TIME: "Part-time", CONTRACT: "Contract", FREELANCE: "Freelance",
};

function JobCard({ j }: { j: Job }) {
  const accent = MODE_ACCENT[j.workMode] ?? "#6366f1";
  return (
    <button type="button"
      className="flex items-center gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
        <FaBriefcase className="text-lg" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{j.title}</p>
        <p className="text-[11px] font-semibold" style={{ color: "var(--text-2)" }}>
          {j.company?.name ?? "Company"}
          {j.company?.isVerified && " ✓"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-3)" }}>
            <FiMapPin className="text-[8px]" />{j.location ?? j.workMode}
          </span>
          <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "var(--text-3)" }}>
            <FiClock className="text-[8px]" />{TYPE_LABEL[j.type] ?? j.type}
          </span>
          {j.salaryMin && (
            <span className="text-[10px] font-bold" style={{ color: accent }}>
              ${(j.salaryMin / 1000).toFixed(0)}k+
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
        style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
        <FiBookmark className="text-sm" style={{ color: "var(--text-3)" }} />
      </div>
    </button>
  );
}

export default function Jobs() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", filter, search],
    queryFn: () => jobsApi.getAll({
      ...(filter !== "all" ? { type: filter } : {}),
      ...(search ? { search } : {}),
    }).then(r => r.data),
  });

  const jobs = data?.jobs ?? [];
  const filters = [
    { key: "all",       label: "All"        },
    { key: "FULL_TIME", label: "Full-time"  },
    { key: "INTERNSHIP",label: "Internship" },
    { key: "REMOTE",    label: "Remote"     },
    { key: "CONTRACT",  label: "Contract"   },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Jobs</h1>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Internships & full-time roles</p>
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
              placeholder="Search jobs, companies…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </motion.div>
        )}

        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#881337,#be123c,#e11d48)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(244,63,94,0.3)" }} />
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-rose-200 rounded-full px-2.5 py-0.5 inline-block mb-2"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
              💼 {data?.pagination.total ?? "200"}+ Openings
            </span>
            <h2 className="text-lg font-black text-white mb-1">Land Your Dream Job</h2>
            <p className="text-rose-100 text-xs">Top African & global companies are hiring now</p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Openings",  value: data?.pagination.total ? `${data.pagination.total}+` : "—", accent: "#f43f5e", Icon: FaBriefcase },
            { label: "Companies", value: "80+",  accent: "#6366f1", Icon: FaBuilding  },
            { label: "Remote",    value: "60%",  accent: "#10b981", Icon: FaGlobe     },
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
                ? { background: "#f43f5e", color: "#fff" }
                : { background: "var(--bg-card)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Job List */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>Latest Openings</h3>
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>{jobs.length} results</span>
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
            ))
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <FaBriefcase className="text-3xl" style={{ color: "var(--text-3)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No jobs found</p>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Try a different filter</p>
            </div>
          ) : (
            jobs.map(j => <JobCard key={j.id} j={j} />)
          )}
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
