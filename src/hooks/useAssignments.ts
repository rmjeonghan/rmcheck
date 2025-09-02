// src/hooks/useAssignments.ts

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { Assignment, StudentAssignment, User } from '@/types';

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

    const fetchAssignmentsAndStatus = async () => {
      try {
        // 1. 학생 정보에서 학원 이름 가져오기
        const studentDocRef = doc(db, 'students', user.uid);
        const studentDoc = await getDoc(studentDocRef);

        if (!studentDoc.exists()) {
          setIsLoading(false);
          return;
        }

        const studentData = studentDoc.data() as User;
        const academyName = studentData.academyName;

        if (!academyName) {
          setAssignments([]);
          setIsLoading(false);
          return;
        }

        // 2. 학원의 모든 과제와 학생의 과제 완료 기록을 동시에 가져오기
        const [academyAssignmentsSnapshot, studentAssignmentsSnapshot] = await Promise.all([
          getDocs(query(
            collection(db, 'academyAssignments'),
            where('academyName', '==', academyName),
            orderBy('dueDate', 'asc')
          )),
          getDocs(query(
            collection(db, 'studentAssignments'),
            where('studentId', '==', user.uid)
          ))
        ]);

        // 3. 학생의 과제 완료 기록을 쉽게 찾을 수 있도록 Map으로 변환
        const studentCompletedMap = new Map<string, StudentAssignment>();
        studentAssignmentsSnapshot.forEach(doc => {
          const data = doc.data() as StudentAssignment;
          studentCompletedMap.set(data.assignmentId, data);
        });

        // 4. 학원 과제 목록과 학생의 완료 상태를 병합
        const mergedAssignments = academyAssignmentsSnapshot.docs.map(doc => {
          const academyAssignment = { id: doc.id, ...doc.data() } as Assignment;
          const studentRecord = studentCompletedMap.get(academyAssignment.id);

          return {
            ...academyAssignment,
            isCompleted: studentRecord ? studentRecord.isCompleted : false,
          };
        });

        setAssignments(mergedAssignments);
      } catch (err) {
        console.error("과제 정보 조회 에러:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignmentsAndStatus();
    
    // 실시간 업데이트가 필요하다면 onSnapshot을 사용해야 하지만,
    // 현재 구조에서는 한 번에 불러오는 getDocs가 더 적합합니다.
    // 만약 실시간 동기화가 꼭 필요하다면 이 부분을 onSnapshot으로 재구성해야 합니다.

  }, [user]);

  return { assignments, isLoading, error };
};