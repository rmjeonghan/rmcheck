// src/components/LearningAnalysis.tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

const LearningAnalysis = ({ analysisData }: any) => {
  const chartData = {
    labels: analysisData.scoreTrend.map((d: any) => d.date),
    datasets: [
      {
        label: '점수 추이',
        data: analysisData.scoreTrend.map((d: any) => d.score),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '학습 점수 변화' },
    },
    scales: { y: { min: 0, max: 100 } },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <Line options={chartOptions} data={chartData} />
      {/* TODO: 강/약점 단원 분석 컴포넌트 추가 */}
    </div>
  );
};
export default LearningAnalysis;