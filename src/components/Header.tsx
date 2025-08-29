// src/components/Header.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import Link from 'next/link'; // ◀ Link 컴포넌트 가져오기

export default function Header() {
  const { user, loading, loginWithKakao, logout } = useAuth();

  return (
    <header className="py-4 px-6 flex justify-between items-center">
      <div>
        <Link href="/" className="text-xl font-bold">RuleMakers</Link> {/* ◀ 로고를 홈 링크로 */}
      </div>
      <nav>
        {!loading && (
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/my-page" className="font-semibold text-gray-600 hover:text-black">
                  마이페이지
                </Link>
                <button onClick={logout} className="font-semibold text-gray-600 hover:text-black">
                  로그아웃
                </button>
              </div>
            ) : (
              <button onClick={loginWithKakao} className="font-semibold text-gray-600 hover:text-black">
                카카오로 로그인
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}