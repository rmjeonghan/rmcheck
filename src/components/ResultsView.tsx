// src/components/ResultsView.tsx
'use client';

import { motion } from 'framer-motion';
import { Award, RefreshCw, XCircle, CheckCircle, HelpCircle } from 'lucide-react';

type ResultsViewProps = {
  questions: any[];
  userAnswers: (number | null)[];
  onRestart: () => void;
};

// 점수에 따라 다른 메시지를 보여주는 함수
const getResultMessage = (score: number) => {
  if (score === 100) return { text: "완벽해요! 모든 문제를 맞혔어요!", color: "text-green-500" };
  if (score >= 80) return { text: "훌륭해요! 정말 잘했어요!", color: "text-blue-500" };
  if (score >= 60) return { text: "좋아요! 조금만 더 힘내요!", color: "text-yellow-500" };
  return { text: "아쉬워요, 하지만 괜찮아요!", color: "text-red-500" };
};

export default function ResultsView({ questions, userAnswers, onRestart }: ResultsViewProps) {
  let correctCount = 0;
  questions.forEach((q, index) => {
    if (q.answerIndex === userAnswers[index]) {
      correctCount++;
    }
  });
  const score = Math.round((correctCount / questions.length) * 100);
  const incorrectQuestions = questions.filter((q, i) => q.answerIndex !== userAnswers[i]);
  const resultMessage = getResultMessage(score);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* 결과 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-xl text-center p-8 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
          >
            <Award className={`mx-auto ${resultMessage.color}`} size={48} />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">퀴즈 결과</h2>
          
          <motion.p 
            className="text-7xl font-bold my-4 text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {score}<span className="text-4xl text-gray-500">점</span>
          </motion.p>

          <p className={`text-lg font-semibold ${resultMessage.color} mb-2`}>
            {resultMessage.text}
          </p>
          <p className="text-gray-600">
            총 {questions.length}문제 중 <strong className="text-blue-500">{correctCount}문제</strong>를 맞혔습니다.
          </p>
          <motion.button
            onClick={onRestart}
            className="mt-8 w-full max-w-xs mx-auto bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={20} />
            <span>처음으로 돌아가기</span>
          </motion.button>
        </div>

        {/* 틀린 문제 다시보기 (오답노트) */}
        {incorrectQuestions.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">다시 풀어보기</h3>
            <div className="space-y-4">
              {incorrectQuestions.map((q, index) => (
                <motion.div 
                  key={q.id || index} 
                  className="bg-white p-5 border rounded-xl shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <p className="font-bold text-gray-800 whitespace-pre-wrap mb-4">
                    {q.questionText}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-red-600">
                      <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">내 답변: </span>
                        {userAnswers[questions.indexOf(q)] !== null && userAnswers[questions.indexOf(q)]! < q.choices.length 
                          ? q.choices[userAnswers[questions.indexOf(q)]!] 
                          : "모르겠음 또는 선택 안 함"}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-green-600">
                      <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">정답: </span>
                        {q.choices[q.answerIndex]}
                      </div>
                    </div>
                  </div>
                  
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-500 flex items-center gap-1">
                      <HelpCircle size={16} />
                      해설 보기
                    </summary>
                    <p className="mt-2 p-3 bg-slate-50 rounded-lg text-gray-700 text-sm leading-relaxed">
                      {q.explanation}
                    </p>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}