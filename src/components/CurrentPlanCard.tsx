// src/components/CurrentPlanCard.tsx
import { LearningPlan } from '@/types';
import { motion } from 'framer-motion';
import { Calendar, Target } from 'lucide-react';

interface CurrentPlanCardProps {
  plan: LearningPlan | null;
  onEditClick: () => void; // onEditClick prop 추가
}

export default function CurrentPlanCard({ plan, onEditClick }: CurrentPlanCardProps) {
  if (!plan) return null;

  const totalWeeks = plan.weeklyPlans.length;
  const totalSessions = plan.weeklyPlans.reduce((sum, week) => sum + week.sessionsPerWeek, 0);

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">나의 학습 계획</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-500" size={20} />
          <span className="text-gray-600">총 <strong className="text-gray-800">{totalWeeks}주</strong> 과정</span>
        </div>
        <div className="flex items-center gap-3">
          <Target className="text-green-500" size={20} />
          <span className="text-gray-600">총 <strong className="text-gray-800">{totalSessions}회</strong> 학습</span>
        </div>
      </div>
      <button 
        onClick={onEditClick} // onClick 이벤트에 연결
        className="mt-6 w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors hover:bg-gray-900"
      >
        계획 수정하기
      </button>
    </motion.div>
  );
}