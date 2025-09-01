// src/hooks/useLearningPlan.ts
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { LearningPlan } from '@/types';

export const useLearningPlan = () => {
  const { user } = useAuth();
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  const [hasLearningPlan, setHasLearningPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const q = query(
          collection(db, 'learningPlans'),
          where('userId', '==', user.uid),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const planDoc = querySnapshot.docs[0];
          setLearningPlan({ id: planDoc.id, ...planDoc.data() } as LearningPlan);
          setHasLearningPlan(true);
        } else {
          setHasLearningPlan(false);
          setLearningPlan(null);
        }
      } catch (error) {
        console.error("학습 계획 조회 에러:", error);
        setHasLearningPlan(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  return { learningPlan, hasLearningPlan, isLoading };
};