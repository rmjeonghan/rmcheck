// src/components/ResultsView.tsx
'use client';

type ResultsViewProps = {
  questions: any[];
  userAnswers: (number | null)[];
  onRestart: () => void; // 다시 시작 버튼을 위한 함수
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

  return (
    <div>
      {/* 결과 요약 */}
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold">퀴즈 결과</h2>
        <p className="text-6xl font-bold my-4 text-primary">{score}점</p>
        <p className="text-lg text-gray-700">
          총 {questions.length}문제 중 <span className="font-bold">{correctCount}문제</span>를 맞혔습니다.
        </p>
        <button
          onClick={onRestart}
          className="mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover"
        >
          처음으로 돌아가기
        </button>
      </div>

      {/* 틀린 문제 다시보기 */}
      {incorrectQuestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">다시 풀어보기</h3>
          <div className="space-y-4">
            {incorrectQuestions.map((q, index) => (
              <div key={q.id || index} className="p-4 border rounded-lg">
                <p className="font-semibold whitespace-pre-wrap">{q.questionText}</p>
                <p className="text-sm mt-2 text-green-600">
                  정답: {q.choices[q.answerIndex]}
                </p>
                <p className="text-sm mt-1 text-red-600">
                  내 답변: {userAnswers[questions.indexOf(q)] !== null ? q.choices[userAnswers[questions.indexOf(q)]!] : "선택 안 함"}
                </p>
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-gray-500">해설 보기</summary>
                  <p className="mt-1 p-2 bg-gray-50 rounded">{q.explanation}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}