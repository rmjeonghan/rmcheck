// src/components/AchievementsTab.tsx
"use client";

import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Zap, ShieldCheck } from 'lucide-react';

// 도전 과제 목록 정의
const ALL_ACHIEVEMENTS = [
  { id: 'first_step', name: '첫걸음', description: '첫 학습 완료하기', icon: Star, goal: 1 },
  { id: 'consistent_3', name: '작심삼일 극복', description: '3회 학습 완료하기', icon: Zap, goal: 3 },
  { id: 'perfect_score', name: '완벽주의자', description: '100점 달성하기', icon: Award, goal: 100 },
  { id: 'high_flyer', name: '고득점 행진', description: '평균 90점 이상 달성하기', icon: TrendingUp, goal: 90 },
  { id: 'master', name: '과학 마스터', description: '총 10회 학습 완료', icon: ShieldCheck, goal: 10 },
];

const AchievementsTab = ({ stats, submissions }: any) => {

  const checkAchievement = (id: string) => {
    switch (id) {
      case 'first_step':
        return stats.totalSubmissions >= 1;
      case 'consistent_3':
        return stats.totalSubmissions >= 3;
      case 'perfect_score':
        return submissions.some((sub: any) => sub.score === 100);
      case 'high_flyer':
        return stats.averageScore >= 90;
      case 'master':
        return stats.totalSubmissions >= 10;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6">🏆 나의 도전 과제</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_ACHIEVEMENTS.map((ach, index) => {
          const isUnlocked = checkAchievement(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border-2 text-center transition-all duration-300 ${
                isUnlocked ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <motion.div
                animate={{ scale: isUnlocked ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  isUnlocked ? 'bg-yellow-400' : 'bg-slate-200'
                }`}
              >
                <ach.icon size={32} className={isUnlocked ? 'text-white' : 'text-slate-400'} />
              </motion.div>
              <h3 className="font-bold text-lg">{ach.name}</h3>
              <p className="text-sm text-slate-500">{ach.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsTab;