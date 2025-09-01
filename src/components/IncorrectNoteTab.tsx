// src/components/IncorrectNoteTab.tsx
"use client";
import { useMemo } from 'react';

const IncorrectNoteTab = ({ submissions, questions }: any) => {
  const incorrectQuestions = useMemo(() => {
    const incorrectMap = new Map();
    submissions.forEach((sub: any) => {
      sub.questionIds.forEach((qId: string, index: number) => {
        const question = questions.get(qId);
        const userAnswer = sub.answers[index];
        if (question && question.answerIndex !== userAnswer) {
          incorrectMap.set(qId, question);
        }
      });
    });
    return Array.from(incorrectMap.values());
  }, [submissions, questions]);

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
              <p key={choiceIndex} className={`p-2 rounded-md ${q.answerIndex === choiceIndex ? 'bg-green-100 font-semibold' : ''}`}>
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