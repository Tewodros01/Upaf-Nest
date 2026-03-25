import { useEffect, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaCoins } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../config/routes";
import { useDeposits, useWithdrawals } from "../payments";
import { useTransactions, useMe } from "./hooks";
import { useWalletStore } from "../../../store/wallet.store";
import type { ActivityItem, Deposit, StatusBadgeProps, WalletActivityStatus, WalletTab, Withdrawal } from "../../../types/wallet.types";
import { BottomNav } from "../../components/ui/Layout";
import { WALLET_QUICK_ACTIONS, WALLET_STATUS_STYLE, WALLET_TABS } from "./constants";
import { buildWalletActivity, formatWalletDate, getPendingWalletRequestCount, getWalletStatusLabel } from "./utils";

function StatusBadge({ status }: StatusBadgeProps) {
  const isPending = status === "PENDING" || status === "PROCESSING";
  return (
    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border flex items-center gap-0.5 ${WALLET_STATUS_STYLE[status] ?? ""}`}>
      {isPending && <FiClock className="text-[8px]" />}
      {getWalletStatusLabel(status)}
    </span>
  );
}

export default function MyWallet() {
  const navigate = useNavigate();
  const { balance, syncFromUser } = useWalletStore();
  const [tab, setTab] = useState<WalletTab>("overview");

  const { data: me } = useMe();
  const { data: txData } = useTransactions({ limit: 50 });
  const { data: deposits = [] } = useDeposits();
  const { data: withdrawals = [] } = useWithdrawals();

  useEffect(() => {
    if (me?.coinsBalance !== undefined) syncFromUser(me.coinsBalance);
  }, [me?.coinsBalance, syncFromUser]);

  const formattedBalance = useMemo(() => balance.toLocaleString(), [balance]);
  const activity = useMemo<ActivityItem[]>(
    () => buildWalletActivity(txData?.data ?? [], deposits, withdrawals),
    [txData?.data, deposits, withdrawals],
  );
  const pendingCount = useMemo(
    () => getPendingWalletRequestCount(deposits, withdrawals),
    [deposits, withdrawals],
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3.5 backdrop-blur-xl"
        style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(20,184,166,0.12)", border: "1px solid rgba(20,184,166,0.25)" }}>
            <FaCoins className="text-teal-400 text-sm" />
          </div>
          <span className="text-base font-black" style={{ color: "var(--text)" }}>My Wallet</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <FaCoins className="text-yellow-400 text-xs" />
          <span className="text-xs font-black text-yellow-400">{formattedBalance}</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 py-5 pb-28">

        {/* ── Balance hero ── */}
        <div className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(20,184,166,0.05))", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>Total Balance</p>
          <div className="flex items-end gap-2 mb-4">
            <FaCoins className="text-yellow-400 text-2xl mb-1" />
            <span className="text-4xl font-black text-yellow-400 leading-none">{formattedBalance}</span>
            <span className="text-sm mb-1" style={{ color: "var(--text-3)" }}>coins</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WALLET_QUICK_ACTIONS.map(({ label, icon: Icon, color, bg, path }) => (
              <button key={label} type="button" onClick={() => navigate(path)}
                className={`${bg} border rounded-xl py-2.5 flex flex-col items-center gap-1 active:scale-95 transition-all`}>
                <span className={`text-sm ${color}`}><Icon /></span>
                <span className="text-[10px] font-bold" style={{ color: "var(--text-2)" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2">
          {WALLET_TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={tab === t
                ? { background: "#10b981", color: "#fff", boxShadow: "0 0 12px rgba(16,185,129,0.35)" }
                : { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              {t === "overview" ? "Overview" : `Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Recent Activity</p>
              <button type="button" onClick={() => navigate(APP_ROUTES.walletHistory)}
                className="text-xs font-semibold text-emerald-500">See all</button>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {activity.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-3)" }}>No activity yet</div>
              ) : (
                activity.map((item, i) => (
                  <div key={`${item.kind}-${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 ${i < activity.length - 1 ? "border-b" : ""}`}
                    style={i < activity.length - 1 ? { borderColor: "var(--border)" } : {}}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>{item.title}</p>
                        {item.status !== "COMPLETED" && <StatusBadge status={item.status} />}
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{item.subtitle}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ${item.color}`}>
                      {item.isIncome ? "+" : "-"}{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Requests ── */}
        {tab === "requests" && (
          <div className="flex flex-col gap-5">
            {/* Deposits */}
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Deposit Requests</p>
              {deposits.length === 0 ? (
                <div className="rounded-2xl px-4 py-6 text-center text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                  No deposit requests yet
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {deposits.map((d: Deposit) => (
                    <div key={d.id} className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <FaArrowDown className="text-emerald-400 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--text)" }}>Deposit via {d.method}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{formatWalletDate(d.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 text-sm font-black text-yellow-400">
                          <FaCoins className="text-xs" />{d.amount.toLocaleString()}
                        </span>
                        <StatusBadge status={d.status as WalletActivityStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawals */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Withdrawal Requests</p>
                <button type="button" onClick={() => navigate(APP_ROUTES.withdrawalStatus)}
                  className="text-xs font-semibold text-emerald-500">Full history →</button>
              </div>
              {withdrawals.length === 0 ? (
                <div className="rounded-2xl px-4 py-6 text-center text-sm" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-3)" }}>
                  No withdrawal requests yet
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {withdrawals.map((w: Withdrawal) => (
                    <div key={w.id} className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
                        <FaArrowUp className="text-rose-400 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ color: "var(--text)" }}>Withdraw via {w.method}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{w.accountNumber} · {formatWalletDate(w.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="flex items-center gap-1 text-sm font-black text-rose-400">
                          <FaCoins className="text-xs text-yellow-400" />{w.amount.toLocaleString()}
                        </span>
                        <StatusBadge status={w.status as WalletActivityStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
