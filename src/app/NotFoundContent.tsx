'use client'; // 👈 이 부분이 가장 중요합니다! 파일 맨 위에 있어야 합니다.

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFoundContent() {
  const searchParams = useSearchParams();
  const [path, setPath] = useState('');

  // 컴포넌트가 클라이언트에서 마운트된 후에 searchParams를 읽어옵니다.
  useEffect(() => {
    // URLSearchParams.toString()은 CSR 에러를 유발할 수 있어 get()으로 특정 키를 가져옵니다.
    // Next.js가 404 페이지로 리디렉션할 때 내부적으로 파라미터를 넘기는 경우가 있습니다.
    const attemptedPath = searchParams.get('path'); // 예시 파라미터
    if (attemptedPath) {
      setPath(attemptedPath);
    }
  }, [searchParams]);

  if (!path) {
    return null; // 파라미터가 없으면 아무것도 렌더링하지 않음
  }

  return (
    <p className="mt-4 text-sm bg-slate-100 p-2 rounded-md">
      찾으시는 경로: <code className="font-mono">{path}</code>
    </p>
  );
}