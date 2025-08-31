// src/components/CurrentPlanWidget.tsx

'use client';

import { LearningPlan, Submission, Question } from '@/types';
import { motion } from 'framer-motion';
import { Check, AlertCircle, PartyPopper } from 'lucide-react';
import { differenceInCalendarWeeks, startOfWeek, endOfWeek, isWithinInterval, addWeeks, parseISO, format } from 'date-fns';
import { getDay } from 'date-fns';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CurrentPlanWidgetProps {
  plan: LearningPlan;
  submissions: Submission[];
  onEditClick: () => void;
  onStartRecommended: () => void;
  questionsMap: Map<string, Question>;
}

export default function CurrentPlanWidget({ plan, submissions, onEditClick, onStartRecommended, questionsMap }: CurrentPlanWidgetProps) {
  const today = new Date();
  
  // Firestore Timestamp를 JavaScript Date 객체로 변환
  const planCreatedAt = plan.createdAt.toDate();
  
  const currentWeekIndex = differenceInCalendarWeeks(today, planCreatedAt, { weekStartsOn: 1 });
  const currentWeeklyPlan = plan.weeklyPlans[currentWeekIndex];

  if (!currentWeeklyPlan) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-blue-500 mb-8">
        <h2 className="text-xl font-bold mb-2">현재 학습 계획</h2>
        <p className="text-gray-500">이번 주 학습 계획이 없습니다. <br /> 계획을 수정하거나 새로 만들어보세요!</p>
        <button onClick={onEditClick} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">계획 수정하기</button>
      </div>
    );
  }

  const { sessionsPerWeek, targetChapterIds } = currentWeeklyPlan;
  
  // 이번 주에 완료된 학습 세션 수를 계산
  const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // 학습 계획에 부합하는 제출 기록인지 확인하는 헬퍼 함수
  const isTargetSubmission = (submission: Submission, planWeekIndex: number) => {
    const weeklyPlan = plan.weeklyPlans[planWeekIndex];
    if (!weeklyPlan || !weeklyPlan.targetChapterIds) return false;
    
    // 제출 기록의 모든 문제 ID를 순회하며 해당 문제의 mainChapter가 계획에 포함되는지 확인
    return submission.questionIds.some(qId => {
        const question = questionsMap.get(qId);
        return question && weeklyPlan.targetChapterIds.includes(question.mainChapter);
    });
  };

  // 이번 주에 제때 완료된 세션 수 계산
  const onTimeSessions = submissions.filter(s => {
    const submissionDate = s.createdAt && typeof s.createdAt.toDate === 'function' ? s.createdAt.toDate() : null;
    if (!submissionDate) return false;
    const submissionWeekIndex = differenceInCalendarWeeks(submissionDate, planCreatedAt, { weekStartsOn: 1 });

    return submissionWeekIndex === currentWeekIndex && isTargetSubmission(s, submissionWeekIndex);
  }).length;

  // 총 목표 세션 수 계산
  const totalTargetSessions = plan.weeklyPlans
    .slice(0, currentWeekIndex + 1)
    .reduce((sum, wp) => sum + wp.sessionsPerWeek, 0);

  // 총 완료된 세션 수 계산
  const totalCompletedSessions = submissions.filter(s => {
    const submissionDate = s.createdAt && typeof s.createdAt.toDate === 'function' ? s.createdAt.toDate() : null;
    if (!submissionDate) return false;
    const submissionWeekIndex = differenceInCalendarWeeks(submissionDate, planCreatedAt, { weekStartsOn: 1 });

    return isTargetSubmission(s, submissionWeekIndex);
  }).length;
  
  const totalOverdueSessions = Math.max(0, totalTargetSessions - totalCompletedSessions);
  const completedOverdueSessions = Math.max(0, totalCompletedSessions - onTimeSessions);
  
  const sessionCheckboxes = Array.from({ length: sessionsPerWeek }, (_, i) => ({
    id: i,
    isCompleted: i < onTimeSessions,
  }));

  return (
    <section className="bg-white p-6 rounded-2xl shadow-md border-t-4 border-blue-500 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {format(currentWeekStart, 'MM.dd')} - {format(currentWeekEnd, 'MM.dd')} 학습 계획
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            목표: 주 {sessionsPerWeek}회 학습
          </p>
        </div>
        <button 
          onClick={onEditClick} 
          className="text-blue-500 hover:text-blue-600 font-semibold text-sm"
        >
          계획 수정
        </button>
      </div>
      
      <div className="flex justify-center items-center mb-6">
        {sessionCheckboxes.map(item => (
          <div key={item.id} className="relative w-12 h-12 flex-shrink-0 mx-2">
            <motion.div
              className={`w-full h-full rounded-full flex items-center justify-center border-4
                ${item.isCompleted ? 'bg-blue-500 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {item.isCompleted && <Check size={24} className="text-white" />}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {totalOverdueSessions > 0 && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <p>밀린 학습이 <strong className="font-bold">{totalOverdueSessions}회</strong> 있어요! 힘내세요!</p>
          </div>
        )}
        {onTimeSessions >= sessionsPerWeek && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <PartyPopper size={18} />
            <p>이번 주 목표 달성! <strong className="font-bold">정말 잘했어요!</strong></p>
          </div>
        )}
      </div>
      
      {/* 새로운 UI 추가 */}
      <div className="text-center text-sm text-gray-600 mb-6">
        <p>총 {totalTargetSessions}회 목표 중 {totalCompletedSessions}회 완료</p>
        {completedOverdueSessions > 0 && (
          <p className="text-xs text-blue-500 mt-1">이전에 밀린 학습 {completedOverdueSessions}회를 보충했어요!</p>
        )}
      </div>

      <button 
        onClick={onStartRecommended} 
        className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
      >
        추천 학습 시작하기
      </button>
    </section>
  );
}