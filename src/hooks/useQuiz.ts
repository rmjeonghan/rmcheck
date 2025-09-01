// src/hooks/useQuiz.ts
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Question, QuizMode } from '@/types'; // --- 📍 1. 여기서 QuizMode를 import 합니다 ---
import { generateExam } from '@/firebase/config';
import { HttpsCallableResult } from 'firebase/functions';

// --- 📍 2. 훅 내부에 있던 별도의 타입 정의를 제거합니다 ---

export const useQuiz = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (
    mode: QuizMode, // --- 📍 3. import한 QuizMode 타입을 사용합니다 ---
    questionCount: number,
    unitIds: string[] = []
  ) => {
    if (!user) {
      setError("사용자 인증 정보가 없습니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);

    try {
            const result: HttpsCallableResult = await generateExam({ mode, questionCount, unitIds });
            const data = result.data as { questions: Question[], status?: string, message?: string };

            if (data.status === 'NO_INCORRECT') {
                toast.success(data.message || '틀린 문제가 없습니다!');
                setQuestions([]); // 퀴즈 뷰에 "생성된 문제가 없습니다"가 뜨도록
            } else if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
            } else {
                setError("조건에 맞는 문제가 없습니다.");
            }
        } catch (err: any) {
            setError(err.message || "시험지 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    return { questions, isLoading, error, fetchQuestions };
};