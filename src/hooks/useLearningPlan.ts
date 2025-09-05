// src/hooks/useLearningPlan.ts

import { useState, useEffect } from 'react';
// ▼▼▼ 여기에 onSnapshot을 추가하여 import 오류를 해결합니다. ▼▼▼
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { LearningPlan, WeeklyPlan, QuizMode } from '@/types';
import { differenceInWeeks, startOfDay, getDay } from 'date-fns';

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

  const savePlan = async (weeklyPlans: WeeklyPlan[]) => {
    if (!user) {
      setError("로그인 후 이용 가능합니다.");
      return;
    }
    setIsLoading(true);
    try {
      const planRef = doc(db, 'learningPlans', user.uid);
      const docSnap = await getDoc(planRef);
      
      const newPlanData: Partial<LearningPlan> = {
        userId: user.uid,
        weeklyPlans,
        updatedAt: serverTimestamp(),
      };

      // 문서가 존재하지 않을 때만 createdAt, progress 등의 초기값을 설정합니다.
      if (!docSnap.exists()) {
        newPlanData.createdAt = serverTimestamp();
        newPlanData.progress = {};
        newPlanData.reviewProgress = {};
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
    const planStartDate = (plan.createdAt && typeof plan.createdAt.toDate === 'function')
      ? startOfDay(plan.createdAt.toDate())
      : startOfDay(new Date());
    
    const today = startOfDay(new Date());
    const currentWeekNumber = differenceInWeeks(today, planStartDate) + 1;
    const currentDayIndex = getDay(today);

    const isReview = quizMode === 'review_all' || quizMode === 'review_incorrect';

    try {
      const planRef = doc(db, 'learningPlans', user.uid);
      
      if (isReview) {
        const currentReviewCount = plan.reviewProgress?.[currentWeekNumber] || 0;
        await updateDoc(planRef, {
          [`reviewProgress.${currentWeekNumber}`]: currentReviewCount + 1,
        });
      } else {
        const weekProgress = plan.progress?.[currentWeekNumber] || [];
        if (!weekProgress.includes(currentDayIndex)) {
            weekProgress.push(currentDayIndex);
            await updateDoc(planRef, {
                [`progress.${currentWeekNumber}`]: weekProgress,
            });
        }
      }
    } catch (error) {
        console.error("학습 진행도 업데이트 오류:", error);
    }
  };

  return { plan, hasLearningPlan, savePlan, trackSession, isLoading, error };
};

