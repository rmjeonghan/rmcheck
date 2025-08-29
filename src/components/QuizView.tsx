// src/components/QuizView.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

type QuizViewProps = {
  questions: any[];
  onQuizComplete: (answers: (number | null)[]) => void;
};

export default function QuizView({ questions, onQuizComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [direction, setDirection] = useState(1);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (choiceIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setUserAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setDirection(1);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const questionVariants = {
    enter: (direction: number) => ({
      y: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      y: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (!currentQuestion) {
    return <div>문제를 불러오는 데 실패했습니다.</div>;
  }

  const choicesWithIdk = [...currentQuestion.choices, '모르겠음'];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-slate-50 w-full flex flex-col items-center justify-center p-4 overflow-hidden">
      
      <motion.button
        onClick={goToPrev}
        disabled={currentQuestionIndex === 0}
        className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white disabled:opacity-0 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ArrowLeft className="text-gray-700" size={24} />
      </motion.button>

      {currentQuestionIndex < questions.length - 1 && (
         <motion.button
            onClick={goToNext}
            className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 z-20 bg-white/70 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowRight className="text-gray-700" size={24} />
          </motion.button>
      )}

      <div className="w-full max-w-xl flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-500 mb-1">
            <span>Progress</span>
            <span>{currentQuestionIndex + 1} / {questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-blue-500 h-2.5 rounded-full"
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className="relative h-[550px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={questionVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              // ▼▼▼ 핵심 수정: 카드 자체에 스크롤 기능을 부여합니다 ▼▼▼
              className="absolute inset-0 bg-white rounded-2xl shadow-xl p-6 md:p-8 overflow-y-auto"
            >
              {/* ▼▼▼ 핵심 수정: 글자 크기를 줄입니다 ▼▼▼ */}
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 leading-relaxed whitespace-pre-wrap">
                <span className="text-blue-500 mr-2">Q{currentQuestionIndex + 1}.</span>
                {currentQuestion.questionText}
              </h2>

              <div className="space-y-3">
                {choicesWithIdk.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 text-base md:text-lg transition-all duration-200
                      ${userAnswers[currentQuestionIndex] === index 
                        ? 'bg-blue-500 border-blue-600 text-white font-bold' 
                        : 'bg-white hover:bg-blue-50 hover:border-blue-300'}`
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {index + 1}. {choice}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {currentQuestionIndex === questions.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <button 
              onClick={() => onQuizComplete(userAnswers)}
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg shadow-green-200 hover:bg-green-600 flex items-center gap-2"
            >
              <CheckCircle size={20} />
              제출하기
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}