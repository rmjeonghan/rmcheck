// src/components/ResultsView.tsx
"use client";

import { useEffect } from 'react'; // useState는 더 이상 필요 없습니다.
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Lottie from 'lottie-react';
import confettiAnimation from '@/data/confetti.json';
import { Submission, Question } from '@/types';
import { CheckCircle, XCircle, NotebookText, Home } from 'lucide-react';

interface ResultsViewProps {
  submission: Submission;
  questions: Question[];
  onExit: () => void;
}

const ResultsView = ({ submission, questions, onExit }: ResultsViewProps) => {
  const correctCount = submission.answers.filter((ans, i) => ans === questions[i].answerIndex).length;
  const incorrectCount = questions.length - correctCount;

  // --- 📍 1. Framer Motion의 훅을 사용하여 숫자 애니메이션을 구현합니다 ---
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    // --- 📍 2. useEffect 내에서 animate 함수를 호출합니다 ---
    const animation = animate(count, submission.score, {
      duration: 1.5,
      ease: "easeOut",
    });

    return animation.stop;
  }, [count, submission.score]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 overflow-hidden">
      <Lottie
        animationData={confettiAnimation}
        loop={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg text-center w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-slate-700 mb-2">수고하셨습니다!</h1>
        <p className="text-slate-500 mb-6">오늘의 학습 결과예요.</p>
        
        <div
          className="text-7xl font-bold text-indigo-600 mb-6"
        >
          {/* --- 📍 3. motion.p에 반올림된 값을 연결합니다 --- */}
          <motion.p>{rounded}</motion.p>
          <span className="text-4xl text-slate-500">%</span>
        </div>
        <div className="flex justify-around mb-8 text-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="font-semibold">{correctCount}개 정답</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-6 h-6 text-red-500" />
            <span className="font-semibold">{incorrectCount}개 오답</span>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center px-6 py-3 bg-slate-700 text-white font-bold rounded-lg shadow-md"
          >
            <NotebookText className="w-5 h-5 mr-2" />
            오답 노트 바로가기
          </motion.button>
          <motion.button
            onClick={onExit}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-bold rounded-lg shadow-md border"
          >
            <Home className="w-5 h-5 mr-2" />
            대시보드로 돌아가기
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsView;