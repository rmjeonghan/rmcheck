// src/components/ResultsView.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Lottie from 'lottie-react';
import confettiAnimation from '@/data/confetti.json';
import { Submission, Question, User } from '@/types'; // User 타입 추가
import { CheckCircle, XCircle, Home } from 'lucide-react';
import IncorrectAnswer from './IncorrectAnswer';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// --- ▼ 1. Props 인터페이스에서 academyName 제거 ---
interface ResultsViewProps {
  submission: Submission;
  questions: Question[];
  onExit: () => void;
  assignmentId?: string;
}

const ResultsView = ({ submission, questions, onExit, assignmentId }: ResultsViewProps) => {
  const { user } = useAuth();
  const [showResults, setShowResults] = useState(false);
  
  const correctCount = submission.answers.filter((ans, i) => ans === questions[i].answerIndex).length;
  const incorrectCount = questions.length - correctCount;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const saveAssignmentResult = async () => {
      // --- ▼ 2. user 객체에서 직접 academyName을 가져옵니다. ---
      const academyName = (user as User)?.academyName;
      
      if (assignmentId && user && academyName) {
        try {
          const docId = `${user.uid}_${assignmentId}`;
          const studentAssignmentRef = doc(db, 'studentAssignments', docId);
          await setDoc(studentAssignmentRef, {
            studentId: user.uid,
            assignmentId: assignmentId,
            academyName: academyName,
            isCompleted: true,
            completedAt: serverTimestamp(),
            score: score,
          });
          console.log('과제 결과가 성공적으로 저장되었습니다.');
        } catch (error) {
          console.error("과제 결과 저장 중 오류 발생:", error);
        }
      }
    };

    saveAssignmentResult();
  // --- ▼ 3. useEffect 의존성 배열에서 academyName 제거 ---
  }, [assignmentId, user, score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showResults) {
      const animation = animate(count, score, {
        duration: 1.5,
        ease: "easeOut",
      });
      return animation.stop;
    }
  }, [showResults, score, count]);

  const incorrectSubmissions = submission.answers
    .map((userAnswerIndex, questionIndex) => ({
      question: questions[questionIndex],
      userAnswerIndex,
    }))
    .filter(item => item.userAnswerIndex !== item.question.answerIndex);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 overflow-hidden">
      {!showResults ? (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold text-slate-700">결과를 채점하고 있어요...</h1>
        </motion.div>
      ) : (
        <>
          <Lottie animationData={confettiAnimation} loop={false} className="absolute top-0 left-0 w-full h-full" />
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg text-center z-10"
          >
            <h1 className="text-3xl font-bold text-slate-800 mb-2">수고하셨습니다!</h1>
            <p className="text-slate-500 mb-8">오늘의 학습 결과예요.</p>
            
            <div className="text-7xl font-bold text-indigo-600 mb-6 flex items-center justify-center">
              <motion.p>{rounded}</motion.p>
              <span className="text-4xl text-slate-500 pt-5">%</span>
            </div>
            <div className="flex justify-around mb-8 text-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="font-semibold">{correctCount}개 정답</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-6 h-6 text-red-500" />
                <span className="font-semibold">{incorrectCount}개 오답</span>
              </div>
            </div>

            {incorrectSubmissions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 text-left">오답 다시보기</h2>
                <div className="space-y-4 max-h-[50vh] overflow-y-auto p-1">
                  {incorrectSubmissions.map((item, index) => (
                    <IncorrectAnswer
                      key={item.question.id || index}
                      question={item.question}
                      userAnswerIndex={item.userAnswerIndex}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <motion.button
                onClick={onExit}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 bg-white text-slate-700 font-bold rounded-lg shadow-md border"
              >
                <Home className="w-5 h-5 mr-2" />
                대시보드로 돌아가기
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default ResultsView;