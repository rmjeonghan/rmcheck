// src/app/auth/kakao/page.tsx
"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth, functions } from '@/firebase/config';
import { httpsCallable } from 'firebase/functions';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const KakaoLoginHandler = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      const kakaoLogin = httpsCallable(functions, 'kakaoLogin');
      kakaoLogin({ code })
        .then((result) => {
          const { firebase_token } = result.data as { firebase_token: string };
          signInWithCustomToken(auth, firebase_token)
            .then(() => {
              toast.success('카카오 로그인 성공!');
              router.push('/');
            });
        })
        .catch((error) => {
          console.error("카카오 로그인 처리 오류:", error);
          toast.error('로그인에 실패했습니다.');
          router.push('/');
        });
    }
  }, [searchParams, router]);

  return <LoadingSpinner />;
};

export default KakaoLoginHandler;