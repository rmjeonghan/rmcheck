// src/hooks/useMyPageData.ts
"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Timestamp,
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  documentId,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Submission, Question } from '@/types';

export const useMyPageData = () => {
  // ✅ null-safe 처리
  const auth = useAuth();
  const user = auth?.user ?? null;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Map<string, Question>>(new Map());
  const [userQuestionStats, setUserQuestionStats] = useState({});
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

        // 2. submissions 문서들 가져오기
        const fetchedSubs: Submission[] = [];
        if (userSubmissions.length > 0) {
          const subQuery = query(
            collection(db, 'submissions'),
            where(documentId(), 'in', userSubmissions)
          );
          const subSnapshot = await getDocs(subQuery);
          subSnapshot.forEach((doc) => {
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
        const questionIds = [...new Set(fetchedSubs.flatMap((s) => s.questionIds))];
        if (questionIds.length > 0) {
          const questionsMap = new Map<string, Question>();
          const qQuery = query(collection(db, 'questionBank'), where(documentId(), 'in', questionIds));
          const qSnapshot = await getDocs(qQuery);
          qSnapshot.forEach((doc) => {
            questionsMap.set(doc.id, { id: doc.id, ...doc.data() } as Question);
          });
          setQuestions(questionsMap);
        }

        // 4. userQuestionStats 문서 가져오기 - 오답노트용
        const userStatsRef = doc(db, 'userQuestionStats', `stats_${user.uid}`);
        const userStatsSnap = await getDoc(userStatsRef);
        if (userStatsSnap.exists()) {
          setUserQuestionStats(userStatsSnap.data().stats);
        }
      } catch (e) {
        console.error('마이페이지 데이터 조회 오류:', e);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // 5. 통계 및 분석 자료 가공
  const { stats, analysisData } = useMemo(() => {
    if (submissions.length === 0 || questions.size === 0) {
      return {
        stats: { totalSubmissions: 0, totalProblems: 0, averageScore: 0 },
        analysisData: { scoreTrend: [], chapterPerformance: {} },
      };
    }

    const totalSubmissions = submissions.length;
    const totalProblems = submissions.reduce((acc, s) => acc + s.questionIds.length, 0);
    const totalScore = submissions.reduce((acc, s) => acc + s.score, 0);
    const averageScore = Math.round(totalScore / totalSubmissions);

    const scoreTrend = submissions
      .map((s) => {
        const date =
          s.createdAt instanceof Timestamp
            ? s.createdAt.toDate().toLocaleDateString()
            : '날짜 정보 없음';
        return { date, score: s.score };
      })
      .reverse();

    const chapterPerformance: { [key: string]: { correct: number; total: number } } = {};
    // TODO: 학습 분석 상세 로직

    return {
      stats: { totalSubmissions, totalProblems, averageScore },
      analysisData: { scoreTrend, chapterPerformance },
    };
  }, [submissions, questions]);

  return { stats, analysisData, submissions, questions, userQuestionStats, loading, error };
};
