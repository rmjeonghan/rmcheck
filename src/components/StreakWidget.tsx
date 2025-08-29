// src/components/StreakWidget.tsx

'use client';

import { motion } from 'framer-motion';

export default function StreakWidget({ streakCount }: { streakCount: number }) {
  if (streakCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      // ---👇 텍스트가 2줄이 되므로 아이콘과 정렬이 잘 맞도록 items-center를 유지합니다. ---
      className="flex items-center space-x-2 bg-orange-100 px-3 py-1.5 rounded-full"
    >
      <span>🔥</span>
      {/* ---👇 텍스트를 div로 감싸고, 내부에서 줄바꿈(<br/>) 처리했습니다. --- */}
      <div className="text-orange-600 font-bold text-sm text-right leading-tight">
        <span>{streakCount}일 연속</span>
        <br />
        <span>학습 중!</span>
      </div>
    </motion.div>
  );
}