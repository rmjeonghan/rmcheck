// src/components/DashboardWidgets.tsx
import React from 'react';
import { TrendingUp, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardWidgetsProps {
  studyStreak: number;
  totalAnsweredCount: number;
  // 여기에 추가적으로 학습 계획, 목표 달성률 등의 데이터를 받을 수 있습니다.
  // 예를 들어: learningPlan: LearningPlan | null; progress: number;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ 
  studyStreak, 
  totalAnsweredCount 
}) => {
  // 임시 목표 데이터 (실제로는 학습 계획 등에서 가져와야 함)
  const dailyGoal = 30; // 일일 목표 문제 수
  const todayAnswered = 15; // 오늘 푼 문제 수 (가정)
  const todayProgress = Math.min(Math.round((todayAnswered / dailyGoal) * 100), 100);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {/* 스트릭 위젯 */}
      <motion.div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl shadow-md flex items-center" variants={cardVariants}>
        <Award size={36} className="mr-4 opacity-70" />
        <div>
          <h3 className="text-xl font-semibold mb-1">학습 스트릭</h3>
          <p className="text-3xl font-bold">{studyStreak}일 연속 학습! 🎉</p>
        </div>
      </motion.div>

      {/* 총 문제 해결 수 위젯 */}
      <motion.div className="bg-white p-6 rounded-xl shadow-md flex items-center" variants={cardVariants}>
        <BookOpen size={36} className="mr-4 text-blue-500" />
        <div>
          <h3 className="text-xl font-semibold mb-1 text-gray-800">총 해결 문제</h3>
          <p className="text-3xl font-bold text-gray-900">{totalAnsweredCount}개</p>
        </div>
      </motion.div>

      {/* 오늘 학습 목표 진행률 위젯 */}
      <motion.div className="bg-white p-6 rounded-xl shadow-md flex-grow" variants={cardVariants}>
        <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
          <TrendingUp size={24} className="mr-2 text-green-500" />
          오늘 학습 목표
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className="bg-green-500 h-3 rounded-full" 
            style={{ width: `${todayProgress}%` }}
          ></div>
        </div>
        <p className="text-gray-600 text-sm">{todayAnswered} / {dailyGoal} 문제 ({todayProgress}%)</p>
      </motion.div>

      {/* 여기에 추가적인 위젯들을 넣을 수 있습니다. (예: 주간 학습 시간, 가장 많이 틀린 유형 등) */}
    </motion.div>
  );
};

export default DashboardWidgets;