// src/hooks/useMyPageData.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, where, getDocs, documentId, orderBy, DocumentData } from 'firebase/firestore';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
// ▼▼▼ 글로벌 타입을 import 합니다. ▼▼▼
import { Submission, Question } from '@/types'; 

// ---👇 로컬 타입 정의를 삭제합니다. ---
/*
interface FirestoreSubmission { ... }
export interface Submission extends FirestoreSubmission { ... }
export interface Question { ... }
*/

export interface MyPageData {
  submissions: Submission[];
  incorrectQuestions: any[];
  totalAnsweredCount: number;
  totalIncorrectCount: number;
  studyStreak: number;
  strongestChapter: string | null;
  weakestChapter: string | null;
  loading: boolean;
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
        // ---👇 가져온 데이터에 글로벌 Submission 타입을 명시해줍니다. ---
        const originalSubmissions = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));

        const allQuestionIds = [...new Set(originalSubmissions.flatMap(s => s.questionIds || []))];
        
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
                        answerIndex: data.answerIndex,
                        subChapter: data.subChapter,
                        mainChapter: data.mainChapter
                    });
                });
            }
        }
        
        const processedSubmissions: Submission[] = originalSubmissions.map(s => {
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

        // ( ... 나머지 로직은 동일 ... )
        const allIncorrectIds = [...new Set(processedSubmissions.flatMap(s => (s.questionIds || []).filter((id, index) => !s.isCorrect?.[index])))];
        const incorrectQuestionsData = Array.from(questionsMap.values()).filter(q => allIncorrectIds.includes(q.id));
        
        const submissionDates = [...new Set(processedSubmissions.map(s => format(s.createdAt.toDate(), 'yyyy-MM-dd')))].sort().reverse();
        let streak = 0;
        if (submissionDates.length > 0) {
            const today = new Date();
            const lastDate = parseISO(submissionDates[0]);
            if (differenceInCalendarDays(today, lastDate) <= 1) {
                streak = 1;
                for (let i = 0; i < submissionDates.length - 1; i++) {
                    const current = parseISO(submissionDates[i]);
                    const previous = parseISO(submissionDates[i + 1]);
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
        
        setData({
          submissions: processedSubmissions,
          incorrectQuestions: incorrectQuestionsData,
          totalAnsweredCount: allQuestionIds.length,
          totalIncorrectCount: allIncorrectIds.length,
          studyStreak: streak,
          strongestChapter: strongest,
          weakestChapter: weakest,
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