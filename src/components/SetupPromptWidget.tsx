// src/components/SetupPromptWidget.tsx
'use client';
import { motion } from 'framer-motion';

type Props = {
  onSetupClick: () => void;
};

export default function SetupPromptWidget({ onSetupClick }: Props) {
  return (
    <motion.div 
      className="bg-slate-100 p-8 rounded-lg mb-8 text-center"
      whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
    >
      <h2 className="text-2xl font-bold text-slate-800">
        가장 먼저, 학습 계획을 세워볼까요?
      </h2>
      <p className="text-slate-500 my-2">
        체계적인 계획은 꾸준한 성장의 첫걸음입니다.
      </p>
      <motion.button
        onClick={onSetupClick}
        className="mt-4 bg-slate-800 text-white font-bold py-3 px-6 rounded-full shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        내 학습 계획 만들기
      </motion.button>
    </motion.div>
  );
}