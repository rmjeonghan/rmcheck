// src/components/CurrentPlanWidget.tsx
'use client';

import { useMemo } from 'react';
import { format, startOfWeek, addDays, isBefore, isSameDay, endOfDay, getWeek } from 'date-fns';
import { motion } from 'framer-motion';
import { LearningPlan } from '@/types';
import { Submission } from '@/hooks/useMyPageData';

// --- 타입 정의 ---
interface CurrentPlanWidgetProps {
  plan: LearningPlan;
  submissions: Submission[];
  onEditClick: () => void;
};

type SessionStatus = 'completed' | 'pending' | 'missed';

interface StudySession {
  date: Date;
  week: number;
  session: number;
  dayOfWeek: string;
  status: SessionStatus;
}

// --- 헬퍼 함수 ---
const normalizeDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue.toDate === 'function') return dateValue.toDate();
  return null;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// --- 메인 컴포넌트 ---
export default function CurrentPlanWidget({ plan, submissions, onEditClick }: CurrentPlanWidgetProps) {
  
  if (!plan) {
    return null;
  }

  // [BUG FIX] plan.startDate를 컴포넌트 상단에서 안전하게 한 번만 변환합니다.
  const safeStartDate = useMemo(() => normalizeDate(plan.startDate), [plan.startDate]);

  const { studySessions, totalWeeks, missedSessionsCount, isAllCompleted } = useMemo(() => {
    // [BUG FIX] 안전하게 변환된 safeStartDate를 사용합니다.
    if (!safeStartDate || !plan.weeklyPlans) {
      return { studySessions: [], totalWeeks: 0, missedSessionsCount: 0, isAllCompleted: false };
    }

    const today = endOfDay(new Date());
    
    const submissionCountByWeek = new Map<number, number>();
    submissions.forEach(sub => {
      const subDate = normalizeDate(sub.createdAt);
      if (subDate) {
        const weekNumber = getWeek(subDate, { weekStartsOn: 1 });
        submissionCountByWeek.set(weekNumber, (submissionCountByWeek.get(weekNumber) || 0) + 1);
      }
    });

    const allSessions: StudySession[] = [];
    let totalMissed = 0;

    plan.weeklyPlans.forEach((weeklyPlan) => {
      const firstSessionDate = addDays(startOfWeek(safeStartDate, { weekStartsOn: 1 }), (weeklyPlan.week - 1) * 7);
      const weekNumber = getWeek(firstSessionDate, { weekStartsOn: 1 });
      const completedCountForWeek = submissionCountByWeek.get(weekNumber) || 0;
      
      weeklyPlan.studyDays.sort((a, b) => a - b).forEach((dayIndex, sessionIndex) => {
        const sessionDate = addDays(startOfWeek(safeStartDate, { weekStartsOn: 1 }), (weeklyPlan.week - 1) * 7 + (dayIndex === 0 ? 6 : dayIndex - 1) );
        
        const isCompleted = (sessionIndex + 1) <= completedCountForWeek;

        let status: SessionStatus = 'pending';
        if (isCompleted) {
          status = 'completed';
        } else if (isBefore(sessionDate, today)) {
          status = 'missed';
          totalMissed++;
        }

        allSessions.push({
          date: sessionDate,
          week: weeklyPlan.week,
          session: sessionIndex + 1,
          dayOfWeek: WEEKDAYS[dayIndex],
          status: status,
        });
      });
    });
    
    const isAllCompleted = allSessions.length > 0 && allSessions.every(s => s.status === 'completed');

    return { 
      studySessions: allSessions, 
      totalWeeks: plan.weeklyPlans.length,
      missedSessionsCount: totalMissed,
      isAllCompleted
    };
  }, [plan.weeklyPlans, submissions, safeStartDate]);

  const currentWeekSessions = useMemo(() => {
    const today = new Date();
    const weekOfToday = startOfWeek(today, { weekStartsOn: 1 });
    return studySessions.filter(session => 
      isSameDay(startOfWeek(session.date, { weekStartsOn: 1 }), weekOfToday)
    );
  }, [studySessions]);

  const motivationalMessage = useMemo(() => {
    if (isAllCompleted) return { emoji: '🎉', text: '모든 학습 계획을 완료했어요! 정말 대단해요!', color: 'bg-green-100 text-green-800' };
    if (missedSessionsCount > 0) return { emoji: '🔥', text: `밀린 학습 ${missedSessionsCount}개가 있어요. 지금 바로 시작해볼까요?`, color: 'bg-red-100 text-red-800' };
    if (currentWeekSessions.length > 0 && currentWeekSessions.every(s => s.status === 'completed')) return { emoji: '👍', text: '이번 주 학습을 모두 완료했어요! 다음 주도 화이팅!', color: 'bg-blue-100 text-blue-800' };
    return { emoji: '🚀', text: '계획에 맞춰 꾸준히 학습하고 있어요. 정말 멋져요!', color: 'bg-blue-100 text-blue-800' };
  }, [missedSessionsCount, isAllCompleted, currentWeekSessions]);

  // 애니메이션 Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-sm mb-8"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">나의 학습 계획 (총 {totalWeeks}주)</h2>
          <p className="text-sm text-slate-500 mt-1">
            {/* [BUG FIX] 안전한 startDate를 사용하여 날짜를 표시합니다. */}
            {safeStartDate && `${format(safeStartDate, 'yyyy.MM.dd')} 부터 시작`}
          </p>
        </div>
        <button onClick={onEditClick} className="px-5 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors text-sm">
          계획 수정
        </button>
      </div>
      
      <div className="my-5">
        <h3 className="font-bold text-slate-700 mb-3">이번 주 학습 체크리스트</h3>
        {currentWeekSessions.length > 0 ? (
          <motion.div 
            className="grid gap-2" 
            style={{ gridTemplateColumns: `repeat(${currentWeekSessions.length}, minmax(0, 1fr))` }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentWeekSessions.map((session, index) => (
              <motion.div 
                key={index} 
                className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-md text-center"
                variants={itemVariants}
              >
                <span className="text-3xl mb-1">
                  {session.status === 'completed' ? '✅' : (session.status === 'missed' ? '❗️' : '◻️')}
                </span>
                <p className={`font-semibold text-sm ${session.status === 'missed' ? 'text-red-600' : 'text-slate-800'}`}>
                  {session.session}회차 ({session.dayOfWeek})
                </p>
                <p className="text-xs text-slate-500">{format(session.date, 'M/d')}</p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center p-4 bg-slate-50 rounded-md">
            <p className="text-slate-500">이번 주에는 예정된 학습이 없어요. 🧘</p>
          </div>
        )}
      </div>

      <motion.div 
        className={`p-4 rounded-lg text-center ${motivationalMessage.color}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: currentWeekSessions.length * 0.1 + 0.2, duration: 0.3 }}
      >
        <p className="font-semibold">{motivationalMessage.emoji} {motivationalMessage.text}</p>
      </motion.div>
      
    </motion.section>
  );
}
