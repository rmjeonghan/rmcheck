// src/app/page.tsx

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import LoadingSpinner from "@/components/LoadingSpinner";
import QuizView from "@/components/QuizView";
import { AnimatePresence } from "framer-motion";
import ResultsView from "@/components/ResultsView";
import { Question, Submission, User, QuizMode } from "@/types";
import { useLearningPlan } from "@/hooks/useLearningPlan"; // --- ▼ 1. 달성률 추적을 위해 import 추가 ---
import Footer from "@/components/Footer";

// --- ▼ 1. 수정된 부분: assignmentId 추가 ---
export type QuizStartParams = {
  mode: QuizMode;
  questionCount: number;
  unitIds: string[];
  mainChapter?: string;
  assignmentId?: string; // 과제 ID를 전달하기 위한 필드
};

export type ResultsState = {
    submission: Submission;
    questions: Question[];
    // --- ▼ 2. 수정된 부분: assignmentId와 academyName 추가 ---
    assignmentId?: string;
} | null;


export default function Home() {
  const { user, loading } = useAuth();
  const [quizStartParams, setQuizStartParams] = useState<QuizStartParams | null>(null);
  const [resultsState, setResultsState] = useState<ResultsState>(null);
  const { trackSession } = useLearningPlan(); // --- ▼ 2. useLearningPlan 훅에서 trackSession 함수 가져오기 ---

  const startQuiz = (params: QuizStartParams) => {
    setQuizStartParams(params);
    setResultsState(null);
  }

  // --- ▼ 3. 수정된 부분: assignmentId와 academyName을 받도록 수정 ---
  const showResults = (submission: Submission, questions: Question[], assignmentId?: string) => {
    if (quizStartParams) { // --- ▼ 3. 퀴즈 완료 시, 현재 퀴즈 모드로 학습 진행도 기록 ---
      trackSession(quizStartParams.mode);
    }
    setQuizStartParams(null);
    setResultsState({ submission, questions, assignmentId }); // 결과 상태에 assignmentId와 academyName 포함
  };

  const endSession = () => {
    setQuizStartParams(null);
    setResultsState(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow"> {/* --- ▼ 3. main 태그에 flex-grow를 추가합니다. --- */}
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
              assignmentId={quizStartParams.assignmentId}
              onQuizComplete={showResults} 
              onExit={endSession}
            />
          ) : resultsState ? (
            <ResultsView
              key="results"
              submission={resultsState.submission}
              questions={resultsState.questions}
              assignmentId={resultsState.assignmentId}
              onExit={endSession}
            />
          ) : (
            <Dashboard key="dashboard" onStartQuiz={startQuiz} />
          )}
        </AnimatePresence>
      </main>
      <Footer /> {/* --- ▼ 4. main 태그 바깥, 최하단에 Footer 컴포넌트를 추가합니다. --- */}
    </div>
  );
}

