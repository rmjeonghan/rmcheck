// src/hooks/useMyPageData.ts
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, documentId, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Submission, Question } from '@/types';

export const useMyPageData = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Map<string, Question>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. 사용자의 모든 제출 기록(submissions) 가져오기
        const subQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const subSnapshot = await getDocs(subQuery);
        const subs = subSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
        setSubmissions(subs);

        // 2. 제출 기록에 포함된 모든 문제 정보 가져오기
        const questionIds = [...new Set(subs.flatMap(s => s.questionIds))];
        if (questionIds.length > 0) {
          const questionsMap = new Map<string, Question>();
          for (let i = 0; i < questionIds.length; i += 30) {
            const chunk = questionIds.slice(i, i + 30);
            const qQuery = query(collection(db, 'questionBank'), where(documentId(), 'in', chunk));
            const qSnapshot = await getDocs(qQuery);
            qSnapshot.forEach(doc => {
              questionsMap.set(doc.id, { id: doc.id, ...doc.data() } as Question);
            });
          }
          setQuestions(questionsMap);
        }
      } catch (e) {
        console.error("마이페이지 데이터 조회 오류:", e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 3. 불러온 데이터를 기반으로 통계 및 분석 자료 가공 (useMemo로 성능 최적화)
  const { stats, analysisData } = useMemo(() => {
    if (submissions.length === 0 || questions.size === 0) {
      return { stats: { totalSubmissions: 0, totalProblems: 0, averageScore: 0 }, analysisData: { scoreTrend: [], chapterPerformance: {} } };
    }

    const totalSubmissions = submissions.length;
    const totalProblems = submissions.reduce((acc, s) => acc + s.questionIds.length, 0);
    const totalScore = submissions.reduce((acc, s) => acc + s.score, 0);
    const averageScore = Math.round(totalScore / totalSubmissions);

    const scoreTrend = submissions
      .map(s => ({
        date: s.createdAt.toDate().toLocaleDateString(),
        score: s.score,
      }))
      .reverse();

    const chapterPerformance: { [key: string]: { correct: number; total: number } } = {};
    // ... (향후 학습 분석 탭에서 사용할 상세 로직)

    return {
      stats: { totalSubmissions, totalProblems, averageScore },
      analysisData: { scoreTrend, chapterPerformance },
    };
  }, [submissions, questions]);

  return { stats, analysisData, submissions, questions, loading, error };
};