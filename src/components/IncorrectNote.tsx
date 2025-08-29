// src/components/IncorrectNote.tsx
'use client';

export default function IncorrectNote({ questions }: { questions: any[] }) {
  if (questions.length === 0) {
    return <p className="text-gray-500">틀린 문제가 없습니다. 완벽해요!</p>;
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.id} className="p-4 border rounded-lg bg-white">
          <p className="font-semibold whitespace-pre-wrap">{q.questionText}</p>
          <p className="text-sm mt-2 text-green-600">
            정답: {q.choices[q.answerIndex]}
          </p>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-gray-500">해설 보기</summary>
            <p className="mt-1 p-2 bg-gray-50 rounded">{q.explanation}</p>
          </details>
        </div>
      ))}
    </div>
  );
}