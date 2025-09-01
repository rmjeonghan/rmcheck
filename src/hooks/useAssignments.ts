// src/hooks/useAssignments.ts
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Assignment } from '@/types';
import { doc, getDoc } from 'firebase/firestore';

export const useAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const fetchUserAndAssignments = async () => {
      try {
        const studentDocRef = doc(db, 'students', user.uid);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          const academyName = studentData.academyName;

          if (academyName) {
            const q = query(
              collection(db, 'academyAssignments'),
              where('academyName', '==', academyName),
              orderBy('dueDate', 'asc')
            );

            unsubscribe = onSnapshot(q, (querySnapshot) => {
              const assignmentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              } as Assignment));
              setAssignments(assignmentsData);
              setIsLoading(false);
            }, (err) => {
              console.error("과제 데이터 수신 에러:", err);
              setError(err);
              setIsLoading(false);
            });
          } else {
            // 학원에 가입되지 않은 경우
            setAssignments([]);
            setIsLoading(false);
          }
        } else {
          // 학생 정보가 없는 경우
          setIsLoading(false);
        }
      } catch (err) {
        console.error("학생 정보 조회 에러:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    };

    fetchUserAndAssignments();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return { assignments, isLoading, error };
};