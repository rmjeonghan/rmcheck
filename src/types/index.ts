// src/types/index.ts

import { Timestamp, GeoPoint } from "firebase/firestore";

// --- 학습 관련 타입들 ---

// 질문 데이터 타입
export interface Question {
  id: string;
  unitId: string;
  subChapter: string;
  questionText: string;
  choices: string[];
  answerIndex: number;
  mainChapter: string;
}

// 시험지 제출 데이터 타입
export interface Submission {
  id: string;
  userId: string;
  examId: string;
  questionIds: string[];
  answers: number[];
  incorrectQuestionIds: string[];
  score: number;
  mainChapter?: string;
  subChapter?: string;
  quizMode?: 'new' | 'mixed' | 'review_all' | 'review_incorrect';
  createdAt: Timestamp;
}


// --- 사용자 및 아카데미 관련 타입들 ---

// 학생 데이터 타입
export interface StudentData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAcademyMember: boolean;
  academyId?: string;
}

// 아카데미 데이터 타입
export interface AcademyData {
  id: string;
  name: string;
  adminId: string;
}

// 학원 과제 타입
export interface AcademyAssignment {
  id: string;
  title: string;
  chapterId: string;
  questions: string[];
  dueDate: Timestamp;
  status: 'assigned' | 'completed' | 'overdue';
}

// 학습 계획 타입 (새로 추가)
export interface LearningPlan {
  userId: string;
  weeklyPlans: Array<{
    sessionsPerWeek: number;
    targetChapterIds: string[];
  }>;
  createdAt: Timestamp; // Firestore 스크린샷에는 없지만, 관례적으로 추가
}

// Firestore에 저장될 학습 계획 (타입 가이드)
export interface PlanToSave {
  userId: string;
  weeklyPlans: Array<{
    sessionsPerWeek: number;
    targetChapterIds: string[];
  }>;
}