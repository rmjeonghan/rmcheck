// src/components/PreviousHistory.tsx
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const PreviousHistory = ({ submissions, questions }: any) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!submissions || submissions.length === 0) {
    return <div className="text-center py-10 text-slate-500">아직 학습 기록이 없어요.</div>;
  }

  return (
    <div className="space-y-4">
      {submissions.map((sub: any) => (
        <div key={sub.id} className="bg-white rounded-xl shadow-md overflow-hidden">
          <button
            onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <div>
              <p className="font-semibold">{sub.mainChapter}</p>
              <p className="text-sm text-slate-500">
                {format(sub.createdAt.toDate(), 'yyyy년 M월 d일 HH:mm', { locale: ko })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`font-bold text-lg ${sub.score > 80 ? 'text-green-500' : 'text-red-500'}`}>
                {sub.score}점
              </span>
              <motion.div animate={{ rotate: expandedId === sub.id ? 180 : 0 }}>
                <ChevronDown />
              </motion.div>
            </div>
          </button>
          
          <AnimatePresence>
            {expandedId === sub.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t bg-slate-50 space-y-4">
                  {sub.questionIds.map((qId: string, index: number) => {
                    const question = questions.get(qId);
                    const userAnswer = sub.answers[index];
                    const isCorrect = question?.answerIndex === userAnswer;

                    if (!question) return <div key={index}>문제를 불러올 수 없습니다.</div>;

                    return (
                      <div key={qId} className="p-4 bg-white rounded-lg">
                        <p className="font-semibold mb-2">{index + 1}. {question.questionText}</p>
                        {question.choices.map((choice: string, choiceIndex: number) => (
                          <div key={choiceIndex} className={`flex items-center p-2 rounded-md
                            ${question.answerIndex === choiceIndex ? 'bg-green-100' : ''}
                            ${userAnswer === choiceIndex && !isCorrect ? 'bg-red-100' : ''}
                          `}>
                            {question.answerIndex === choiceIndex && <Check className="w-5 h-5 text-green-600 mr-2"/>}
                            {userAnswer === choiceIndex && !isCorrect && <X className="w-5 h-5 text-red-600 mr-2"/>}
                            <span className="flex-1">{choice}</span>
                          </div>
                        ))}
                         <p className="mt-2 text-sm text-slate-600 bg-gray-100 p-2 rounded-md">
                          <strong>해설:</strong> {question.explanation || "해설이 없습니다."}
                         </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default PreviousHistory;