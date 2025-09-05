// src/app/my-page/page.tsx
"use client";
export const dynamic = 'force-dynamic';

import { useMyPageData } from "@/hooks/useMyPageData";
import LoadingSpinner from "@/components/LoadingSpinner";
import MyPageHeader from "@/components/MyPageHeader";
import MyReportTabs from "@/components/MyReportTabs";
import JoinAcademyWidget from "@/components/JoinAcademyWidget";

export default function MyPage() {
  const { stats, analysisData, submissions, questions, loading, error } = useMyPageData();

  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MyPageHeader />
      <main className="p-4 sm:p-6 space-y-6">
        {/* --- 📍 학원 등록 위젯 추가 --- */}
        <JoinAcademyWidget />
        
        <MyReportTabs
          stats={stats}
          analysisData={analysisData}
          submissions={submissions}
          questions={questions}
        />
      </main>
    </div>
  );
}