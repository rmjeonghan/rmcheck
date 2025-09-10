// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// --- ▼ Firebase User 타입을 별칭으로 구분
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
// --- ▼ 커스텀 User 타입
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// ✅ 기본값은 user:null, loading:true
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Firestore에서 학생 정보 가져오기
        const studentDocRef = doc(db, 'students', firebaseUser.uid);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            name: studentData.name,
            academyName: studentData.academyName,
            role: studentData.role,
          });
        } else {
          // Firestore에 학생 정보가 없는 경우
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        }
      } else {
        // 로그아웃 시
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

// ✅ Provider가 없더라도 기본값을 반환 → 빌드 시 안전
export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? { user: null, loading: true };
};