// src/components/ActionButtons.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles, Layers, History, Star } from 'lucide-react';

type QuizMode = 'new' | 'mixed' | 'review_all' | 'review_incorrect';

type ActionButtonsProps = {
  recommendedMode: 'new' | 'mixed';
  onStartNewQuiz: () => void;
  onStartMixedQuiz: () => void;
  onStartReview: () => void;
};

export default function ActionButtons({
  recommendedMode,
  onStartNewQuiz,
  onStartMixedQuiz,
  onStartReview,
}: ActionButtonsProps) {

  const buttons = [
    {
      id: 'new',
      icon: <Sparkles size={24} />,
      title: '신규 문항',
      description: '새로운 문제를 풀어보세요',
      onClick: onStartNewQuiz,
    },
    {
      id: 'mixed',
      icon: <Layers size={24} />,
      title: '신규+복습',
      description: '복습과 새 문제를 함께',
      onClick: onStartMixedQuiz,
    },
    {
      id: 'review_all', // 자유복습은 review_all 모드와 연결
      icon: <History size={24} />,
      title: '자유 복습',
      description: '틀렸던 문제를 다시 풀어요',
      onClick: onStartReview,
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">바로 학습 시작</h3>
      <div className="space-y-3">
        {buttons.map((btn) => {
          const isRecommended = btn.id === recommendedMode;
          return (
            <motion.button
              key={btn.id}
              onClick={btn.onClick}
              className={`relative w-full flex items-center p-4 rounded-xl text-left transition-all duration-300 transform
                ${isRecommended 
                  ? 'bg-blue-500 text-white shadow-blue-200 shadow-lg' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {isRecommended && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white text-blue-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  <Star size={12} fill="currentColor" />
                  <span>추천</span>
                </div>
              )}
              <div className={`mr-4 p-2 rounded-lg ${isRecommended ? 'bg-blue-400' : 'bg-white'}`}>
                {btn.icon}
              </div>
              <div>
                <p className="font-bold">{btn.title}</p>
                <p className={`text-sm ${isRecommended ? 'text-blue-100' : 'text-gray-500'}`}>{btn.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}