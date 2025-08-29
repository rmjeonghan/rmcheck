// src/components/IncorrectNoteView.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

// IncorrectNote 컴포넌트는 오답 문제 하나를 보여주는 역할을 할 수 있습니다.
// 여기서는 간단하게 목록을 표시합니다.
interface IncorrectNoteViewProps {
  questions: any[];
}

export default function IncorrectNoteView({ questions }: IncorrectNoteViewProps) {
  if (questions.length === 0) {
    return <p className="text-center text-gray-500 py-16">틀린 문제가 없습니다. 완벽해요!</p>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <motion.div 
          key={q.id || index}
          className="bg-slate-50 p-4 rounded-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <p className="font-semibold text-gray-800">{q.questionText}</p>
          <p className="text-sm text-green-600 mt-2">정답: {q.choices[q.answerIndex]}</p>
        </motion.div>
      ))}
    </div>
  );
}