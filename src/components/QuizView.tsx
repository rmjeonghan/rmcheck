// src/components/QuizView.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Submission, QuizMode } from '@/types';
import QuizHeader from './QuizHeader';
import QuestionCard from './QuestionCard';
import { useQuiz } from '@/hooks/useQuiz';
import LoadingSpinner from './LoadingSpinner';
// addDoc을 import 목록에 추가합니다.
import { doc, collection, serverTimestamp, Timestamp, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
// curriculum.ts에서 curriculumData를 가져옵니다.
import { curriculumData } from '@/data/curriculum';

interface QuizViewProps {
    mode: QuizMode;
    questionCount: number;
    unitIds: string[];
    mainChapter?: string;
    assignmentId?: string;
    onExit: () => void;
    onQuizComplete: (submission: Submission, questions: Question[], assignmentId?: string) => void;
}

const questionVariants = {
    enter: { y: 300, opacity: 0, scale: 0.95 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -300, opacity: 0, scale: 0.95 },
};

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

    const handleSubmit = async (finalAnswers: (number | null)[]) => {
        if (!user || isSubmitting) return;
        setIsSubmitting(true);

        console.log("assignmentId:", assignmentId);

        const correctAnswers = finalAnswers.filter((answer, index) => questions[index].answerIndex === answer).length;
        const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
        console.log("finalAnswers:", finalAnswers);
        console.log("questions:", questions);

        // 유저 - 문제 최신 풀이 결과 업데이트

        try {
            const userStatsRef = doc(db, "userQuestionStats", `stats_${user.uid}`);

            // stats 전체 맵 업데이트
            const now = new Date();
            const statsUpdate: Record<string, any> = {};
            questions.forEach((q, index) => {
                const result = q.answerIndex === finalAnswers[index] ? "O" : "X";
                statsUpdate[q.id] = {
                    latestResult: result,
                    latestAnswer: finalAnswers[index],
                    answeredDatetime: now,
                };
            });

            await setDoc(
                userStatsRef,
                { stats: statsUpdate }, // stats 맵 필드 안에 저장
                { merge: true }
            );
        } catch (error) {
            console.error("❌ 업데이트 실패:", error);
        }

        // ✅ *** [추가된 부분] *** 최종 수정된 단원명 생성 로직
        const getDynamicChapterName = (): string => {
            // 1. 과제는 최우선으로 처리
            if (mainChapter) return mainChapter;

            // 2. '자유 복습' 모드('review_all', 'review_incorrect')는 "복습"으로 고정
            if (mode === 'review_all' || mode === 'review_incorrect') {
                return "복습";
            }

            // 3. '신규 문항'('new'), '신규+복습'('new_review') 모드는 대단원명 계산
            if ((mode === 'new' || mode === 'new_review') && questions.length > 0) {
                const chapterCodes = new Set<string>(
                    questions.map(q => {
                        const parts = q.unitId.split('-');
                        return `${parts[0]}-${parts[1]}`;
                    })
                );

                const chapterNames = new Set<string>();

                for (const code of chapterCodes) {
                    for (const subject in curriculumData) {
                        const foundChapter = curriculumData[subject as keyof typeof curriculumData].find(c => c.id === code);
                        if (foundChapter) {
                            chapterNames.add(foundChapter.name);
                        }
                    }
                }
                
                if (chapterNames.size > 0) {
                    return [...chapterNames].join(', ');
                }
            }
            
            // 4. 그 외 모든 예외 케이스는 '자율학습'으로 처리
            return "자율학습";
        };
        // *** [로직 끝] ***

        if (assignmentId) {
            const submissionResult: Submission = {
                id: '',
                userId: user.uid,
                questionIds: questions.map(q => q.id),
                answers: finalAnswers,
                score,
                mainChapter: getDynamicChapterName(),
                createdAt: Timestamp.now(),
                isDeleted: false,
            };
            onQuizComplete(submissionResult, questions, assignmentId);
            setIsSubmitting(false);
            return;
        }

        const submissionData: Omit<Submission, 'id'> = {
            userId: user.uid,
            questionIds: questions.map(q => q.id),
            answers: finalAnswers,
            score,
            mainChapter: getDynamicChapterName(),
            createdAt: serverTimestamp(),
            isDeleted: false,
        };

        // ▼▼▼ userQuestionStats 관련 트랜잭션 코드를 제거하고 아래 코드로 수정합니다. ▼▼▼
        try {
            // submissions 컬렉션에 submissionData를 직접 추가합니다.
            const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

            // onQuizComplete 콜백에 새로 생성된 문서의 ID와 데이터를 전달합니다.
            onQuizComplete({ id: submissionRef.id, ...submissionData } as Submission, questions);

        } catch (error) {
            console.error("결과 저장 오류:", error);
            onExit(); // 에러 발생 시 퀴즈를 종료합니다.
        } finally {
            setIsSubmitting(false);
        }
        // ▲▲▲ 여기까지 수정 ▲▲▲
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