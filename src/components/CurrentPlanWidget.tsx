// src/components/CurrentPlanWidget.tsx

'use client';

import { LearningPlan, Submission } from '@/types';
import { motion } from 'framer-motion';
import { Check, AlertCircle, PartyPopper } from 'lucide-react';
import { differenceInCalendarWeeks, startOfWeek, endOfWeek, isWithinInterval, addWeeks, parseISO, format, getDay } from 'date-fns';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CurrentPlanWidgetProps {
  plan: LearningPlan;
  submissions: Submission[];
  onEditClick: () => void;
}

export default function CurrentPlanWidget({ plan, submissions, onEditClick }: CurrentPlanWidgetProps) {
  // Firestore Timestamp가 toDate 메서드를 가지고 있는지 확인
  if (!plan.startDate || typeof plan.startDate.toDate !== 'function') {
      console.error("Invalid plan.startDate", plan.startDate);
      // 혹은 적절한 fallback UI를 보여줄 수 있습니다.
      return <div>학습 계획 날짜를 불러올 수 없습니다.</div>;
  }
  const planStartDate = plan.startDate.toDate();
  const today = new Date();

  const currentWeekIndex = differenceInCalendarWeeks(today, planStartDate, { weekStartsOn: 1 });
  const currentWeeklyPlan = plan.weeklyPlans[currentWeekIndex];

  if (!currentWeeklyPlan) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <PartyPopper className="mx-auto text-green-500 mb-2" size={32} />
        <h3 className="text-xl font-bold">모든 학습 계획을 완료했어요!</h3>
        <p className="text-gray-500 mt-1">정말 대단해요! 새로운 계획을 세워볼까요?</p>
      </div>
    );
  }

  const weekStart = startOfWeek(addWeeks(planStartDate, currentWeekIndex), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(addWeeks(planStartDate, currentWeekIndex), { weekStartsOn: 1 });

  // ▼▼▼ 'submittedAt'을 'createdAt'으로 수정 ▼▼▼
  const completedSessionsThisWeek = submissions.filter(s => 
    s.createdAt && typeof s.createdAt.toDate === 'function' && // 방어 코드 추가
    isWithinInterval(s.createdAt.toDate(), { start: weekStart, end: weekEnd })
  ).length;
  
  const totalPlannedSessionsUntilLastWeek = plan.weeklyPlans
    .slice(0, currentWeekIndex)
    .reduce((acc, p) => acc + p.sessionsPerWeek, 0);
  
  const lastWeekEnd = endOfWeek(addWeeks(planStartDate, currentWeekIndex - 1), { weekStartsOn: 1 });
  
  // ▼▼▼ 'submittedAt'을 'createdAt'으로 수정 ▼▼▼
  const totalCompletedSessionsUntilLastWeek = submissions.filter(s => 
    s.createdAt && typeof s.createdAt.toDate === 'function' && // 방어 코드 추가
    s.createdAt.toDate() <= lastWeekEnd
  ).length;

  const overdueSessions = Math.max(0, totalPlannedSessionsUntilLastWeek - totalCompletedSessionsUntilLastWeek);
  const allSessionsDoneThisWeek = completedSessionsThisWeek >= currentWeeklyPlan.sessionsPerWeek;

  const sessionCheckboxes = Array.from({ length: currentWeeklyPlan.sessionsPerWeek }, (_, i) => {
    const dayIndex = currentWeeklyPlan.studyDays[i] ?? -1;
    return {
      id: `week-${currentWeeklyPlan.week}-session-${i + 1}`,
      label: `${currentWeeklyPlan.week}주차 ${i + 1}회차`,
      day: WEEKDAYS[dayIndex] || '',
      isCompleted: i < completedSessionsThisWeek
    };
  });

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">이번 주 학습 계획</h3>
        <button onClick={onEditClick} className="text-sm font-semibold text-gray-500 hover:text-blue-500">수정</button>
      </div>

      {overdueSessions > 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={18} />
          <p>밀린 학습이 <strong className="font-bold">{overdueSessions}회</strong> 있어요! 힘내세요!</p>
        </div>
      )}
      {allSessionsDoneThisWeek && overdueSessions === 0 && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <PartyPopper size={18} />
          <p>이번 주 목표 달성! <strong className="font-bold">정말 잘했어요!</strong></p>
        </div>
      )}
      
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-4">
          {sessionCheckboxes.map(item => (
            <div key={item.id} className="flex-shrink-0 text-center">
              <motion.div
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4
                  ${item.isCompleted ? 'bg-blue-500 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                {item.isCompleted && <Check className="text-white" size={32} />}
              </motion.div>
              <p className="text-xs font-bold text-gray-700 mt-2">{item.day}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}