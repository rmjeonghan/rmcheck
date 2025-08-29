// src/types/index.ts

import { Timestamp } from 'firebase/firestore';

// =================================================================
//  사용자 데이터 (User Data)
// =================================================================

/** 학생 데이터 타입 */
export interface StudentData {
  academyName: string;
  status: 'pending' | 'active' | 'inactive';
}

// =================================================================
//  학습 계획 (Learning Plan)
// =================================================================

/** 주간 학습 계획 상세 타입 */
export interface WeeklyPlan {
  week: number;
  sessionsPerWeek: number;
  studyDays: number[];
  unitIds: string[];
  unitNames: string[];
}

/** 전체 학습 계획 타입 */
export interface LearningPlan {
  id: string;
  userId: string;
  startDate: Timestamp;
  weeklyPlans: WeeklyPlan[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** 저장을 위한 학습 계획 데이터 타입 */
export interface PlanToSave {
    startDate: Date;
    weeklyPlans: WeeklyPlan[];
}

// =================================================================
//  학습 활동 (Learning Activity)
// =================================================================

/**
 * 한 번의 퀴즈 제출 (`submissions`) 기록
 * useMyPageData에서 사용하는 모든 속성을 포함하도록 단일화했습니다.
 */
export interface Submission {
  id: string;
  userId: string;
  score: number;
  createdAt: Timestamp; // submittedAt -> createdAt 으로 수정 및 타입 명시
  answers?: (number | null)[];
  questionIds?: string[];
  incorrectQuestionIds?: string[];
  mainChapter?: string;
  subChapter?: string;
  timeTaken: number;
  
  // page.tsx에서 사용하기 위해 추가된 속성 (useMyPageData에서 생성)
  isCorrect?: boolean[];
  quizMode: 'new' | 'mixed' | 'review_all' | 'review_incorrect';
  academyName: string | null;
  assignmentId: string | null;
}

// =================================================================
//  학원 과제 (Academy Assignments)
// =================================================================

/** 학원 과제 데이터 타입 */
export interface AcademyAssignment {
  id: string;
  academyName: string;
  assignmentName: string; 
  assignedUnitIds: string[];
  createdAt: Timestamp;
  dueDate?: Timestamp; 
  week: number;
}

// =================================================================
//  문제 은행 (Question Bank)
// =================================================================
/**
 * `useMyPageData`에서 사용하는 Question 타입
 */
export interface Question {
    id: string;
    answerIndex: number;
    subChapter: string;
    mainChapter: string;
}