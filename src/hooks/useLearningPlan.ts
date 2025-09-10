// src/hooks/useLearningPlan.ts

import { useState, useEffect } from 'react';
// ▼▼▼ 여기에 onSnapshot을 추가하여 import 오류를 해결합니다. ▼▼▼
import { Timestamp, doc, getDoc, setDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { LearningPlan, WeeklyPlan, QuizMode } from '@/types';
import { differenceInWeeks, startOfDay, getDay } from 'date-fns';

export const getKSTThursday = (): string => {
  // KST(UTC+9) 기준으로 이번 주(일~토)의 목요일 날짜 YYYY-MM-DD
  const now = new Date();

  // 현재 로컬시간 → KST 시각으로 보정한 타임스탬프
  const kstShiftMinutes = 540 + now.getTimezoneOffset(); // 540 = 9*60
  const tsKST = now.getTime() + kstShiftMinutes * 60_000;

  // "KST로 해석되는" Date 객체 (UTC 게터를 쓰면 KST의 달력값을 얻을 수 있음)
  const kstDate = new Date(tsKST);

  // 일(0)~토(6)에서 목요일 인덱스는 4
  const dow = kstDate.getUTCDay(); // KST 요일
  const deltaToThu = 4 - dow;

  // 이번 주 목요일의 KST 달력 날짜
  const thuKST = new Date(tsKST);
  thuKST.setUTCDate(thuKST.getUTCDate() + deltaToThu);

  // YYYY-MM-DD 문자열로 포맷
  const y = thuKST.getUTCFullYear();
  const m = String(thuKST.getUTCMonth() + 1).padStart(2, "0");
  const d = String(thuKST.getUTCDate()).padStart(2, "0");
  const kstThursday = `${y}-${m}-${d}`;
  return kstThursday;
}

export const useLearningPlan = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [hasLearningPlan, setHasLearningPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const planRef = doc(db, 'learningPlans', user.uid);
    // onSnapshot을 사용하여 실시간으로 학습 계획을 감지합니다.
    const unsubscribe = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        const planData = { id: docSnap.id, ...docSnap.data() } as LearningPlan;
        setPlan(planData);
        setHasLearningPlan(true);
      } else {
        setPlan(null);
        setHasLearningPlan(false);
      }
      setIsLoading(false);
    }, (e) => {
      console.error("학습 계획 실시간 조회 오류:", e);
      setError("학습 계획을 불러오는 데 실패했습니다.");
      setIsLoading(false);
    });

    return () => unsubscribe(); // 컴포넌트가 언마운트될 때 실시간 리스너를 정리합니다.
  }, [user]);

  const savePlan = async (weeklyPlan: WeeklyPlan) => {
    if (!user) {
      setError("로그인 후 이용 가능합니다.");
      return;
    }
    setIsLoading(true);
    // weeklyPlan에 progress, reviewProgress 초기값 추가
    weeklyPlan.progress = [];
    weeklyPlan.reviewProgress = 0;
    try {
      const planRef = doc(db, 'learningPlans', user.uid);
      const docSnap = await getDoc(planRef);
      
      const newPlanData: Partial<LearningPlan> = {
        userId: user.uid,
        weeklyPlans: { [weeklyPlan.week]: weeklyPlan },
        updatedAt: serverTimestamp(),
      };

      // 문서가 존재하지 않을 때만 createdAt, progress 등의 초기값을 설정합니다.
      if (!docSnap.exists()) {
        newPlanData.createdAt = serverTimestamp();
      }

      await setDoc(planRef, newPlanData, { merge: true });
      // 저장이 성공하면 onSnapshot이 자동으로 상태를 업데이트하므로 여기서 setPlan을 호출할 필요가 없습니다.
    } catch (e) {
      console.error("학습 계획 저장 오류:", e);
      setError("학습 계획 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const trackSession = async (quizMode: QuizMode) => {
    if (!user || !plan || !plan.createdAt) return;

    // createdAt이 Timestamp 객체인지 확인 후 Date 객체로 변환
    const planStartDate = (plan.createdAt instanceof Timestamp)
      ? startOfDay(plan.createdAt.toDate())
      : startOfDay(new Date());
    const today = startOfDay(new Date());
    const currentDayIndex = getDay(today);

    const isReview = quizMode === 'review_all' || quizMode === 'review_incorrect';

    try {
      const planRef = doc(db, 'learningPlans', user.uid);
      
      if (isReview) {
        const currentReviewCount = plan.weeklyPlans[getKSTThursday()].reviewProgress || 0;
        await updateDoc(planRef, {
          [`weeklyPlans.${getKSTThursday()}.reviewProgress`]: currentReviewCount + 1,
        });
      } else {
        const weekProgress = plan.weeklyPlans[getKSTThursday()].progress || [];
        if (!weekProgress.includes(currentDayIndex)) {
            weekProgress.push(currentDayIndex);
            await updateDoc(planRef, {
                [`weeklyPlans.${getKSTThursday()}.progress`]: weekProgress,
            });
        }
      }
    } catch (error) {
        console.error("학습 진행도 업데이트 오류:", error);
    }
  };

  return { plan, hasLearningPlan, savePlan, trackSession, isLoading, error };
};

