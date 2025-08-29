// src/components/AnalysisView.tsx
import React from 'react';
import { BarChart2, BookOpen, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import VisualLearningStatus from './VisualLearningStatus'; // VisualLearningStatus 컴포넌트 불러오기
import { Submission } from '@/types'; // Submission 타입을 불러와야 합니다.

interface AnalysisViewProps {
  studyStreak: number;
  totalAnsweredCount: number;
  strongestChapter: { name: string; score: number } | null;
  weakestChapter: { name: string; score: number } | null;
  submissions: Submission[]; // submissions prop 추가
}

const AnalysisView: React.FC<AnalysisViewProps> = ({
  studyStreak,
  totalAnsweredCount,
  strongestChapter,
  weakestChapter,
  submissions, // submissions prop 받기
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8"
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">학습 분석 개요</h2>

      {/* VisualLearningStatus 컴포넌트 추가 */}
      <motion.div variants={cardVariants}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">나의 학습 점수 추이</h3>
        <VisualLearningStatus 
          submissions={submissions} // 주석 제거
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 총 문제 해결 수 */}
        <motion.div className="bg-white p-6 rounded-xl shadow-md flex items-center" variants={cardVariants}>
          <BookOpen size={36} className="mr-4 text-blue-500" />
          <div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">총 해결 문제</h3>
            <p className="text-3xl font-bold text-gray-900">{totalAnsweredCount}개</p>
          </div>
        </motion.div>

        {/* 가장 강한 단원 */}
        <motion.div className="bg-white p-6 rounded-xl shadow-md flex items-center" variants={cardVariants}>
          <TrendingUp size={36} className="mr-4 text-green-500" />
          <div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">가장 강한 단원</h3>
            <p className="text-2xl font-bold text-gray-900">
              {strongestChapter ? `${strongestChapter.name} (${strongestChapter.score}점)` : '데이터 부족'}
            </p>
          </div>
        </motion.div>

        {/* 가장 약한 단원 */}
        <motion.div className="bg-white p-6 rounded-xl shadow-md flex items-center" variants={cardVariants}>
          <TrendingDown size={36} className="mr-4 text-red-500" />
          <div>
            <h3 className="text-xl font-semibold mb-1 text-gray-800">가장 약한 단원</h3>
            <p className="text-2xl font-bold text-gray-900">
              {weakestChapter ? `${weakestChapter.name} (${weakestChapter.score}점)` : '데이터 부족'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* 여기에 추가적인 분석 차트나 내용을 넣을 수 있습니다. */}
    </motion.div>
  );
};

export default AnalysisView;