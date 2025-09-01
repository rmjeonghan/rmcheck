// src/components/MyReportTabs.tsx
"use client";
import { useState } from 'react';
import MyPageDashboard from './MyPageDashboard';
import LearningAnalysis from './LearningAnalysis';
import PreviousHistory from './PreviousHistory';
import IncorrectNoteTab from './IncorrectNoteTab';
import AchievementsTab from './AchievementsTab'; // --- 📍 1. 도전 과제 탭 import ---
import { BarChart, LayoutDashboard, NotebookText, Trophy, History } from 'lucide-react';

const MyReportTabs = (props: any) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'analysis', label: '학습 분석', icon: BarChart },
    { id: 'history', label: '이전 학습 기록', icon: History },
    { id: 'incorrect', label: '오답 노트', icon: NotebookText },
    { id: 'achievements', label: '도전 과제', icon: Trophy },
  ];

  return (
    <div>
      <div className="mb-6 border-b">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 sm:px-4 py-3 font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-slate-500 hover:text-indigo-500'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'dashboard' && <MyPageDashboard stats={props.stats} />}
        {activeTab === 'analysis' && <LearningAnalysis analysisData={props.analysisData} />}
        {activeTab === 'history' && <PreviousHistory submissions={props.submissions} questions={props.questions} />}
        {activeTab === 'incorrect' && <IncorrectNoteTab submissions={props.submissions} questions={props.questions} />}
        {/* --- 📍 2. 도전 과제 탭이 선택되었을 때 컴포넌트를 보여주도록 연결 --- */}
        {activeTab === 'achievements' && <AchievementsTab stats={props.stats} submissions={props.submissions} />}
      </div>
    </div>
  );
};

export default MyReportTabs;