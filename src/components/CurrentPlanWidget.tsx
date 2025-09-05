// src/components/CurrentPlanWidget.tsx
"use client";

import { LearningPlan } from "@/types";
import { curriculumData } from "@/data/curriculum";
import { differenceInWeeks, startOfDay } from 'date-fns';
import { Edit } from "lucide-react";

interface CurrentPlanWidgetProps {
  plan: LearningPlan;
  onEdit: () => void; 
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const getMainChapterName = (unitId: string): string => {
  const subjectKey = unitId.startsWith('1-') ? '통합과학 1' : '통합과학 2';
  const mainChapterId = unitId.split('-')[1];
  const chapter = curriculumData[subjectKey]?.find(c => 
    c.subChapters[0].startsWith(`${subjectKey === '통합과학 1' ? '1' : '2'}-${mainChapterId}-`)
  );
  return chapter ? chapter.name : "알 수 없는 단원";
};

const CurrentPlanWidget = ({ plan, onEdit }: CurrentPlanWidgetProps) => {
  // ▼▼▼ 오류 수정: plan 객체가 유효하지 않으면 아무것도 렌더링하지 않도록 안전장치를 추가합니다. ▼▼▼
  if (!plan || !plan.weeklyPlans || plan.weeklyPlans.length === 0) {
    // 이 부분은 Dashboard에서 이미 처리하지만, 이중으로 방어하는 것이 안전합니다.
    return null; 
  }
console.log("CurrentPlanWidget에 전달된 plan:", plan);
  const today = startOfDay(new Date());
  
  const planStartDate = (plan.createdAt && typeof plan.createdAt.toDate === 'function') 
    ? startOfDay(plan.createdAt.toDate()) 
    : today;

  const currentWeekNumber = differenceInWeeks(today, planStartDate) + 1;
  const currentWeekPlan = plan.weeklyPlans.find(p => p.week === currentWeekNumber);

  if (!currentWeekPlan || currentWeekPlan.unitIds.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border text-center">
        <h2 className="text-lg font-bold">이번 주 학습 계획이 없어요!</h2>
        <p className="text-slate-500 mt-2">새로운 계획을 세우거나, 자유롭게 학습을 시작해보세요.</p>
        <button onClick={onEdit} className="mt-4 inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">
          <Edit className="w-4 h-4 mr-2" />
          계획 수정하기
        </button>
      </div>
    );
  }

  const mainChapterNames = [...new Set(currentWeekPlan.unitIds.map(getMainChapterName))].join(', ');
  const weekProgress = plan.progress?.[currentWeekNumber] || [];
  const reviewCount = plan.reviewProgress?.[currentWeekNumber] || 0;
  
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm">{currentWeekNumber}주차 학습 계획</p>
          <p className="text-slate-800 font-bold text-lg">
            이번 주는 <span className="text-blue-600">{mainChapterNames}</span> 단원을 학습해요!
          </p>
        </div>
        <button onClick={onEdit} className="flex items-center px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full hover:bg-slate-200">
          <Edit className="w-4 h-4 mr-1.5" />
          수정
        </button>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">이번 주 학습 진행도</p>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map((day, index) => {
            const isPlanned = currentWeekPlan.days.includes(index);
            const isCompleted = weekProgress.includes(index);
            
            if (!isPlanned) {
              return <div key={index} className="p-2 rounded-lg bg-slate-100 text-center text-slate-400 text-sm">{day}</div>;
            }
            return (
              <div key={index} className={`p-2 rounded-lg text-center text-sm font-bold ${
                isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
              }`}>
                {isCompleted ? '✅' : day}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between text-sm">
            <p>달성률: <span className="font-bold">{weekProgress.length} / {currentWeekPlan.days.length}</span></p>
            <p>복습 횟수: <span className="font-bold">{reviewCount}회</span></p>
        </div>
      </div>
    </div>
  );
};

export default CurrentPlanWidget;

