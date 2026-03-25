import { api } from '../lib/axios';

export type CompetitionType = 'CODING' | 'DESIGN' | 'HACKATHON' | 'QUIZ' | 'ALGORITHM' | 'DATA_SCIENCE';
export type CompetitionStatus = 'UPCOMING' | 'REGISTRATION_OPEN' | 'ONGOING' | 'JUDGING' | 'COMPLETED' | 'CANCELLED';

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: CompetitionType;
  status: CompetitionStatus;
  thumbnail?: string;
  prize: number;
  entryFee: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  rules?: string;
  isSponsored: boolean;
  sponsor?: string;
  _count: { entries: number };
  myEntry?: CompetitionEntry | null;
  entries?: LeaderboardEntry[];
  winners?: CompetitionWinner[];
  createdAt: string;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  userId: string;
  submissionUrl?: string;
  description?: string;
  score?: number;
  rank?: number;
  submittedAt: string;
  competition?: Competition;
}

export interface CompetitionWinner {
  id: string;
  competitionId: string;
  userId: string;
  position: number;
  prize: number;
}

export interface LeaderboardEntry {
  rank: number;
  user?: { id: string; username: string; firstName: string; lastName: string; avatar?: string };
  score?: number;
  submittedAt: string;
  submissionUrl?: string;
}

export interface CompetitionsResponse {
  competitions: Competition[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const competitionsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<CompetitionsResponse>('/competitions', { params }),

  getOne: (id: string) =>
    api.get<Competition>(`/competitions/${id}`),

  getLeaderboard: (id: string) =>
    api.get<LeaderboardEntry[]>(`/competitions/${id}/leaderboard`),

  getMyEntries: () =>
    api.get<CompetitionEntry[]>('/competitions/my-entries'),

  register: (id: string) =>
    api.post<CompetitionEntry>(`/competitions/${id}/register`),

  submit: (id: string, data: { submissionUrl?: string; description?: string }) =>
    api.post<CompetitionEntry>(`/competitions/${id}/submit`, data),

  create: (data: Record<string, any>) =>
    api.post<Competition>('/competitions', data),

  update: (id: string, data: Record<string, any>) =>
    api.put<Competition>(`/competitions/${id}`, data),

  scoreEntry: (id: string, entryUserId: string, data: { score: number; rank?: number }) =>
    api.put(`/competitions/${id}/entries/${entryUserId}/score`, data),

  announceWinners: (id: string) =>
    api.post(`/competitions/${id}/announce-winners`),
};
