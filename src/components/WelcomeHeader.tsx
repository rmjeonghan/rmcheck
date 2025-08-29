// src/components/WelcomeHeader.tsx
import { motion } from 'framer-motion';
import { Sparkles, Flame } from 'lucide-react';

interface WelcomeHeaderProps {
  name: string;
  streakCount: number;
}

export default function WelcomeHeader({ name, streakCount }: WelcomeHeaderProps) {
  return (
    <motion.header 
      className="flex justify-between items-start mb-8"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
          <span>안녕하세요, {name}님!</span>
          <Sparkles className="text-yellow-400" size={32} />
        </h1>
        <p className="text-gray-500 mt-2">
          오늘도 당신의 성장을 응원합니다.
        </p>
      </div>
      {streakCount > 0 && (
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <span className="text-orange-500 font-bold text-lg">{streakCount}일 연속</span>
          <Flame className="text-orange-500" size={24} />
        </div>
      )}
    </motion.header>
  );
}