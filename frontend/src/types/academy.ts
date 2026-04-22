/**
 * Academy Module Types
 * Defines the data structures for the Epic Dreams Academy
 */

export type LessonType = 'video' | 'text' | 'quiz' | 'project' | 'interactive';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  duration?: number; // in minutes
  content?: string; // markdown or HTML content
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  projectBrief?: string;
  resources?: Resource[];
  order: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'file' | 'video';
  url: string;
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
    bio: string;
  };
  modules: Module[];
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // total hours
  enrolledCount: number;
  rating: number;
  tags: string[];
  isFree: boolean;
  price?: number;
  prerequisites?: string[];
  learningObjectives: string[];
}

export interface UserProgress {
  courseId: string;
  completedLessons: string[]; // lesson IDs
  currentLessonId: string;
  quizScores: Record<string, number>; // lessonId -> score
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  certificateEarned?: boolean;
}

export interface AcademyState {
  courses: Course[];
  userProgress: Record<string, UserProgress>; // courseId -> progress
  activeCourseId: string | null;
  activeLessonId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor' | 'ai';
  content: string;
  timestamp: Date;
  relatedLessonId?: string;
}

export interface MentorSession {
  id: string;
  courseId: string;
  messages: MentorMessage[];
  isActive: boolean;
  createdAt: Date;
}
