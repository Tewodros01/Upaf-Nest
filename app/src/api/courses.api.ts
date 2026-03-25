import { api as axios } from '../lib/axios';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  };
  price: number;
  duration?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isPublished: boolean;
  isFeatured: boolean;
  rating: number;
  enrollCount: number;
  skills: Array<{
    skill: {
      id: string;
      name: string;
      category: string;
      icon?: string;
    };
  }>;
  reviews?: CourseReview[];
  _count: {
    enrollments: number;
    reviews: number;
  };
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  progress: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  courseId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
  duration?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  skillIds: string[];
  content?: any;
}

export interface CourseQuery {
  search?: string;
  level?: string;
  skillId?: string;
  instructorId?: string;
  isFree?: boolean;
  isFeatured?: boolean;
  sortBy?: 'rating' | 'enrollCount' | 'createdAt' | 'price';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const coursesApi = {
  // Public endpoints
  getCourses: (query: CourseQuery = {}) => 
    axios.get<CoursesResponse>('/courses', { params: query }),

  getCourseById: (id: string) => 
    axios.get<Course>(`/courses/${id}`),

  // Instructor endpoints
  createCourse: (data: CreateCourseData) => 
    axios.post<Course>('/courses', data),

  getInstructorCourses: () => 
    axios.get<Course[]>('/courses/instructor/my-courses'),

  getInstructorStats: () => 
    axios.get('/courses/instructor/stats'),

  updateCourse: (id: string, data: Partial<CreateCourseData>) => 
    axios.put<Course>(`/courses/${id}`, data),

  deleteCourse: (id: string) => 
    axios.delete(`/courses/${id}`),

  // Student endpoints
  enrollInCourse: (courseId: string) => 
    axios.post<Enrollment>(`/courses/${courseId}/enroll`),

  getUserEnrollments: (status?: string) => 
    axios.get<Enrollment[]>('/courses/my-enrollments', { params: { status } }),

  updateEnrollment: (courseId: string, data: { status?: string; progress?: number }) => 
    axios.put<Enrollment>(`/courses/${courseId}/enrollment`, data),

  reviewCourse: (courseId: string, data: { rating: number; comment?: string }) => 
    axios.post<CourseReview>(`/courses/${courseId}/review`, data),
};