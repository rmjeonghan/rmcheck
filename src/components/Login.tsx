// src/components/Login.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { RiKakaoTalkFill } from 'react-icons/ri';
import LoadingSpinner from './LoadingSpinner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider: GoogleAuthProvider) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore에 사용자 정보가 있는지 확인
      const userRef = doc(db, 'students', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 새 사용자 정보 생성
        await setDoc(userRef, {
          studentName: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          status: 'active', // 기본 상태를 'active'로 설정
          isDeleted: false,
          academyName: null, // 초기에는 학원 없음
        });
        toast.success(`${user.displayName}님, 환영합니다!`);
      }
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    handleSocialLogin(provider);
  };
  
  // 카카오 로그인은 추가 설정이 필요하여 우선 기능만 정의합니다.
  const onKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const getKakaoLoginUrl = httpsCallable(functions, 'getKakaoLoginUrl');
      const result = await getKakaoLoginUrl();
      const { auth_url } = result.data as { auth_url: string };
      window.location.href = auth_url; // 카카오 로그인 페이지로 이동
    } catch (error) {
      console.error("카카오 로그인 URL 가져오기 오류:", error);
      toast.error('카카오 로그인에 실패했습니다.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 150 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">RuleMakers</h1>
          <p className="mt-2 text-slate-500">Daily Test</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FcGoogle className="w-6 h-6 mr-3" />
            <span>Google 계정으로 시작하기</span>
          </button>
          <button
            onClick={onKakaoLogin}
            className="w-full flex items-center justify-center px-4 py-3 bg-[#FEE500] rounded-lg shadow-sm text-base font-medium text-black hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <RiKakaoTalkFill className="w-6 h-6 mr-3" />
            <span>카카오 계정으로 시작하기</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;