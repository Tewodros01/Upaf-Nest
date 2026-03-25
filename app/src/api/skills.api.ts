import axios from '../lib/axios';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skill: Skill;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSkillData {
  name: string;
  description?: string;
  category: string;
  icon?: string;
}

export interface AddUserSkillData {
  skillId: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

export const skillsApi = {
  // Skills management
  getAllSkills: (category?: string) => 
    axios.get<Skill[]>('/skills', { params: { category } }),

  getSkillById: (id: string) => 
    axios.get<Skill>(`/skills/${id}`),

  getSkillCategories: () => 
    axios.get<string[]>('/skills/categories'),

  getPopularSkills: (limit = 10) => 
    axios.get<Skill[]>('/skills/popular', { params: { limit } }),

  getSkillStats: (id: string) => 
    axios.get(`/skills/${id}/stats`),

  createSkill: (data: CreateSkillData) => 
    axios.post<Skill>('/skills', data),

  updateSkill: (id: string, data: Partial<CreateSkillData>) => 
    axios.put<Skill>(`/skills/${id}`, data),

  deleteSkill: (id: string) => 
    axios.delete(`/skills/${id}`),

  // User skills management
  getUserSkills: () => 
    axios.get<UserSkill[]>('/skills/my-skills'),

  addUserSkill: (data: AddUserSkillData) => 
    axios.post<UserSkill>('/skills/my-skills', data),

  updateUserSkill: (skillId: string, data: { level?: string; verified?: boolean }) => 
    axios.put<UserSkill>(`/skills/my-skills/${skillId}`, data),

  removeUserSkill: (skillId: string) => 
    axios.delete(`/skills/my-skills/${skillId}`),

  // Admin utilities
  seedDefaultSkills: () => 
    axios.post('/skills/seed'),
};