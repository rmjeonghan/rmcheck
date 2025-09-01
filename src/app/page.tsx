// src/app/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import LoadingSpinner from "@/components/LoadingSpinner";
import QuizView from "@/components/QuizView";
import { AnimatePresence } from "framer-motion";
import ResultsView from "@/components/ResultsView";
import { Question, Submission } from "@/types";

export type QuizStartParams = {
  mode: 'new' | 'new_review' | 'review_all' | 'review_incorrect';
  questionCount: number;
  unitIds: string[];
  mainChapter?: string;
};

// --- 📍 1. 결과 화면을 위한 상태(State) 타입 정의 ---
export type ResultsState = {
    submission: Submission;
    questions: Question[];
} | null;

export default function Home() {
  const { user, loading } = useAuth();
  const [quizStartParams, setQuizStartParams] = useState<QuizStartParams | null>(null);
  // --- 📍 2. 결과 화면 상태(State) 추가 ---
  const [resultsState, setResultsState] = useState<ResultsState>(null);

  const startQuiz = (params: QuizStartParams) => {
    setQuizStartParams(params);
    setResultsState(null); // 새 퀴즈 시작 시 이전 결과 초기화
  };

  // --- 📍 3. 퀴즈가 끝나면 호출될 함수 ---
  const showResults = (submission: Submission, questions: Question[]) => {
    setQuizStartParams(null); // 퀴즈 상태는 비우고
    setResultsState({ submission, questions }); // 결과 상태를 채움
  };

  // --- 📍 4. 모든 세션(퀴즈/결과)을 끝내고 대시보드로 돌아가는 함수 ---
  const endSession = () => {
    setQuizStartParams(null);
    setResultsState(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {!user ? (
          <Login key="login" />
        ) : quizStartParams ? (
          <QuizView
            key="quiz"
            mode={quizStartParams.mode}
            questionCount={quizStartParams.questionCount}
            unitIds={quizStartParams.unitIds}
            mainChapter={quizStartParams.mainChapter}
            onQuizComplete={showResults} // 결과 화면을 보여주는 함수 전달
            onExit={endSession}
          />
        ) : resultsState ? (
          // --- 📍 5. 결과 상태가 있으면 ResultsView를 보여줌 ---
          <ResultsView
            key="results"
            submission={resultsState.submission}
            questions={resultsState.questions}
            onExit={endSession} // 대시보드로 돌아가는 함수 전달
          />
        ) : (
          <Dashboard key="dashboard" onStartQuiz={startQuiz} />
        )}
      </AnimatePresence>
    </main>
  );
}