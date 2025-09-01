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
// 앞으로 생성될 다른 타입들도 이곳에 추가합니다.
// export interface LearningPlan { ... }
// export interface Submission { ... }