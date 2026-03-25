import type { User } from "./user.types";

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  totalEarned: number;
  user?: User;
}

export interface UserStats {
  skillsCount: number;
  coursesCompleted: number;
  certificatesEarned: number;
}

export interface QuickActionItem {
  label: string;
  sub: string;
  icon: React.ReactNode;
  bg: string;
  path: string;
}

export interface StatCardItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}