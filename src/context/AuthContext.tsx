// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// --- ▼ 1. User 타입을 FirebaseUser로 별칭을 지정하여 명확히 구분합니다 ---
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
// --- ▼ 2. 우리가 정의한 커스텀 User 타입을 import 합니다 ---
import { User } from '@/types';

interface AuthContextType {
  user: User | null; // 이제 context의 user는 커스텀 User 타입입니다.
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // --- ▼ 3. 사용자가 로그인하면 Firestore에서 추가 정보를 가져옵니다 ---
        const studentDocRef = doc(db, 'students', firebaseUser.uid);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          // --- ▼ 4. 인증 정보와 Firestore 정보를 하나의 user 객체로 합칩니다 ---
          const studentData = studentDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            // Firestore 'students' 컬렉션의 데이터를 여기에 추가
            name: studentData.name,
            academyName: studentData.academyName,
            role: studentData.role,
          });
        } else {
          // Firestore에 학생 정보가 없는 경우 (예: 가입 직후)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        // 사용자가 로그아웃한 경우
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);