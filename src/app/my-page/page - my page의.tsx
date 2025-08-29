// src/app/my-page/page.tsx
'use client';

// useMemo는 더 이상 필요 없으므로 제거해도 됩니다.
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMyPageData } from '@/hooks/useMyPageData';
import Dashboard from '@/components/Dashboard';
import WeaknessAnalysis from '@/components/WeaknessAnalysis';
import LearningPlanSetup from '@/components/LearningPlanSetup';
import CurrentPlanWidget from '@/components/CurrentPlanWidget';
import SetupPromptWidget from '@/components/SetupPromptWidget';
import { db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function MyPage() {
  const { user } = useAuth();
  // ---👇 useMyPageData가 반환하는 submissions는 이미 완벽하게 가공된 상태입니다. ---
  const { submissions, loading: dataLoading } = useMyPageData();
  const [learningPlan, setLearningPlan] = useState<any | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // ---👇 useMemo를 사용한 데이터 변환 로직을 전부 삭제합니다. ---
  // const submissionsForAnalysis: ... = useMemo(() => { ... });

  useEffect(() => {
    if (!user) {
      setIsPlanLoading(false);
      return;
    }
    const planRef = doc(db, 'learningPlans', user.uid);
    getDoc(planRef).then(docSnap => {
      if (docSnap.exists()) {
        setLearningPlan(docSnap.data());
      } else {
        setLearningPlan(null);
      }
      setIsPlanLoading(false);
    });
  }, [user]);

  const handleSavePlan = async (plan: any) => {
    if (!user) return;
    const planRef = doc(db, 'learningPlans', user.uid);
    const dataToSave = {
      ...plan,
      userId: user.uid,
      status: 'active',
      updatedAt: serverTimestamp(),
    };
    if (!learningPlan) {
      dataToSave.createdAt = serverTimestamp();
    }
    await setDoc(planRef, dataToSave, { merge: true });
    setLearningPlan(dataToSave);
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
    <div>
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
        {/* ---👇 가공된 submissions를 그대로 전달하면 됩니다. --- */}
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