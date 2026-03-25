import { api } from '../lib/axios';

export interface MentorProfile {
  id: string;
  userId: string;
  expertise: string;
  experience: string;
  hourlyRate: number;
  availability?: Record<string, any>;
  rating: number;
  totalSessions: number;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    title?: string;
    username: string;
    bio?: string;
    github?: string;
    linkedin?: string;
  };
  reviews?: MentorReview[];
  _count: { sessions: number; reviews: number };
}

export interface MentorReview {
  id: string;
  mentorProfileId: string;
  reviewerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description?: string;
  status: string;
  sessionStatus: string;
  scheduledAt: string;
  duration: number;
  meetingUrl?: string;
  cost: number;
  createdAt: string;
}

export interface MentorsResponse {
  mentors: MentorProfile[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const mentorsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<MentorsResponse>('/mentors', { params }),

  getOne: (mentorId: string) =>
    api.get<MentorProfile>(`/mentors/${mentorId}`),

  getMyProfile: () =>
    api.get<MentorProfile>('/mentors/my-profile'),

  getMySessions: (role: 'mentor' | 'mentee' = 'mentee') =>
    api.get<MentorSession[]>('/mentors/my-sessions', { params: { role } }),

  createProfile: (data: { expertise: string; experience: string; hourlyRate?: number }) =>
    api.post<MentorProfile>('/mentors/profile', data),

  updateProfile: (data: Record<string, any>) =>
    api.put<MentorProfile>('/mentors/profile', data),

  bookSession: (data: {
    mentorId: string;
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
  }) => api.post<MentorSession>('/mentors/book', data),

  completeSession: (sessionId: string) =>
    api.put<MentorSession>(`/mentors/sessions/${sessionId}/complete`),

  reviewMentor: (mentorProfileId: string, data: { rating: number; comment?: string }) =>
    api.post<MentorReview>(`/mentors/${mentorProfileId}/review`, data),
};
