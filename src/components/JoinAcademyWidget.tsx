// src/components/JoinAcademyWidget.tsx
'use client';
import { motion } from 'framer-motion';

type Props = {
  onJoinClick: () => void;
};

export default function JoinAcademyWidget({ onJoinClick }: Props) {
  return (
    <motion.div 
      className="bg-slate-100 border-2 border-dashed border-slate-300 p-8 rounded-lg mb-8 text-center"
      whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
    >
      <h3 className="text-xl font-bold text-slate-700">
        소속된 학원이 있으신가요?
      </h3>
      <p className="text-slate-500 my-2">
        학원에 가입하고 선생님이 내주는 과제를 관리해보세요.
      </p>
      <motion.button
        onClick={onJoinClick}
        className="mt-4 bg-slate-800 text-white font-bold py-3 px-6 rounded-full"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        학원 코드로 가입하기
      </motion.button>
    </motion.div>
  );
}