// src/app/auth/kakao/page.tsx
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from 'react';
import KakaoLoginClient from './KakaoLoginClient';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function KakaoCallbackPage() {
  return (
    // Suspense는 클라이언트 컴포넌트가 로드될 때까지 fallback UI를 보여줍니다.
    <Suspense fallback={<LoadingSpinner />}>
      <KakaoLoginClient />
    </Suspense>
  );
}