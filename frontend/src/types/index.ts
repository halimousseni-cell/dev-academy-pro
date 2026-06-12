export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface ModuleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  estimatedMinutes: number;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export type LessonStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type LessonType = "THEORY" | "EXERCISE" | "PROJECT";
export type QuestionType = "MCQ" | "TRUE_FALSE" | "CODE_FILL" | "DEBUG" | "DRAG_DROP";

export interface Lesson {
  id: string;
  title: string;
  order: number;
  type: LessonType;
  contentMd: string;
  status: LessonStatus;
}

export interface QuizAnswerOption {
  id: string;
  label: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  order: number;
  type: QuestionType;
  prompt: string;
  answers: QuizAnswerOption[];
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  timeLimitSeconds: number | null;
  questions: QuizQuestion[];
  bestAttempt: { score: number; passed: boolean } | null;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  order: number;
  lessons: Lesson[];
  quizzes: Quiz[];
}

export interface ModuleDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  chapters: Chapter[];
}

export interface QuizSubmitResult {
  score: number;
  passed: boolean;
  passingScore: number;
  detail: {
    questionId: string;
    isCorrect: boolean;
    correctAnswerIds: string[];
    correctAnswerLabel?: string;
    explanation: string;
  }[];
}

export interface ExamQuestion {
  id: string;
  order: number;
  type: QuestionType;
  prompt: string;
  answers: QuizAnswerOption[];
}

export interface Exam {
  id: string;
  title: string;
  passingScore: number;
  timeLimitSeconds: number | null;
  module: { id: string; title: string; slug: string };
  moduleCompleted: boolean;
  questions: ExamQuestion[];
  bestAttempt: { score: number; passed: boolean } | null;
  certificate: { id: string; serialNumber: string } | null;
}

export interface ExamSubmitResult {
  score: number;
  passed: boolean;
  passingScore: number;
  detail: {
    questionId: string;
    isCorrect: boolean;
    correctAnswerIds: string[];
    correctAnswerLabel?: string;
    explanation: string;
  }[];
  certificate: { id: string; serialNumber: string } | null;
}

export interface CertificateSummary {
  id: string;
  serialNumber: string;
  score: number;
  issuedAt: string;
  module: { title: string; slug: string; category: string };
}

export interface CertificateDetail {
  id: string;
  serialNumber: string;
  score: number;
  issuedAt: string;
  signature: string;
  module: { title: string; slug: string; category: string };
  holder: { firstName: string; lastName: string };
}

export interface CertificateVerification {
  valid: boolean;
  reason?: string;
  serialNumber?: string;
  holder?: string;
  module?: string;
  score?: number;
  issuedAt?: string;
}

export interface DashboardData {
  user: { firstName: string; lastName: string; memberSince: string };
  stats: {
    totalTimeSeconds: number;
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
    quizzesPassed: number;
    level: number;
  };
  weeklyGoal: {
    targetMinutes: number;
    achievedMinutes: number;
    quizAttemptsThisWeek: number;
  };
  badges: { code: string; title: string; description: string; icon: string; earnedAt: string }[];
  moduleStats: {
    slug: string;
    title: string;
    category: string;
    completedLessons: number;
    totalLessons: number;
    quizzesPassed: number;
    totalQuizzes: number;
    progressPercent: number;
  }[];
  recentActivity: {
    quizTitle: string;
    moduleTitle: string;
    score: number;
    passed: boolean;
    createdAt: string;
  }[];
}
