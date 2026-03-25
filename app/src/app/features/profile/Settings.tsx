import { useState } from "react";
import {
  FiArrowLeft,
  FiBell,
  FiCheckCircle,
  FiChevronRight,
  FiGlobe,
  FiLock,
  FiLogOut,
  FiMoon,
  FiSend,
  FiSettings,
  FiShield,
  FiSmartphone,
  FiUser,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../config/routes";
import {
  useLogout,
  useMe,
  useSendTelegramMessage,
  useTelegramStatus,
} from "./hooks";
import { getErrorMessage } from "../../../lib/errors";
import { useAuthStore } from "../../../store/auth.store";
import {
  getLanguageMeta,
  usePreferencesStore,
} from "../../../store/preferences.store";
import { useSoundStore } from "../../../store/sound.store";
import type { SettingsSection } from "../../../types/settings.types";
import { PageHeader } from "../../components/ui/Layout";

const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={on ? "Turn off" : "Turn on"}
    title={on ? "Turn off" : "Turn on"}
    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${on ? "bg-emerald-500" : "bg-white/15"}`}
  >
    <span
      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
    />
  </button>
);

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: me } = useMe();
  const profile = me ?? user;
  const { mutate: logout, isPending: isSigningOut } = useLogout();
  const handleSignOut = () => {
    logout(undefined, {
      onSettled: () => {
        navigate(APP_ROUTES.signin, { replace: true });
      },
    });
  };
  const [telegramSuccess, setTelegramSuccess] = useState("");
  const { muted, toggle: toggleSound } = useSoundStore();
  const notificationsEnabled = usePreferencesStore(
    (state) => state.notificationsEnabled,
  );
  const darkModeEnabled = usePreferencesStore((state) => state.darkModeEnabled);
  const twoFactorEnabled = usePreferencesStore(
    (state) => state.twoFactorEnabled,
  );
  const language = usePreferencesStore((state) => state.language);
  const setNotificationsEnabled = usePreferencesStore(
    (state) => state.setNotificationsEnabled,
  );
  const setDarkModeEnabled = usePreferencesStore(
    (state) => state.setDarkModeEnabled,
  );
  const setTwoFactorEnabled = usePreferencesStore(
    (state) => state.setTwoFactorEnabled,
  );
  const { data: telegramStatus, isLoading: telegramLoading } =
    useTelegramStatus();
  const {
    mutate: sendTelegramMessage,
    isPending: isSendingTelegram,
    error: telegramSendError,
  } = useSendTelegramMessage();

  const handleSendTelegramTest = () => {
    setTelegramSuccess("");
    sendTelegramMessage(
      {
        text: "Your Telegram connection is working. Bingo Wallet can now send you important updates here.",
      },
      {
        onSuccess: () => {
          setTelegramSuccess("Test message sent to your Telegram chat.");
        },
      },
    );
  };
  const currentLanguage = getLanguageMeta(language);

  const sections: SettingsSection[] = [
    {
      title: "Account",
      items: [
        {
          icon: <FiUser />,
          label: "Edit Profile",
          sub: "Name, avatar, username",
          action: () => navigate(APP_ROUTES.editProfile),
          chevron: true,
        },
        {
          icon: <FiLock />,
          label: "Change Password",
          sub: "Update your password",
          action: () => navigate(APP_ROUTES.changePassword),
          chevron: true,
        },
        {
          icon: <FiGlobe />,
          label: "Language",
          sub: `${currentLanguage.name} (${currentLanguage.native})`,
          action: () => navigate(APP_ROUTES.language),
          chevron: true,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: <FiBell />,
          label: "Notifications",
          sub: "Game alerts & updates",
          toggle: true,
          value: notificationsEnabled,
          onToggle: () =>
            setNotificationsEnabled(!notificationsEnabled),
        },
        {
          icon: muted ? <FiVolumeX className="text-rose-400" /> : <FiVolume2 />,
          label: "Sound Effects",
          sub: muted ? "Muted" : "On — tap to mute",
          toggle: true,
          value: !muted,
          onToggle: toggleSound,
        },
        {
          icon: <FiMoon />,
          label: "Dark Mode",
          sub: darkModeEnabled ? "Enabled" : "Light theme active",
          toggle: true,
          value: darkModeEnabled,
          onToggle: () => setDarkModeEnabled(!darkModeEnabled),
        },
      ],
    },
    {
      title: "Telegram",
      items: [
        {
          icon: <FiSmartphone />,
          label: "Telegram Status",
          sub: telegramLoading
            ? "Checking Telegram link..."
            : telegramStatus?.linked
              ? telegramStatus.telegramUsername
                ? `Connected as @${telegramStatus.telegramUsername}`
                : "Connected and ready for Mini App login"
              : "Open the app from Telegram Mini App to link your account",
        },
        {
          icon: telegramStatus?.linked ? <FiSend /> : <FiCheckCircle />,
          label: "Send Test Message",
          sub: telegramStatus?.linked
            ? isSendingTelegram
              ? "Sending test message to Telegram..."
              : "Verify that your bot notifications arrive instantly"
            : "Link Telegram first to enable bot messages",
          action: telegramStatus?.linked ? handleSendTelegramTest : undefined,
          chevron: Boolean(telegramStatus?.linked),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: <FiShield />,
          label: "Two-Factor Auth",
          sub: twoFactorEnabled
            ? "Extra account security enabled"
            : "Extra account security disabled",
          toggle: true,
          value: twoFactorEnabled,
          onToggle: () => setTwoFactorEnabled(!twoFactorEnabled),
        },
        {
          icon: <FiLock />,
          label: "Active Sessions",
          sub: "Manage devices",
          action: () => navigate(APP_ROUTES.activeSessions),
          chevron: true,
        },
      ],
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            title: "Admin",
            items: [
              {
                icon: <FiShield />,
                label: "Admin Panel",
                sub: "Stats, deposits, withdrawals & agents",
                action: () => navigate(APP_ROUTES.admin.panel),
                chevron: true,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <PageHeader
        left={
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Go back"
              title="Go back"
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90" style={{ background: "var(--bg-card)", border: "1px solid var(--border)"}}
            >
              <FiArrowLeft style={{ color: "var(--text)" }} />
            </button>
            <span className="text-base font-black">Settings</span>
          </div>
        }
        right={
          <div className="w-8 h-8 rounded-xl bg-gray-500/15 border border-gray-500/25 flex items-center justify-center">
            <FiSettings className="text-gray-400 text-sm" />
          </div>
        }
      />

      <div className="flex flex-col gap-5 px-5 py-5 pb-28">
        {/* Profile card */}
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.profile)}
          className="rounded-2xl p-4 flex items-center gap-4 transition-colors active:scale-[0.98] text-left"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40 shrink-0 flex items-center justify-center text-emerald-400 font-black text-lg">
              {profile?.firstName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black" style={{ color: "var(--text)" }}>
              {profile ? `${profile.firstName} ${profile.lastName}` : "—"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
              {profile?.email ?? "—"}
            </p>
          </div>
          <FiChevronRight style={{ color: "var(--text-3)" }} className="shrink-0" />
        </button>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {section.items.map((item, i) => {
                const borderStyle = i < section.items.length - 1 ? { borderBottom: "1px solid var(--border)" } : {};
                const base = "w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left";
                if (item.toggle) {
                  return (
                    <div key={item.label} className={base} style={borderStyle}>
                      <span className="text-sm shrink-0" style={{ color: "var(--text-3)" }}>{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.label}</p>
                        {item.sub && <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{item.sub}</p>}
                      </div>
                      <Toggle on={item.value!} onToggle={item.onToggle!} />
                    </div>
                  );
                }
                return (
                  <button key={item.label} type="button" onClick={item.action} className={base} style={borderStyle}>
                    <span className="text-sm shrink-0" style={{ color: "var(--text-3)" }}>{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.label}</p>
                      {item.sub && <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{item.sub}</p>}
                    </div>
                    <FiChevronRight className="shrink-0" style={{ color: "var(--text-3)" }} />
                  </button>
                );
              })}
            </div>
            {section.title === "Telegram" && telegramSendError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {getErrorMessage(
                  telegramSendError,
                  "Failed to send Telegram test message",
                )}
              </p>
            )}
            {section.title === "Telegram" && telegramSuccess && (
              <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                {telegramSuccess}
              </p>
            )}
          </div>
        ))}

        {/* Sign out */}
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-rose-500/10 border border-rose-500/20 rounded-2xl py-3.5 flex items-center justify-center gap-2 text-rose-400 font-bold text-sm hover:bg-rose-500/15 transition-colors active:scale-[0.98]"
        >
          <FiLogOut />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>

        <p className="text-center text-[11px] text-gray-600">
          Version 1.0.0 · Bingo Game
        </p>
      </div>
    </div>
  );
}
