// src/app/my-page/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMyPageData } from '@/hooks/useMyPageData';
import Dashboard from '@/components/Dashboard';
import WeaknessAnalysis from '@/components/WeaknessAnalysis';
import LearningPlanSetup from '@/components/LearningPlanSetup';
import CurrentPlanWidget from '@/components/CurrentPlanWidget';
import SetupPromptWidget from '@/components/SetupPromptWidget';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// --- 타입 정의 (홈 화면과 동일하게 개편) ---
interface WeeklyPlan {
  week: number;
  sessionsPerWeek: number;
  studyDays: number[];
  unitIds: string[];
  unitNames: string[];
}

interface LearningPlan {
  startDate: Date | Timestamp;
  weeklyPlans: WeeklyPlan[];
  userId: string;
  status: 'active' | 'inactive';
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export default function MyPage() {
  const { user } = useAuth();
  const { submissions, loading: dataLoading } = useMyPageData();
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsPlanLoading(false);
      return;
    }
    const planRef = doc(db, 'learningPlans', user.uid);
    getDoc(planRef).then(docSnap => {
      if (docSnap.exists()) {
        setLearningPlan(docSnap.data() as LearningPlan);
      } else {
        setLearningPlan(null);
      }
      setIsPlanLoading(false);
    });
  }, [user]);

  // ▼▼▼ onSave prop 타입 에러 해결을 위해 plan의 타입을 object로 변경 ▼▼▼
  const handleSavePlan = async (plan: object) => {
    if (!user) return;

    // 함수 내부에서 사용할 때는 구체적인 타입으로 간주하여 사용합니다.
    const validatedPlan = plan as { startDate: Date, weeklyPlans: WeeklyPlan[] };

    const planRef = doc(db, 'learningPlans', user.uid);

    const dataToSave: { [key: string]: any } = {
      ...validatedPlan,
      userId: user.uid,
      status: 'active',
      updatedAt: serverTimestamp(),
    };
    if (!learningPlan) {
      dataToSave.createdAt = serverTimestamp();
    }
  
    await setDoc(planRef, dataToSave, { merge: true });
  
    const planForState: LearningPlan = {
      ...learningPlan,
      ...dataToSave,
      updatedAt: new Date(),
      createdAt: learningPlan?.createdAt || new Date(),
    } as LearningPlan;

    setLearningPlan(planForState);
    setIsSetupModalOpen(false);
  };

  const isLoading = dataLoading || isPlanLoading;

  if (isLoading) {
    return <div className="text-center p-8">데이터를 불러오는 중입니다...</div>;
  }
  if (!user) {
    return <div className="text-center p-8">로그인이 필요한 페이지입니다.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">학습 계획</h2>
        {learningPlan ? (
          <CurrentPlanWidget plan={learningPlan} submissions={submissions} onEditClick={() => setIsSetupModalOpen(true)} onStartRecommended={() => { /* 홈으로 이동하는 로직 추가 가능 */ }} />
        ) : (
          <SetupPromptWidget onSetupClick={() => setIsSetupModalOpen(true)} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">학습 대시보드</h2>
        <Dashboard submissions={submissions} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">단원별 약점 분석</h2>
        <WeaknessAnalysis submissions={submissions} />
      </section>

      {isSetupModalOpen && (
        <LearningPlanSetup
          onClose={() => setIsSetupModalOpen(false)}
          onSave={handleSavePlan}
          existingPlan={learningPlan}
        />
      )}
    </div>
  );
}