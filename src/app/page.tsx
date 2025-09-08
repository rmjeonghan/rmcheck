// src/app/page.tsx

"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Dashboard from "@/components/Dashboard";
import Login from "@/components/Login";
import LoadingSpinner from "@/components/LoadingSpinner";
import QuizView from "@/components/QuizView";
import { AnimatePresence } from "framer-motion";
import ResultsView from "@/components/ResultsView";
import { Question, Submission, QuizMode } from "@/types";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import Footer from "@/components/Footer";

// --- ▼ assignmentId 추가 ---
export type QuizStartParams = {
  mode: QuizMode;
  questionCount: number;
  unitIds: string[];
  mainChapter?: string;
  assignmentId?: string;
};

export type ResultsState = {
  submission: Submission;
  questions: Question[];
  assignmentId?: string;
} | null;

export default function Home() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false); // ✅ 마운트 체크
  const [quizStartParams, setQuizStartParams] = useState<QuizStartParams | null>(null);
  const [resultsState, setResultsState] = useState<ResultsState>(null);
  const { trackSession } = useLearningPlan();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 빌드/SSR 시점에는 아무 것도 렌더링하지 않음
  if (!mounted) return null;

  const startQuiz = (params: QuizStartParams) => {
    console.log("Starting quiz with params:", params)
    setQuizStartParams(params);
    setResultsState(null);
  };

  const showResults = (
    submission: Submission,
    questions: Question[],
    assignmentId?: string
  ) => {
    if (quizStartParams) {
      trackSession(quizStartParams.mode);
    }
    setQuizStartParams(null);
    setResultsState({ submission, questions, assignmentId });
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
      <main className="flex-grow">
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
      <Footer />
    </div>
  );
}
