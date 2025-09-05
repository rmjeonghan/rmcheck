// src/types/index.ts
import { Timestamp, FieldValue } from 'firebase/firestore';

export type QuizMode = 'new' | 'new_review' | 'review_all' | 'review_incorrect';

export interface Assignment {
  id: string;
  academyName: string;
  assignedDate: Timestamp;
  assignedUnitIds: string[];
  dayTitle: string;
  dueDate: Timestamp;
  title: string;
  week: number;
  isCompleted: boolean;
  completedDate: Timestamp | null;
}

export interface WeeklyPlan {
  week: number;
  // 예: [0, 2, 4] -> 일, 화, 목 학습 // 0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토
  days: number[];
  // 예: ["1-1-1", "1-1-2"]
  unitIds: string[];
}

// 📌 [수정] 중복 정의를 합치고, createdAt/updatedAt에 FieldValue 타입을 추가했습니다.
export interface LearningPlan {
  id: string;
  userId: string;
  totalWeeks: number;
  startDate: Timestamp;
  endDate: Timestamp;
  weeklyPlans: WeeklyPlan[];
  progress?: { [week: number]: number[] };
  reviewProgress?: { [week: number]: number };
  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue; // updatedAt도 FieldValue를 가질 수 있도록 수정
}

export interface Question {
  id: string;
  questionText: string;
  choices: string[];
  answerIndex: number;
  unitId: string;
  explanation?: string;
  reviewContext?: string;
  subChapter?: string;
}

// 📌 [수정] 중복 정의를 합치고 createdAt 타입을 올바르게 수정했습니다.
export interface Submission {
  id: string;
  userId: string;
  questionIds: string[];
  answers: (number | null)[];
  score: number;
  mainChapter: string;
  createdAt: Timestamp | FieldValue;
  isDeleted: boolean;
  assignmentId?: string;
  mode?: QuizMode;
}

export interface Student {
  uid: string;
  studentName: string;
  email: string;
  createdAt: Timestamp;
  status: 'pending' | 'active' | 'rejected';
  isDeleted: boolean;
  academyName: string | null;
}

export interface StudentAssignment {
  studentId: string;
  assignmentId: string;
  academyName: string;
  isCompleted: boolean;
  completedAt: Timestamp;
  score: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  name?: string;
  academyName?: string;
  role?: 'student' | 'admin' | 'teacher';
  createdAt?: Timestamp;
  learningPlan?: {
    unitIds: string[];
    createdAt: Timestamp;
  };
  totalQuizzes?: number;
  totalQuestions?: number;
}

// ❌ [삭제] 파일 하단에 중복으로 선언되었던 LearningPlan, WeeklyPlan, Submission 인터페이스는 모두 제거했습니다.