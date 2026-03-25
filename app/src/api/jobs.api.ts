import { api } from '../lib/axios';

export type JobType = 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE';
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'FILLED';
export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'LEAD_LEVEL';
export type ApplicationStatus =
  | 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED' | 'INTERVIEWED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface Job {
  id: string;
  title: string;
  description: string;
  type: JobType;
  status: JobStatus;
  location?: string;
  workMode: WorkMode;
  experience: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  requirements: string;
  benefits?: string;
  isSponsored: boolean;
  views: number;
  company?: { name: string; logo?: string; location?: string; isVerified: boolean };
  skills: Array<{ skill: { id: string; name: string; icon?: string } }>;
  _count: { applications: number };
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resume?: string;
  portfolio?: string;
  notes?: string;
  appliedAt: string;
  job: Job;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const jobsApi = {
  getAll: (params?: Record<string, any>) =>
    api.get<JobsResponse>('/jobs', { params }),

  getOne: (id: string) =>
    api.get<Job>(`/jobs/${id}`),

  getMyApplications: () =>
    api.get<JobApplication[]>('/jobs/my-applications'),

  apply: (id: string, data: { coverLetter?: string; resume?: string; portfolio?: string }) =>
    api.post<JobApplication>(`/jobs/${id}/apply`, data),

  create: (data: Record<string, any>) =>
    api.post<Job>('/jobs', data),

  update: (id: string, data: Record<string, any>) =>
    api.put<Job>(`/jobs/${id}`, data),

  getApplications: (jobId: string) =>
    api.get<JobApplication[]>(`/jobs/${jobId}/applications`),

  updateApplicationStatus: (applicationId: string, data: { status: string; notes?: string }) =>
    api.put(`/jobs/applications/${applicationId}/status`, data),
};
