// src/hooks/useMyPageData.ts
import { useState, useEffect, useMemo } from 'react';
import { Timestamp, collection, query, where, doc, getDoc, getDocs, documentId, orderBy } from 'firebase/firestore';
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

        // 1. 학생 문서에서 userSubmissions 배열 가져오기
        const studentRef = doc(db, 'students', user.uid);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          setSubmissions([]);
          setQuestions(new Map());
          return;
        }

        const userSubmissions: string[] = studentSnap.data().userSubmissions || [];

        if (userSubmissions.length === 0) {
          setSubmissions([]);
          setQuestions(new Map());
          return;
        }

        // 2. submissions 문서들 가져오기 (30개씩 쪼개기)
        const fetchedSubs: Submission[] = [];
        for (let i = 0; i < userSubmissions.length; i += 30) {
          const chunk = userSubmissions.slice(i, i + 30);
          const subQuery = query(collection(db, 'submissions'), where(documentId(), 'in', chunk));
          const subSnapshot = await getDocs(subQuery);
          subSnapshot.forEach(doc => {
            fetchedSubs.push({ id: doc.id, ...doc.data() } as Submission);
          });
        }

        // createdAt 기준 정렬 (최신순)
        fetchedSubs.sort((a, b) => {
          const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        });

        setSubmissions(fetchedSubs);

        // 3. 제출 기록에 포함된 모든 문제 정보 가져오기
        const questionIds = [...new Set(fetchedSubs.flatMap(s => s.questionIds))];
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
      .map(s => {
        // createdAt이 Timestamp 인스턴스일 때만 toDate()를 호출합니다.
        const date = (s.createdAt instanceof Timestamp)
          ? s.createdAt.toDate().toLocaleDateString()
          : "날짜 정보 없음"; // 혹시 모를 예외 상황을 대비한 기본값

    return { date, score: s.score };
  })
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