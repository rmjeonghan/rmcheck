// src/components/VisualLearningStatus.tsx
'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Submission } from '@/types';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface VisualLearningStatusProps {
  submissions: Submission[];
}

export default function VisualLearningStatus({ submissions }: VisualLearningStatusProps) {
  // (이전 답변과 동일한 코드)
  const chronologicalSubmissions = [...submissions].reverse();

  const chartData = {
    labels: chronologicalSubmissions.map((s, i) => `${i + 1}회차`),
    datasets: [
      {
        label: '점수',
        data: chronologicalSubmissions.map(s => s.score),
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3b82f6',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#3b82f6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, grid: { display: false } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-blue-500" size={24} />
        <h3 className="text-xl font-bold text-gray-800">학습 점수 추이</h3>
      </div>
      {submissions.length > 0 ? (
         <div className="h-64">
           <Line options={chartOptions} data={chartData} />
         </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">아직 학습 기록이 없어요.</p>
          <p className="text-gray-400 text-sm mt-1">퀴즈를 풀면 이곳에 그래프가 표시됩니다.</p>
        </div>
      )}
    </motion.div>
  );
}