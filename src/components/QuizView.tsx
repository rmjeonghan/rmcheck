// src/components/QuizView.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Submission, QuizMode } from '@/types';
import QuizHeader from './QuizHeader';
import QuestionCard from './QuestionCard';
import { useQuiz } from '@/hooks/useQuiz';
import LoadingSpinner from './LoadingSpinner';
// --- 📍 1. Firestore 트랜잭션 관련 타입(DocumentReference, DocumentSnapshot)을 추가로 import 합니다 ---
import { doc, collection, serverTimestamp, runTransaction, DocumentReference, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';

interface QuizViewProps {
  mode: QuizMode;
  questionCount: number;
  unitIds: string[];
  mainChapter?: string;
  onExit: () => void;
  onQuizComplete: (submission: Submission, questions: Question[]) => void;
}

const questionVariants = {
    enter: { y: 300, opacity: 0, scale: 0.95 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -300, opacity: 0, scale: 0.95 },
};

const QuizView = ({ mode, questionCount, unitIds, mainChapter, onExit, onQuizComplete }: QuizViewProps) => {
  const { user } = useAuth();
  const { questions, isLoading, error, fetchQuestions } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questions.length > 0) {
      setUserAnswers(Array(questions.length).fill(null));
    }
  }, [questions]);
  
  useEffect(() => {
    fetchQuestions(mode, questionCount, unitIds);
  }, [mode, questionCount, unitIds, fetchQuestions]);

  const handleNextQuestion = (choiceIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setUserAnswers(newAnswers);

    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    setTimeout(() => {
      if (isLastQuestion) {
        handleSubmit(newAnswers);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 1200);
  };

  // --- 📍 2. handleSubmit 함수를 트랜잭션 읽기/쓰기 순서 오류만 수정한 새 로직으로 교체합니다 ---
  const handleSubmit = async (finalAnswers: (number | null)[]) => {
      if (!user || isSubmitting) return;
      setIsSubmitting(true);

      const correctAnswers = finalAnswers.filter((answer, index) => questions[index].answerIndex === answer).length;
      const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

      const submissionData: Omit<Submission, 'id'> = {
          userId: user.uid,
          questionIds: questions.map(q => q.id),
          answers: finalAnswers,
          score,
          mainChapter: mainChapter || '종합',
          createdAt: serverTimestamp(),
          isDeleted: false,
      };

      try {
          let submissionId = '';
          await runTransaction(db, async (transaction) => {
              // --- STEP 1: 모든 읽기(get) 작업을 먼저 수행합니다 ---
              const statRefs = questions.map(q => 
                  doc(db, 'userQuestionStats', `${user.uid}_${q.id}`)
              );
              // Promise.all을 사용해 모든 문서를 한 번에 읽어옵니다.
              const statDocs = await Promise.all(
                  statRefs.map(ref => transaction.get(ref))
              );

              // --- STEP 2: 모든 쓰기(set, update) 작업을 이후에 수행합니다 ---
              // 2-1. submission 생성
              const submissionRef = doc(collection(db, 'submissions'));
              submissionId = submissionRef.id;
              transaction.set(submissionRef, submissionData);

              // 2-2. userQuestionStats 업데이트 (미리 읽어온 데이터를 사용)
              questions.forEach((q, i) => {
                  const userAnswer = finalAnswers[i];
                  const isCorrect = q.answerIndex === userAnswer;
                  
                  const statRef = statRefs[i];
                  const statDoc = statDocs[i];

                  if (statDoc.exists()) {
                      const oldHistory = statDoc.data().history || [];
                      transaction.update(statRef, {
                          history: [...oldHistory, isCorrect],
                          isCorrect: isCorrect,
                          lastAnswered: serverTimestamp(),
                      });
                  } else {
                      transaction.set(statRef, {
                          userId: user.uid,
                          questionId: q.id,
                          history: [isCorrect],
                          isCorrect: isCorrect,
                          lastAnswered: serverTimestamp(),
                      });
                  }
              });
          });
          
          onQuizComplete({ id: submissionId, ...submissionData } as Submission, questions);

      } catch (error) {
          console.error("결과 저장 오류:", error);
          onExit(); // 오류가 발생해도 대시보드로 돌아가도록 처리
      } finally {
          setIsSubmitting(false); // 로직이 끝나면 isSubmitting 상태를 false로 변경
      }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500 p-8 text-center">{error}</div>;
  if (questions.length === 0 && !isLoading) return <div className="flex items-center justify-center min-h-screen text-slate-500">생성된 문제가 없습니다.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 w-full overflow-hidden">
        <QuizHeader current={currentQuestionIndex + 1} total={questions.length} onExit={onExit} />
        
        <main className="relative flex-grow w-full flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    variants={questionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ y: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="w-full max-w-2xl"
                >
                    <QuestionCard
                        question={currentQuestion}
                        onAnswerSelect={handleNextQuestion}
                    />
                </motion.div>
            </AnimatePresence>
        </main>
    </div>
  );
};

export default QuizView;