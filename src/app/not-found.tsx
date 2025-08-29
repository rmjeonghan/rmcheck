// src/app/not-found.tsx

import { Suspense } from 'react';
import NotFoundContent from './NotFoundContent'; // 아래에서 만들 컴포넌트

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h1 className="text-6xl font-bold text-slate-700">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">페이지를 찾을 수 없습니다.</h2>
      <p className="mt-2 text-gray-500">
        요청하신 페이지가 존재하지 않거나, 현재 사용할 수 없습니다.
      </p>

      {/* Suspense로 useSearchParams를 사용하는 컴포넌트를 감싸줍니다. */}
      <Suspense fallback={null}>
        <NotFoundContent />
      </Suspense>
    </div>
  );
}