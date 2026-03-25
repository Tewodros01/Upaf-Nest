import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FaCoins, FaTrophy, FaStar, FaUserGraduate,
} from "react-icons/fa";
import {
  FiEdit2, FiLogOut, FiSettings, FiUserPlus,
  FiChevronRight, FiMail, FiPhone, FiUser,
  FiAward, FiBookOpen, FiGrid, FiBriefcase,
  FiCalendar, FiMessageCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../config/routes";
import { getAvatarInitials, getPublicAssetUrl } from "../../../lib/assets";
import { useLogout, useMe } from "./hooks";
import { useAuthStore } from "../../../store/auth.store";
import { useWalletStore } from "../../../store/wallet.store";
import { BottomNav, PageHeader } from "../../components/ui/Layout";

import { competitionsApi } from "../../../api/competitions.api";
import { jobsApi } from "../../../api/jobs.api";
import { mentorsApi } from "../../../api/mentors.api";

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const moreItems = [
  { Icon: FiBookOpen,  label: "Game History",  sub: "View past games",         path: APP_ROUTES.history,  danger: false },
  { Icon: FiSettings,  label: "Settings",       sub: "App preferences",         path: APP_ROUTES.settings, danger: false },
  { Icon: FiLogOut,    label: "Sign Out",        sub: "Log out of your account", path: null,                danger: true  },
];

const TABS = [
  { key: "overview",  label: "Overview"  },
  { key: "contests",  label: "Contests"  },
  { key: "jobs",      label: "Jobs"      },
  { key: "sessions",  label: "Sessions"  },
];

const STATUS_COLOR: Record<string, string> = {
  APPLIED: "#6366f1", UNDER_REVIEW: "#f59e0b", SHORTLISTED: "#10b981",
  SELECTED: "#10b981", REJECTED: "#f43f5e", WITHDRAWN: "#6b7280",
  INTERVIEW_SCHEDULED: "#8b5cf6", INTERVIEWED: "#06b6d4",
  REGISTRATION_OPEN: "#10b981", ONGOING: "#f59e0b", COMPLETED: "#6b7280",
  UPCOMING: "#6366f1", JUDGING: "#8b5cf6",
};

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAgent = user?.role === "AGENT";
  const { syncFromUser } = useWalletStore();
  const { data: me } = useMe();
  const { mutate: logout, isPending: isSigningOut } = useLogout();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (me?.coinsBalance !== undefined) syncFromUser(me.coinsBalance);
  }, [me?.coinsBalance, syncFromUser]);

  const { data: myEntries } = useQuery({
    queryKey: ["my-competition-entries"],
    queryFn: () => competitionsApi.getMyEntries().then(r => r.data),
    enabled: tab === "contests",
  });

  const { data: myApplications } = useQuery({
    queryKey: ["my-job-applications"],
    queryFn: () => jobsApi.getMyApplications().then(r => r.data),
    enabled: tab === "jobs",
  });

  const { data: mySessions } = useQuery({
    queryKey: ["my-mentor-sessions"],
    queryFn: () => mentorsApi.getMySessions("mentee").then(r => r.data),
    enabled: tab === "sessions",
  });

  const handleSignOut = () =>
    logout(undefined, { onSettled: () => navigate(APP_ROUTES.signin, { replace: true }) });

  const fields = [
    { Icon: FiUser,  label: "Full Name", value: me ? `${me.firstName} ${me.lastName}` : "—" },
    { Icon: FiMail,  label: "Email",     value: me?.email ?? "—" },
    { Icon: FiPhone, label: "Phone",     value: me?.phone ?? "Not set" },
  ];

  const quickActions = [
    { Icon: FiUserPlus, label: "Invite",      sub: "Refer friends",   accent: "#8b5cf6", path: APP_ROUTES.invite      },
    { Icon: FiAward,    label: "Leaderboard", sub: "Top players",     accent: "#f59e0b", path: APP_ROUTES.leaderboard },
    { Icon: FiGrid,     label: "Missions",    sub: "Daily tasks",     accent: "#f43f5e", path: APP_ROUTES.missions    },
    ...(isAgent ? [{ Icon: FiSettings, label: "Agent Panel", sub: "Manage deposits", accent: "#f97316", path: APP_ROUTES.agentDeposit }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <PageHeader title="Profile"
        right={
          <button type="button" aria-label="Edit profile" onClick={() => navigate(APP_ROUTES.editProfile)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <FiEdit2 className="text-sm" style={{ color: "var(--text)" }} />
          </button>
        }
      />

      <div className="flex flex-col gap-4 px-4 py-4 pb-32">

        {/* ── Hero Card ── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <div className="h-20 relative" style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed,#2563eb)" }}>
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.1)" }} />
          </div>
          <div className="px-4 pb-4" style={{ background: "var(--bg-card)" }}>
            <div className="flex items-end justify-between -mt-8 mb-3">
              <div className="relative">
                {getPublicAssetUrl(me?.avatar) ? (
                  <img src={getPublicAssetUrl(me?.avatar) ?? undefined} alt="avatar"
                    className="w-16 h-16 rounded-2xl object-cover"
                    style={{ border: "3px solid var(--bg-card)" }} />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black"
                    style={{ background: "var(--brand-dim)", border: "3px solid var(--bg-card)", color: "var(--brand)" }}>
                    {getAvatarInitials(me?.firstName, me?.lastName, "?")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500"
                  style={{ border: "2px solid var(--bg-card)" }}>
                  <span className="text-[8px] font-black text-white">✓</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <FaCoins className="text-xs text-yellow-500" />
                <span className="text-sm font-black text-yellow-500">{(me?.coinsBalance ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <h2 className="text-base font-black" style={{ color: "var(--text)" }}>
              {me ? `${me.firstName} ${me.lastName}` : "—"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              @{me?.username ?? "—"} · Member since {me ? new Date(me.createdAt).getFullYear() : "—"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-emerald-500"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
              {user?.role === "ADMIN" && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-yellow-500"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  Admin
                </span>
              )}
              {isAgent && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-500"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  Agent
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
              style={tab === t.key
                ? { background: "var(--brand)", color: "#fff" }
                : { background: "var(--bg-card)", color: "var(--text-3)", border: "1px solid var(--border)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === "overview" && (
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col gap-4">

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map(({ Icon, label, sub, accent, path }) => (
                  <button key={label} type="button" onClick={() => navigate(path)}
                    className="flex items-center gap-3 rounded-2xl p-3.5 text-left active:scale-95 transition-all"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                      <Icon className="text-sm" style={{ color: accent }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black" style={{ color: "var(--text)" }}>{label}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* More */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>More</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                {moreItems.map(({ Icon, label, sub, path, danger }, i) => (
                  <button key={label} type="button" disabled={danger && isSigningOut}
                    onClick={() => danger ? handleSignOut() : path && navigate(path)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all disabled:opacity-60"
                    style={i < moreItems.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: danger ? "rgba(244,63,94,0.1)" : "var(--bg-overlay)", border: `1px solid ${danger ? "rgba(244,63,94,0.2)" : "var(--border)"}` }}>
                      <Icon className="text-sm" style={{ color: danger ? "#f43f5e" : "var(--text-3)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: danger ? "#f43f5e" : "var(--text)" }}>
                        {danger && isSigningOut ? "Signing Out…" : label}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{sub}</p>
                    </div>
                    <FiChevronRight className="shrink-0" style={{ color: "var(--text-3)" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Account Info */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>Account Info</p>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                {fields.map(({ Icon, label, value }, i) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3.5"
                    style={i < fields.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
                      <Icon className="text-sm" style={{ color: "var(--text-3)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{label}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mentor CTA */}
            <div className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                <FaUserGraduate className="text-indigo-500 text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: "var(--text)" }}>Become a Mentor</p>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>Share your expertise & earn</p>
              </div>
              <button type="button" className="text-xs font-bold px-3 py-1.5 rounded-lg text-white bg-indigo-500 active:scale-95 transition-all">
                Apply
              </button>
            </div>

          </motion.div>
        )}

        {/* ── Contests Tab ── */}
        {tab === "contests" && (
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>
              My Contest Entries
            </p>
            {!myEntries ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
              ))
            ) : myEntries.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <FaTrophy className="text-3xl" style={{ color: "var(--text-3)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No contest entries yet</p>
                <button type="button" onClick={() => navigate(APP_ROUTES.competitions)}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: "var(--brand)" }}>
                  Browse Contests
                </button>
              </div>
            ) : (
              myEntries.map(entry => {
                const status = entry.competition?.status ?? "UNKNOWN";
                const accent = STATUS_COLOR[status] ?? "#6366f1";
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                      <FaTrophy className="text-base" style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                        {entry.competition?.title ?? "Contest"}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                        {entry.score != null ? `Score: ${entry.score}` : "Pending score"}
                        {entry.rank != null ? ` · Rank #${entry.rank}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
                      {status}
                    </span>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── Jobs Tab ── */}
        {tab === "jobs" && (
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>
              My Applications
            </p>
            {!myApplications ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
              ))
            ) : myApplications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <FiBriefcase className="text-3xl" style={{ color: "var(--text-3)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No applications yet</p>
                <button type="button" onClick={() => navigate(APP_ROUTES.jobs)}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: "var(--brand)" }}>
                  Browse Jobs
                </button>
              </div>
            ) : (
              myApplications.map(app => {
                const accent = STATUS_COLOR[app.status] ?? "#6366f1";
                return (
                  <div key={app.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                      <FiBriefcase className="text-base" style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                        {app.job?.title ?? "Job"}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                        {app.job?.company?.name ?? "Company"} · {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* ── Sessions Tab ── */}
        {tab === "sessions" && (
          <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>
              My Mentor Sessions
            </p>
            {!mySessions ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl animate-pulse"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }} />
              ))
            ) : mySessions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <FiMessageCircle className="text-3xl" style={{ color: "var(--text-3)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>No sessions yet</p>
                <button type="button" onClick={() => navigate(APP_ROUTES.mentors)}
                  className="text-xs font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: "var(--brand)" }}>
                  Find a Mentor
                </button>
              </div>
            ) : (
              mySessions.map(session => {
                const isPending = session.sessionStatus === "PENDING";
                const accent = isPending ? "#f59e0b" : session.sessionStatus === "COMPLETED" ? "#10b981" : "#6366f1";
                return (
                  <div key={session.id} className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                      <FiCalendar className="text-base" style={{ color: accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                        {session.title}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                        {new Date(session.scheduledAt).toLocaleDateString()} · {session.duration}min · {session.cost} coins
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0"
                      style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}>
                      {session.sessionStatus}
                    </span>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
