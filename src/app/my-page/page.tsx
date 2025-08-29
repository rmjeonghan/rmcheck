// src/app/my-page/page.tsx
'use client';

import { useState } from 'react';
import { useMyPageData } from '@/hooks/useMyPageData';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, List, ClipboardX, Award, CalendarDays } from 'lucide-react';

// 새로 만들 뷰 컴포넌트들 (기존 컴포넌트 및 새로운 컴포넌트)
import AnalysisView from '@/components/AnalysisView';
import RecentActivityView from '@/components/RecentActivityView';
import IncorrectNoteView from '@/components/IncorrectNoteView';
import HomeSkeleton from '@/components/HomeSkeleton';
import MyPageHeader from '@/components/MyPageHeader'; 
import DashboardWidgets from '@/components/DashboardWidgets'; 
import AchievementBadges from '@/components/AchievementBadges'; 
import MyReportTabs from '@/components/MyReportTabs';
import CurrentPlanCard from '@/components/CurrentPlanCard';

type Tab = 'dashboard' | 'analysis' | 'activity' | 'notes' | 'achievements';

export default function MyPage() {
  const { user } = useAuth();
  const { 
    loading,
    submissions,
    incorrectQuestions,
    studyStreak,
    strongestChapter,
    weakestChapter,
    totalAnsweredCount,
    plan
  } = useMyPageData();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: <CalendarDays size={18} /> },
    { id: 'analysis', label: '학습 분석', icon: <BarChart size={18} /> },
    { id: 'activity', label: '최근 기록', icon: <List size={18} /> },
    { id: 'notes', label: '오답 노트', icon: <ClipboardX size={18} /> },
    { id: 'achievements', label: '도전 과제', icon: <Award size={18} /> },
  ];

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <HomeSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <MyPageHeader userName={user?.displayName || "학습자"} />

        {plan && <CurrentPlanCard plan={plan} onEditClick={() => { /* ... */ }} />}
        
        <div className="relative bg-white rounded-2xl shadow-xl mt-8">
          <MyReportTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {activeTab === 'dashboard' && (
                  <DashboardWidgets 
                    studyStreak={studyStreak} 
                    totalAnsweredCount={totalAnsweredCount}
                  />
                )}
                {activeTab === 'analysis' && (
                  <AnalysisView 
                    studyStreak={studyStreak}
                    totalAnsweredCount={totalAnsweredCount}
                    strongestChapter={strongestChapter}
                    weakestChapter={weakestChapter}
                    submissions={submissions}
                  />
                )}
                {activeTab === 'activity' && <RecentActivityView submissions={submissions} />}
                {activeTab === 'notes' && <IncorrectNoteView questions={incorrectQuestions} />}
                {activeTab === 'achievements' && <AchievementBadges submissions={submissions} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}