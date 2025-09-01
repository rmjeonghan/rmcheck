// src/components/QuestionCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/types';
import { Check, X } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (choiceIndex: number) => void;
}

const QuestionCard = ({ question, onAnswerSelect }: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const isAnswered = selectedAnswer !== null;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    onAnswerSelect(index);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-white hover:bg-blue-50 border-slate-200";
    }
    if (index === question.answerIndex) {
      return "bg-green-100 border-green-400 scale-105"; // 정답
    }
    if (index === selectedAnswer) {
      return "bg-red-100 border-red-400"; // 선택한 오답
    }
    return "bg-slate-100 text-slate-500 border-slate-200 opacity-80"; // 선택 안된 나머지
  };

  return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          {/* --- 📍 subChapterName을 표시하도록 수정 --- */}
          <p className="text-sm text-indigo-500 font-semibold mb-2">
              {question.subChapter || `단원: ${question.unitId}`}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold mb-8 min-h-[90px] leading-relaxed">
              {question.questionText}
            </h2>
      <div className="space-y-3">
        {question.choices.map((choice, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={isAnswered}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 text-left transition-all duration-300 ${getButtonClass(index)}`}
            whileHover={!isAnswered ? { y: -2 } : {}}
          >
            <span className="font-semibold text-base">{choice}</span>
            {isAnswered && index === question.answerIndex && <motion.div initial={{scale:0}} animate={{scale:1}}><Check className="text-green-600" /></motion.div>}
            {isAnswered && index === selectedAnswer && index !== question.answerIndex && <motion.div initial={{scale:0}} animate={{scale:1}}><X className="text-red-600" /></motion.div>}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;