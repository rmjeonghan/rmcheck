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
  // 예: [0, 2, 4] -> 일, 화, 목 학습
  days: number[]; 
  // 예: ["1-1-1", "1-1-2"]
  unitIds: string[]; 
}

export interface LearningPlan {
  id: string;
  userId: string;
  totalWeeks: number;
  startDate: Timestamp;
  endDate: Timestamp;
  weeklyPlans: WeeklyPlan[];
  createdAt: Timestamp;
}

export interface Question {
  id: string;
  questionText: string;
  choices: string[];
  answerIndex: number;
  unitId: string;
  explanation?: string; // 해설은 선택적으로 포함
  reviewContext?: string; // 복습 문항일 경우 출처 정보
  subChapter?: string;
}

export interface Submission {
  id: string;
  userId: string;
  questionIds: string[];
  answers: (number | null)[];
  score: number;
  mainChapter: string;
  // --- 📍 createdAt이 Timestamp와 FieldValue 타입을 모두 가질 수 있도록 수정합니다 ---
  createdAt: Timestamp | FieldValue;
  isDeleted: boolean;
  assignmentId?: string;
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
  // 문서 ID는 studentId_assignmentId 형식으로 사용합니다.
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
  // Firestore 'students' 컬렉션에서 오는 추가 정보
  name?: string;
  academyName?: string;
  role?: 'student' | 'admin' | 'teacher';
  createdAt?: Timestamp;
  // 학습 계획 및 활동 관련 정보
  learningPlan?: {
    unitIds: string[];
    createdAt: Timestamp;
  };
  totalQuizzes?: number;
  totalQuestions?: number;
}

export interface LearningPlan {
  id: string;
  userId: string;
  weeklyPlans: WeeklyPlan[];
  progress?: { [week: number]: number[] }; 
  reviewProgress?: { [week: number]: number }; 
  createdAt: Timestamp; // 'any' 타입을 'Timestamp'로 수정
  updatedAt?: Timestamp; // 'any' 타입을 'Timestamp'로 수정
}

export interface WeeklyPlan {
  week: number;
  days: number[]; // 0:일, 1:월, 2:화, 3:수, 4:목, 5:금, 6:토
  unitIds: string[];
}

export interface Submission {
  id: string;
  userId: string;
  questionIds: string[];
  answers: (number | null)[];
  score: number;
  mainChapter: string;
  createdAt: Timestamp; // 'any' 타입을 'Timestamp'로 수정
  isDeleted: boolean;
  mode?: QuizMode;
}
// 앞으로 생성될 다른 타입들도 이곳에 추가합니다.
// export interface LearningPlan { ... }
// export interface Submission { ... }