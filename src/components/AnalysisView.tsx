// src/components/AnalysisView.tsx
import { motion } from 'framer-motion';
import { Flame, Target, ThumbsUp, ThumbsDown } from 'lucide-react';
import AnalysisWidget from './AnalysisWidget'; // 기존 위젯 재사용

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

const StatCard = ({ icon, label, value, unit }: StatCardProps) => (
  <div className="bg-slate-50 p-4 rounded-xl flex items-center">
    <div className="p-3 bg-white rounded-full mr-4 shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value} <span className="text-lg">{unit}</span>
      </p>
    </div>
  </div>
);

interface AnalysisViewProps {
  studyStreak: number;
  totalAnsweredCount: number;
  strongestChapter: string | null;
  weakestChapter: string | null;
}

export default function AnalysisView({ studyStreak, totalAnsweredCount, strongestChapter, weakestChapter }: AnalysisViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard 
        icon={<Flame className="text-orange-500" />}
        label="연속 학습일"
        value={studyStreak}
        unit="일"
      />
      <StatCard 
        icon={<Target className="text-blue-500" />}
        label="총 푼 문제"
        value={totalAnsweredCount}
        unit="개"
      />
      <div className="md:col-span-2">
        {/* 기존 AnalysisWidget을 그대로 활용하되, 디자인 통일성을 위해 감쌉니다. */}
        <AnalysisWidget strongestChapter={strongestChapter} weakestChapter={weakestChapter} />
      </div>
    </div>
  );
}