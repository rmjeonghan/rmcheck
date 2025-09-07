// src/components/IncorrectNoteTab.tsx
"use client";
import { useMemo } from 'react';

const IncorrectNoteTab = ({ submissions, questions, userQuestionStats }: any) => {
  const incorrectQuestions = useMemo(() => {
    const incorrectMap = new Map();
    Object.entries(userQuestionStats || {}).forEach(([qId, stats]: any) => {
      if (stats.latestResult === "X" && questions.has(qId)) {
        const _q = { ...questions.get(qId) }; // copy
        _q.userAnswer = stats.latestAnswer; // userAnswer추가
        incorrectMap.set(qId, _q);
      }
    });
    return Array.from(incorrectMap.values());
  }, [submissions, questions, userQuestionStats]);

  if (incorrectQuestions.length === 0) {
    return <div className="text-center py-10 text-slate-500">틀린 문제가 없어요. 완벽해요! ✨</div>;
  }

  return (
    <div className="space-y-4">
      {incorrectQuestions.map((q: any, index: number) => (
        <div key={q.id} className="bg-white p-4 rounded-xl shadow-md">
          <p className="font-bold mb-2">{index + 1}. {q.questionText}</p>
          <div className="space-y-1 mb-2">
            {q.choices.map((choice: string, choiceIndex: number) => (
              <p key={choiceIndex} className={`p-2 rounded-md ${q.answerIndex === choiceIndex ? 'bg-green-100 font-semibold' : (q.userAnswer === choiceIndex ? 'bg-red-100 font-semibold' : '')}`}>
                {choice}
              </p>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-600 bg-gray-100 p-2 rounded-md">
            <strong>해설:</strong> {q.explanation || "해설이 없습니다."}
          </p>
        </div>
      ))}
    </div>
  );
};

export default IncorrectNoteTab;