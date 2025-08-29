// src/components/AchievementBadges.tsx
import React from 'react';
import { Trophy, Star, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Submission } from '@/types'; // Submission 타입을 불러와서 활용할 수 있습니다.

interface AchievementBadgesProps {
  submissions: Submission[]; // 사용자의 제출 기록을 통해 성과를 계산할 수 있습니다.
}

// 예시 배지 데이터
const allBadges = [
  { id: 'first_quiz', name: '첫걸음', description: '첫 퀴즈 완료', icon: <Star size={24} />, threshold: 1, type: 'quizCount', achieved: false },
  { id: 'seven_day_streak', name: '열정 학습가', description: '7일 연속 학습 달성', icon: <Zap size={24} />, threshold: 7, type: 'streak', achieved: false },
  { id: 'master_beginner', name: '초보 마스터', description: '총 100문제 해결', icon: <Trophy size={24} />, threshold: 100, type: 'totalQuestions', achieved: false },
  { id: 'perfect_score', name: '만점의 기쁨', description: '100점 퀴즈 1회 달성', icon: <Target size={24} />, threshold: 1, type: 'perfectScore', achieved: false },
  // 더 많은 배지 추가 가능
];

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ submissions }) => {
  // 실제 배지 달성 여부 계산 로직 (임시)
  const calculateAchievements = (subs: Submission[]) => {
    const achievedBadges = allBadges.map(badge => {
      let isAchieved = false;
      if (badge.type === 'quizCount') {
        isAchieved = subs.length >= badge.threshold;
      } else if (badge.type === 'streak') {
        // 실제 스트릭 데이터는 useMyPageData에서 가져와야 함. 여기서는 임시로 처리
        isAchieved = Math.random() > 0.5; // 임시
      } else if (badge.type === 'totalQuestions') {
        const totalQuestionsAnswered = subs.reduce((acc, sub) => acc + sub.questionIds.length, 0);
        isAchieved = totalQuestionsAnswered >= badge.threshold;
      } else if (badge.type === 'perfectScore') {
        isAchieved = subs.some(sub => sub.score === 100);
      }
      return { ...badge, achieved: isAchieved };
    });
    return achievedBadges;
  };

  const achievements = calculateAchievements(submissions);

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">나의 도전 과제</h2>
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
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
        {achievements.map((badge) => (
          <motion.div 
            key={badge.id} 
            className={`relative p-4 rounded-xl shadow-sm text-center 
              ${badge.achieved ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-500 opacity-70'}`
            }
            variants={badgeVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full mb-3 
              ${badge.achieved ? 'bg-white bg-opacity-70 text-yellow-600' : 'bg-gray-300'}`
            }>
              {badge.icon}
            </div>
            <h4 className="font-semibold text-base mb-1">{badge.name}</h4>
            <p className="text-xs">{badge.description}</p>
            {badge.achieved && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-2 right-2 text-green-600 text-sm"
              >
                ✓
              </motion.span>
            )}
          </motion.div>
        ))}
      </motion.div>
      {achievements.filter(b => b.achieved).length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          아직 달성한 도전 과제가 없습니다. 학습을 시작하고 첫 배지를 획득해보세요! 🚀
        </p>
      )}
    </div>
  );
};

export default AchievementBadges;