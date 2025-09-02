// src/components/IncorrectAnswer.tsx
import { Question } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

interface IncorrectAnswerProps {
  question: Question;
  userAnswerIndex: number | null;
}

const IncorrectAnswer = ({ question, userAnswerIndex }: IncorrectAnswerProps) => {
  const correctAnswer = question.choices[question.answerIndex];
  const userAnswer = userAnswerIndex !== null ? question.choices[userAnswerIndex] : "선택 안 함";

  return (
    <div className="text-left p-4 border border-slate-200 rounded-lg bg-white/50 w-full">
      {/* --- 📍 1. 문제 텍스트를 여기에 추가합니다 --- */}
      <p className="font-bold text-slate-800 mb-3">{question.questionText}</p>
      
      {/* 내가 고른 답 (오답) */}
      <div className="flex items-start p-2 mb-2 bg-red-50/80 border border-red-200 rounded-md">
        <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-red-700 text-sm">나의 답</span>
          <p className="text-slate-700">{userAnswer}</p>
        </div>
      </div>
      
      {/* 정답 */}
      <div className="flex items-start p-2 mb-4 bg-green-50/80 border border-green-200 rounded-md">
        <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-green-800 text-sm">정답</span>
          <p className="text-slate-700">{correctAnswer}</p>
        </div>
      </div>
      
      {/* 해설 */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="font-semibold text-slate-600">해설</p>
        <p className="text-slate-600 mt-1 text-sm whitespace-pre-wrap">{question.explanation}</p>
      </div>
    </div>
  );
};

export default IncorrectAnswer;