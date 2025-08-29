'use client';

type LearningStatusWidgetProps = {
  totalAnswered: number;
  totalIncorrect: number;
};

export default function LearningStatusWidget({ totalAnswered, totalIncorrect }: LearningStatusWidgetProps) {
  const message = totalIncorrect >= 10 
    ? "복습도 함께하며 약점을 보완할 시간이에요!" 
    : "새로운 문제로 실력을 키워보세요!";

  return (
    <section className="bg-gradient-to-br from-primary to-blue-400 text-white p-6 rounded-xl shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">나의 학습 현황</h2>
        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">{message}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-sm opacity-80">푼 문제</p>
          <p className="text-3xl font-bold">{totalAnswered}</p>
        </div>
        <div className="bg-white/20 p-4 rounded-lg">
          <p className="text-sm opacity-80">오답 문제</p>
          <p className="text-3xl font-bold">{totalIncorrect}</p>
        </div>
      </div>
    </section>
  );
}
