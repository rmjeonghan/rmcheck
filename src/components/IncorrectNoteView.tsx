// src/components/IncorrectNoteView.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

// IncorrectNote 컴포넌트는 오답 문제 하나를 보여주는 역할을 할 수 있습니다.
// 여기서는 간단하게 목록을 표시합니다.
interface IncorrectNoteViewProps {
  questions: any[]; // Assuming 'any' for now, but better to define a Question type
}

export default function IncorrectNoteView({ questions }: IncorrectNoteViewProps) {
  if (!questions || questions.length === 0) { // Add a check for 'questions' being null or undefined
    return <p className="text-center text-gray-500 py-16">틀린 문제가 없습니다. 완벽해요! ✨</p>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => {
        // Add checks before accessing nested properties
        const correctAnswer = (q && q.choices && typeof q.answerIndex === 'number' && q.choices[q.answerIndex] !== undefined)
          ? q.choices[q.answerIndex]
          : '정답 정보를 찾을 수 없습니다.'; // Fallback for missing data

        return (
          <motion.div 
            key={q.id || index}
            className="bg-slate-50 p-4 rounded-xl shadow-sm border border-slate-100" // Added subtle border/shadow for better definition
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <p className="font-semibold text-gray-800 mb-1">{q.questionText || '문제 내용을 찾을 수 없습니다.'}</p> {/* Fallback for questionText */}
            <p className="text-sm text-green-600 mt-2">정답: **{correctAnswer}**</p> {/* Display the safely determined correct answer */}
          </motion.div>
        );
      })}
    </div>
  );
}