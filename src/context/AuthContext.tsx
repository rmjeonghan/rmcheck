// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, Suspense } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import KakaoLoginHandler from '@/components/KakaoLoginHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithKakao: () => void; // ◀ 여기에 타입을 추가합니다.
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  const updateUserProfileInFirestore = async (firebaseUser: User) => {
    const studentRef = doc(db, 'students', firebaseUser.uid);
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      await setDoc(studentRef, {
        studentName: firebaseUser.displayName,
        kakaoNickname: firebaseUser.displayName,
        email: firebaseUser.email,
        createdAt: serverTimestamp(),
        status: 'active',
        isDeleted: false,
        academyName: null,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        updateUserProfileInFirestore(currentUser);
      }
    });
    return () => unsubscribe();
  }, [auth]);
  
  const loginWithKakao = async () => {
    setLoading(true);
    try {
        const response = await fetch('https://asia-northeast3-rmcheck-4e79c.cloudfunctions.net/getKakaoLoginUrl');
        const data = await response.json();
        window.location.href = data.auth_url;
    } catch (error) {
        console.error("Failed to get Kakao login URL:", error);
        alert("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
    }
  };

  const logout = () => {
    auth.signOut();
  };

  // ▼▼▼ value 객체에 loginWithKakao를 추가합니다. ▼▼▼
  const value = { user, loading, loginWithKakao, logout };

  return (
    <AuthContext.Provider value={value}>
      <Suspense fallback={null}>
        <KakaoLoginHandler />
      </Suspense>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}