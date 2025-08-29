import { Timestamp } from 'firebase/firestore';

/** 학생 데이터 타입 */
export interface StudentData {
  academyName: string;
  status: 'pending' | 'active' | 'inactive';
}

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
  startDate: Date | Timestamp;
  weeklyPlans: WeeklyPlan[];
  userId: string;
  status: 'active' | 'inactive';
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

/** 저장을 위한 학습 계획 데이터 타입 */
export interface PlanToSave {
    startDate: Date;
    weeklyPlans: WeeklyPlan[];
}

/** 학원 과제 데이터 타입 */
export interface AcademyAssignment {
  id: string;
  assignmentName: string; 
  // [추가] 마감일 필드
  dueDate?: Timestamp; 
  academyName: string;
  assignedUnitIds: string[];
  createdAt: Timestamp;
  week: number; // 주차 정보
}
