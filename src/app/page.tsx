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
import { Question, Submission, User } from "@/types";

// --- ▼ 1. 수정된 부분: assignmentId 추가 ---
export type QuizStartParams = {
  mode: 'new' | 'new_review' | 'review_all' | 'review_incorrect';
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

  const startQuiz = (params: QuizStartParams) => {
    setQuizStartParams(params);
    setResultsState(null); 
  };

  // --- ▼ 3. 수정된 부분: assignmentId와 academyName을 받도록 수정 ---
  const showResults = (submission: Submission, questions: Question[], assignmentId?: string) => {
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
            assignmentId={quizStartParams.assignmentId} // QuizView에 assignmentId 전달
            onQuizComplete={showResults} 
            onExit={endSession}
          />
        ) : resultsState ? (
          <ResultsView
            key="results"
            submission={resultsState.submission}
            questions={resultsState.questions}
            assignmentId={resultsState.assignmentId} // ResultsView에 assignmentId 전달
            onExit={endSession}
          />
        ) : (
          <Dashboard key="dashboard" onStartQuiz={startQuiz} />
        )}
      </AnimatePresence>
    </main>
  );
}