'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase';
import { useAuth } from '@/context/AuthContext'; // useAuth를 import합니다.

export default function KakaoLoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = getAuth();
  const { user } = useAuth(); // AuthContext에서 user 상태를 가져옵니다.

  useEffect(() => {
    const kakaoCode = searchParams.get('code');
    // 코드가 있고, 아직 로그인하지 않은 상태일 때만 실행
    if (kakaoCode && !user) {
      const kakaoLogin = httpsCallable(functions, 'kakaoLogin');
      kakaoLogin({ code: kakaoCode })
        .then(result => {
          const token = (result.data as { firebase_token: string }).firebase_token;
          return signInWithCustomToken(auth, token);
        })
        .then(() => {
          router.replace('/'); // URL에서 code 파라미터 제거
        })
        .catch(error => {
          console.error("Kakao 로그인 실패:", error);
          alert("카카오 로그인에 실패했습니다.");
          router.replace('/');
        });
    }
  }, [searchParams, auth, user, router]);

  // 이 컴포넌트는 화면에 아무것도 그리지 않습니다.
  return null;
}
