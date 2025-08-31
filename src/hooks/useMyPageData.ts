// src/hooks/useMyPageData.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, getDocs, documentId, orderBy, DocumentData, doc, getDoc } from 'firebase/firestore';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { Submission, Question, LearningPlan } from '@/types'; 

export interface MyPageData {
  submissions: (Submission & { isCorrect: boolean[] })[];
  incorrectQuestions: Question[]; 
  totalAnsweredCount: number;
  totalIncorrectCount: number;
  studyStreak: number;
  strongestChapter: string | null;
  weakestChapter: string | null;
  loading: boolean;
  plan: LearningPlan | null;
  questionsMap: Map<string, Question>;
}

export function useMyPageData(): MyPageData {
  const { user } = useAuth();
  const [data, setData] = useState<Omit<MyPageData, 'loading'>>({
    submissions: [],
    incorrectQuestions: [],
    totalAnsweredCount: 0,
    totalIncorrectCount: 0,
    studyStreak: 0,
    strongestChapter: null,
    weakestChapter: null,
    plan: null,
    questionsMap: new Map(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const submissionsQuery = query(collection(db, 'submissions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const originalSubmissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));

        // 모든 문제 ID와 오답 문제 ID를 모읍니다.
        const allQuestionIds = [...new Set(originalSubmissions.flatMap(s => s.questionIds || []))];
        const allIncorrectQuestionIdsInSubmissions = originalSubmissions.flatMap(s => s.incorrectQuestionIds || []);
        
        const questionsMap = new Map<string, Question>();
        if (allQuestionIds.length > 0) {
            for (let i = 0; i < allQuestionIds.length; i += 30) {
                const chunk = allQuestionIds.slice(i, i + 30);
                const q = query(collection(db, 'questionBank'), where(documentId(), 'in', chunk));
                const questionSnapshots = await getDocs(q);
                questionSnapshots.forEach(doc => {
                    const data = doc.data();
                    questionsMap.set(doc.id, { 
                        id: doc.id, 
                        questionText: data.questionText,
                        choices: data.choices,
                        answerIndex: data.answerIndex,
                        subChapter: data.subChapter,
                        mainChapter: data.mainChapter
                    } as Question);
                });
            }
        }
        
        const processedSubmissions = originalSubmissions.map(s => {
            const firstQuestion = s.questionIds ? questionsMap.get(s.questionIds[0]) : null;
            const isCorrectArray = (s.questionIds || []).map((qId: string, index: number) => {
                const question = questionsMap.get(qId);
                return question ? question.answerIndex === s.answers?.[index] : false;
            });

            return {
                ...s,
                mainChapter: s.mainChapter || firstQuestion?.mainChapter || '알 수 없음',
                subChapter: s.subChapter || firstQuestion?.subChapter || '혼합 학습',
                isCorrect: isCorrectArray,
            };
        });

        // 실제 오답 노트에 표시될 질문 객체들을 추출
        const uniqueIncorrectQuestionIds = [...new Set(allIncorrectQuestionIdsInSubmissions)];
        const incorrectQuestionsData = uniqueIncorrectQuestionIds
            .map(qId => questionsMap.get(qId))
            .filter((q): q is Question => q !== undefined);
        
        // createdAt 필드가 있는 데이터만 필터링하여 처리
        const submissionDates = [...new Set(originalSubmissions.filter(s => s.createdAt).map(s => format(s.createdAt.toDate(), 'yyyy-MM-dd')))].sort().reverse();
        let streak = 0;
        if (submissionDates.length > 0) {
            const today = new Date();
            const lastDate = parseISO(submissionDates[0].slice(0, 10)); // Convert to ISO format before parsing
            if (differenceInCalendarDays(today, lastDate) <= 1) {
                streak = 1;
                for (let i = 0; i < submissionDates.length - 1; i++) {
                    const current = parseISO(submissionDates[i].slice(0, 10));
                    const previous = parseISO(submissionDates[i + 1].slice(0, 10));
                    if (differenceInCalendarDays(current, previous) === 1) streak++;
                    else break;
                }
            }
        }
        
        const subChapterStats: { [key: string]: { correct: number, total: number } } = {};
        processedSubmissions.forEach(submission => {
            if (!submission.subChapter || !submission.isCorrect) return;
            if (!subChapterStats[submission.subChapter]) {
                subChapterStats[submission.subChapter] = { correct: 0, total: 0 };
            }
            subChapterStats[submission.subChapter].total += submission.isCorrect.length;
            subChapterStats[submission.subChapter].correct += submission.isCorrect.filter(Boolean).length;
        });

        const analyzableChapters = Object.entries(subChapterStats)
            .filter(([_, stats]) => stats.total >= 5)
            .map(([chapter, stats]) => ({
                name: chapter,
                rate: (stats.correct / stats.total) * 100,
            }));

        let strongest: string | null = null;
        let weakest: string | null = null;

        if (analyzableChapters.length >= 2) {
            analyzableChapters.sort((a, b) => a.rate - b.rate);
            weakest = analyzableChapters[0].name;
            strongest = analyzableChapters[analyzableChapters.length - 1].name;
        } else if (analyzableChapters.length === 1) {
            if (analyzableChapters[0].rate >= 80) strongest = analyzableChapters[0].name;
            else if (analyzableChapters[0].rate <= 60) weakest = analyzableChapters[0].name;
        }
        
        const planDocRef = doc(db, 'learningPlans', user.uid);
        const planDoc = await getDoc(planDocRef);
        const fetchedPlan = planDoc.exists() ? planDoc.data() as LearningPlan : null;
        
        setData({
          submissions: processedSubmissions as (Submission & { isCorrect: boolean[] })[],
          incorrectQuestions: incorrectQuestionsData,
          totalAnsweredCount: allQuestionIds.length,
          totalIncorrectCount: uniqueIncorrectQuestionIds.length,
          studyStreak: streak,
          strongestChapter: strongest,
          weakestChapter: weakest,
          plan: fetchedPlan,
          questionsMap: questionsMap,
        });

      } catch (error) {
        console.error("마이페이지 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { ...data, loading };
}