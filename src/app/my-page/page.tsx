// src/app/my-page/page.tsx
"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState, useEffect } from "react";
import { useMyPageData } from "@/hooks/useMyPageData";
import LoadingSpinner from "@/components/LoadingSpinner";
import MyPageHeader from "@/components/MyPageHeader";
import MyReportTabs from "@/components/MyReportTabs";
import JoinAcademyWidget from "@/components/JoinAcademyWidget";

export default function MyPage() {
  const [mounted, setMounted] = useState(false); // ✅ 추가
  const { stats, analysisData, submissions, questions, userQuestionStats, loading, error } =
    useMyPageData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 빌드/SSR 시점에는 렌더링하지 않음
  if (!mounted) return null;

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
        {/* --- 📍 학원 등록 위젯 --- */}
        <JoinAcademyWidget />

        <MyReportTabs
          stats={stats}
          analysisData={analysisData}
          submissions={submissions}
          questions={questions}
          userQuestionStats={userQuestionStats}
        />
      </main>
    </div>
  );
}
