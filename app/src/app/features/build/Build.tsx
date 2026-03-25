import { motion } from "framer-motion";
import { FaCode, FaGithub, FaRocket, FaLayerGroup } from "react-icons/fa";
import { FiChevronRight, FiPlus, FiGitBranch, FiUsers } from "react-icons/fi";
import { BottomNav } from "../../components/ui/Layout";

const fadeUp = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.28 } } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const PROJECTS = [
  { title: "E-Commerce Platform", stack: "React · Node.js · MongoDB", status: "In Progress", accent: "#10b981" },
  { title: "Portfolio Website",   stack: "Next.js · Tailwind CSS",    status: "Completed",   accent: "#6366f1" },
  { title: "Chat Application",    stack: "React · Socket.io",         status: "Planning",    accent: "#f59e0b" },
];

export default function Build() {
  return (
    <div className="min-h-screen pb-32" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 pt-4 pb-3 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Build</h1>
          <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Projects & portfolio</p>
        </div>
        <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <FiPlus className="text-emerald-500" />
        </button>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-5 px-4 pt-4">

        {/* Hero */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg,#064e3b,#065f46,#047857)" }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: "rgba(16,185,129,0.25)" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-emerald-200 rounded-full px-2.5 py-0.5"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                🚀 50+ Projects
              </span>
            </div>
            <h2 className="text-lg font-black text-white mb-1">Showcase Your Work</h2>
            <p className="text-emerald-100 text-xs mb-4">Build real projects, grow your portfolio & get hired</p>
            <button type="button" className="bg-white text-emerald-700 font-bold px-4 py-2 rounded-lg text-xs active:scale-95 transition-all shadow-lg">
              Start a Project
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Projects",     value: "50+",  accent: "#10b981", Icon: FaRocket     },
            { label: "Contributors", value: "200+", accent: "#6366f1", Icon: FiUsers      },
            { label: "Completed",    value: "120+", accent: "#f59e0b", Icon: FaLayerGroup },
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

        {/* My Projects */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>My Projects</h3>
            <button type="button" className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
              View All <FiChevronRight className="text-[10px]" />
            </button>
          </div>
          {PROJECTS.map((p) => (
            <button key={p.title} type="button"
              className="flex items-center gap-3 p-4 rounded-2xl text-left w-full active:scale-[0.98] transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${p.accent}15`, border: `1px solid ${p.accent}25` }}>
                <FaCode className="text-lg" style={{ color: p.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{p.title}</p>
                <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>{p.stack}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                style={{ background: `${p.accent}15`, color: p.accent, border: `1px solid ${p.accent}25` }}>
                {p.status}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Connect */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2.5">
          <h3 className="text-sm font-black" style={{ color: "var(--text)" }}>Connect & Collaborate</h3>
          {[
            { Icon: FaGithub,    label: "Connect GitHub",            sub: "Sync your repos & contributions", accent: "#8b5cf6" },
            { Icon: FiGitBranch, label: "Browse Community Projects", sub: "Collaborate with other builders",  accent: "#10b981" },
          ].map((item) => (
            <button key={item.label} type="button"
              className="flex items-center gap-3 p-4 rounded-2xl w-full text-left active:scale-[0.98] transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}25` }}>
                <item.Icon className="text-lg" style={{ color: item.accent }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.label}</p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>{item.sub}</p>
              </div>
              <FiChevronRight style={{ color: "var(--text-3)" }} />
            </button>
          ))}
        </motion.div>

      </motion.div>
      <BottomNav />
    </div>
  );
}
