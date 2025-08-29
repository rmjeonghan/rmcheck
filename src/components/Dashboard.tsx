// src/components/Dashboard.tsx
'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Submission } from '@/hooks/useMyPageData';

// Chart.js에 필요한 요소들을 등록합니다.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return <p className="text-gray-500">아직 학습 기록이 없습니다. 퀴즈를 풀고 오세요!</p>;
  }

  // ▼▼▼ 이 부분을 수정했습니다 ▼▼▼
  // 데이터를 시간 순서(오래된 것 -> 최신 것)로 뒤집습니다.
  const chronologicalSubmissions = [...submissions].reverse();

  const chartData = {
    // 뒤집은 데이터를 기준으로 라벨을 생성합니다. (1회차가 가장 왼쪽)
    labels: chronologicalSubmissions.map((s, i) => `${i + 1}회차`),
    datasets: [
      {
        label: '점수 추이',
        // 뒤집은 데이터를 기준으로 점수를 매핑합니다.
        data: chronologicalSubmissions.map(s => s.score),
        borderColor: '#78AAD4',
        backgroundColor: 'rgba(120, 170, 212, 0.5)',
        fill: true,
        tension: 0.1 // 라인을 부드럽게 만듭니다.
      },
    ],
  };
  // ▲▲▲ 여기까지 수정 ▲▲▲

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false, // 범례는 숨깁니다.
      },
    },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">최근 학습 점수 추이</h3>
      <Line options={chartOptions} data={chartData} />
    </div>
  );
}