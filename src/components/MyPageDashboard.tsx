// src/components/MyPageDashboard.tsx
import { motion } from 'framer-motion';
import { BookOpen, Target, CheckSquare } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, unit }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4"
  >
    <div className="p-3 bg-indigo-100 rounded-full">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="text-2xl font-bold">
        {value} <span className="text-lg font-medium">{unit}</span>
      </p>
    </div>
  </motion.div>
);

const MyPageDashboard = ({ stats }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard icon={BookOpen} label="총 학습 횟수" value={stats.totalSubmissions} unit="회" />
      <StatCard icon={CheckSquare} label="총 해결 문제" value={stats.totalProblems} unit="개" />
      <StatCard icon={Target} label="평균 점수" value={stats.averageScore} unit="점" />
    </div>
  );
};
export default MyPageDashboard;