// src/components/QuizView.tsx
'use client';

import { useState } from 'react';

type QuizViewProps = {
  questions: any[];
  onQuizComplete: (answers: (number | null)[]) => void; // 퀴즈 완료 시 호출될 함수
};

export default function QuizView({ questions, onQuizComplete }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 사용자의 답변을 저장할 배열, null로 초기화
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );

  const currentQuestion = questions[currentQuestionIndex];

  // 답변 선택 시 호출될 함수
  const handleAnswerSelect = (choiceIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setUserAnswers(newAnswers);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return <div>문제를 불러오는 데 실패했습니다.</div>;
  }
  
  // 현재 문제의 선택지 + '모르겠음' 옵션
  const choicesWithIdk = [...currentQuestion.choices, '모르겠음'];

  return (
    <div>
      {/* 진행 상태 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">문제 {currentQuestionIndex + 1}</h2>
        <span className="font-semibold">{currentQuestionIndex + 1} / {questions.length}</span>
      </div>
      
      <div className="p-6 bg-gray-50 rounded-lg mb-6">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {currentQuestion.questionText}
        </p>
      </div>

      {/* 선택지 목록 */}
      <div className="space-y-3">
        {choicesWithIdk.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={`w-full text-left p-4 rounded-lg border text-lg transition-colors
              ${userAnswers[currentQuestionIndex] === index 
                ? 'bg-primary border-primary text-white' 
                : 'bg-white hover:bg-gray-50'}`
            }
          >
            {index + 1}. {choice}
          </button>
        ))}
      </div>

      {/* 이전/다음/제출 버튼 */}
      <div className="mt-8 flex justify-between">
        <button 
          onClick={goToPrev}
          disabled={currentQuestionIndex === 0}
          className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          이전
        </button>
        {currentQuestionIndex < questions.length - 1 ? (
          <button 
            onClick={goToNext}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover"
          >
            다음
          </button>
        ) : (
          <button 
            onClick={() => onQuizComplete(userAnswers)}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            제출하기
          </button>
        )}
      </div>
    </div>
  );
}