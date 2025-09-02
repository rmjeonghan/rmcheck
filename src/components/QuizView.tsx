// src/components/QuizView.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Submission, QuizMode, User } from '@/types';
import QuizHeader from './QuizHeader';
import QuestionCard from './QuestionCard';
import { useQuiz } from '@/hooks/useQuiz';
import LoadingSpinner from './LoadingSpinner';
import { doc, collection, serverTimestamp, runTransaction, DocumentReference, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';

// --- ▼ 1. Props 인터페이스 수정 ---
interface QuizViewProps {
  mode: QuizMode;
  questionCount: number;
  unitIds: string[];
  mainChapter?: string;
  assignmentId?: string; // 과제 ID를 받도록 추가
  onExit: () => void;
  // onQuizComplete 타입에 assignmentId를 받을 수 있도록 수정
  onQuizComplete: (submission: Submission, questions: Question[], assignmentId?: string) => void;
}

const questionVariants = {
    enter: { y: 300, opacity: 0, scale: 0.95 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -300, opacity: 0, scale: 0.95 },
};

// --- ▼ 2. 컴포넌트 시그니처 수정 ---
const QuizView = ({ mode, questionCount, unitIds, mainChapter, assignmentId, onExit, onQuizComplete }: QuizViewProps) => {
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

  // --- ▼ 3. handleSubmit 로직 수정 ---
  const handleSubmit = async (finalAnswers: (number | null)[]) => {
      if (!user || isSubmitting) return;
      setIsSubmitting(true);

      const correctAnswers = finalAnswers.filter((answer, index) => questions[index].answerIndex === answer).length;
      const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

      // 만약 assignmentId가 있다면, 이것은 학원 과제입니다.
      // submissions 컬렉션에 저장하지 않고 바로 onQuizComplete를 호출합니다.
      if (assignmentId) {
          // Submission 객체의 기본 형태를 만들어 전달합니다.
          // ResultsView에서 id 없이도 처리가 가능하므로 id는 임시값 또는 undefined로 둡니다.
          const submissionResult: Submission = {
              id: '', // 임시 ID
              userId: user.uid,
              questionIds: questions.map(q => q.id),
              answers: finalAnswers,
              score,
              mainChapter: mainChapter || '종합',
              createdAt: Timestamp.now(), // new Date()로 임시 타임스탬프 생성
              isDeleted: false,
          };
          onQuizComplete(submissionResult, questions, assignmentId);
          setIsSubmitting(false); // isSubmitting 상태를 풀어줍니다.
          return; // 여기서 함수 실행을 종료합니다.
      }

      // assignmentId가 없는 경우 (자율 학습), 기존 로직을 그대로 수행합니다.
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
              const statRefs = questions.map(q => 
                  doc(db, 'userQuestionStats', `${user.uid}_${q.id}`)
              );
              const statDocs = await Promise.all(
                  statRefs.map(ref => transaction.get(ref))
              );

              const submissionRef = doc(collection(db, 'submissions'));
              submissionId = submissionRef.id;
              transaction.set(submissionRef, submissionData);

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
          onExit();
      } finally {
          setIsSubmitting(false);
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