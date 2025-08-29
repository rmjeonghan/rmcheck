'use client';

export default function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* 환영 메시지 스켈레톤 */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
      </div>

      {/* 학습 현황 위젯 스켈레톤 */}
      <div className="h-40 bg-gray-200 rounded-xl mb-8"></div>

      {/* 버튼 그룹 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="md:col-span-2 h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
      
      {/* 최근 활동 위젯 스켈레톤 */}
      <div>
        <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}
