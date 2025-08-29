// src/components/MyPageHeader.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext'; 

interface MyPageHeaderProps {
  // userName: string; 
}

const MyPageHeader: React.FC<MyPageHeaderProps> = () => {
  const { user } = useAuth();
  const userName = user?.displayName || '학습자';

  const hasStudiedToday = false; // 임시

  return (
    <header className="mb-8 text-center md:text-left">
      <h1 className="text-3xl md:text-4xl font-sans font-bold text-gray-900 leading-tight"> {/* 폰트 크기 및 폰트 변경 */}
        {userName}님의 학습 리포트
      </h1>
      <p className="text-lg text-gray-600 mt-2 font-sans"> {/* 폰트 변경 */}
        오늘도 새로운 지식으로 한 걸음 더 나아갔습니다.
      </p>
      <div className="mt-4 flex justify-center md:justify-start space-x-4 font-sans"> {/* 폰트 변경 */}
        {hasStudiedToday ? (
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
            ✅ 오늘 학습 완료
          </span>
        ) : (
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
            📚 오늘 학습 시작!
          </span>
        )}
      </div>
    </header>
  );
};

export default MyPageHeader;