import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrophy, FaCode, FaPalette, FaBrain, FaLightbulb } from "react-icons/fa";
import { FiUsers, FiClock, FiAward, FiSend, FiLink, FiArrowLeft } from "react-icons/fi";
import { competitionsApi } from "../../../api/competitions.api";
import { PageHeader } from "../../components/ui/Layout";
import { toast } from "../../../store/toast.store";
import { getPublicAssetUrl, getAvatarInitials } from "../../../lib/assets";

const TYPE_META: Record<string, { label: string; Icon: any; accent: string }> = {
  CODING:       { label: "Coding",     Icon: FaCode,     accent: "#6366f1" },
  DESIGN:       { label: "Design",     Icon: FaPalette,  accent: "#ec4899" },
  HACKATHON:    { label: "Hackathon",  Icon: FaTrophy,   accent: "#f59e0b" },
  QUIZ:         { label: "Quiz",       Icon: FaBrain,    accent: "#10b981" },
  ALGORITHM:    { label: "Algorithm",  Icon: FaCode,     accent: "#8b5cf6" },
  DATA_SCIENCE: { label: "Data Sci",   Icon: FaLightbulb,accent: "#06b6d4" },
};

export default function CompetitionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);

  const { data: competition, isLoading } = useQuery({
    queryKey: ["competition", id],
    queryFn: () => competitionsApi.getOne(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ["competition", id, "leaderboard"],
    queryFn: () => competitionsApi.getLeaderboard(id!).then((r) => r.data),
    enabled: !!id,
    staleTime: 15_000,
  });

  const { mutate: register, isPending: registering } = useMutation({
    mutationFn: () => competitionsApi.register(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competition", id] });
      toast.success("Registered! Good luck 🏆");
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: () => competitionsApi.submit(id!, { submissionUrl: submitUrl, description: submitDesc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competition", id] });
      toast.success("Submission sent! 🚀");
      setShowSubmit(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed"),
  });

  if (isLoading || !competition) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <PageHeader title="Competition" onBack={() => navigate(-1)} />
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "var(--bg-card)" }} />
          ))}
        </div>
      </div>
    );
  }

  const meta = TYPE_META[competition.type] ?? TYPE_META.CODING;
  const isRegistered = !!competition.myEntry;
  const hasSubmitted = !!competition.myEntry?.submissionUrl;

  return (
    <div className="min-h-screen pb-10" style={{ background: "var(--bg)" }}>
      <PageHeader title={competition.title} onBack={() => navigate(-1)} />

      <div className="flex flex-col gap-4 px-4 pt-4">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: `linear-gradient(135deg,${meta.accent}cc,${meta.accent}88)` }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full blur-3xl" style={{ background: `${meta.accent}40` }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
                <meta.Icon className="text-white text-lg" />
              </div>
              <div>
                <p className="text-white font-black text-base">{competition.title}</p>
                <p className="text-white/70 text-xs">{meta.label}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Prize", value: competition.prize > 0 ? `${competition.prize.toLocaleString()} coins` : "Free" },
                { label: "Entry", value: competition.entryFee > 0 ? `${competition.entryFee} coins` : "Free" },
                { label: "Spots", value: `${competition._count.entries}/${competition.maxParticipants}` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-2 text-center bg-white/10">
                  <p className="text-white font-black text-sm">{s.value}</p>
                  <p className="text-white/60 text-[10px]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Start Date", value: new Date(competition.startDate).toLocaleDateString(), Icon: FiClock },
            { label: "End Date",   value: new Date(competition.endDate).toLocaleDateString(),   Icon: FiClock },
          ].map((d) => (
            <div key={d.label} className="flex items-center gap-2.5 p-3 rounded-2xl"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <d.Icon className="text-sm shrink-0" style={{ color: "var(--text-3)" }} />
              <div>
                <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{d.label}</p>
                <p className="text-xs font-bold" style={{ color: "var(--text)" }}>{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="text-xs font-bold mb-2" style={{ color: "var(--text-3)" }}>ABOUT</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{competition.description}</p>
        </div>

        {/* Rules */}
        {competition.rules && (
          <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--text-3)" }}>RULES</p>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text)" }}>{competition.rules}</p>
          </div>
        )}

        {/* Action */}
        {competition.status !== "COMPLETED" && competition.status !== "CANCELLED" && (
          <div className="flex flex-col gap-2">
            {!isRegistered ? (
              <button type="button" disabled={registering} onClick={() => register()}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg,${meta.accent},${meta.accent}cc)` }}>
                <FiAward className="text-sm" />
                {registering ? "Registering…" : `Register${competition.entryFee > 0 ? ` (${competition.entryFee} coins)` : " Free"}`}
              </button>
            ) : (
              <button type="button" onClick={() => setShowSubmit(!showSubmit)}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                <FiSend className="text-sm" />
                {hasSubmitted ? "Update Submission" : "Submit Entry"}
              </button>
            )}

            {showSubmit && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 p-4 rounded-2xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
                  <FiLink className="text-sm shrink-0" style={{ color: "var(--text-3)" }} />
                  <input value={submitUrl} onChange={(e) => setSubmitUrl(e.target.value)}
                    placeholder="Submission URL (GitHub, Figma, etc.)"
                    className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text)" }} />
                </div>
                <textarea value={submitDesc} onChange={(e) => setSubmitDesc(e.target.value)} rows={2}
                  placeholder="Brief description..."
                  className="rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <button type="button" disabled={!submitUrl || submitting} onClick={() => submit()}
                  className="py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 active:scale-95 transition-all"
                  style={{ background: "#10b981" }}>
                  {submitting ? "Submitting…" : "Confirm Submission"}
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: "var(--text-3)" }}>Leaderboard</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {leaderboard.slice(0, 10).map((entry, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3"
                  style={i < leaderboard.length - 1 ? { borderBottom: "1px solid var(--border)" } : {}}>
                  <span className="w-6 text-xs font-black text-center shrink-0"
                    style={{ color: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#f97316" : "var(--text-3)" }}>
                    #{entry.rank}
                  </span>
                  {getPublicAssetUrl(entry.user?.avatar) ? (
                    <img src={getPublicAssetUrl(entry.user?.avatar)!} alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black"
                      style={{ background: "var(--bg-overlay)", color: "var(--text)" }}>
                      {getAvatarInitials(entry.user?.firstName, entry.user?.lastName, "?")}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                      {entry.user?.firstName} {entry.user?.lastName}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-3)" }}>@{entry.user?.username}</p>
                  </div>
                  {entry.score !== null && entry.score !== undefined && (
                    <span className="text-sm font-black" style={{ color: meta.accent }}>{entry.score}pts</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
