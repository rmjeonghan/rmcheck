'use client';

type AnalysisWidgetProps = {
  strongestChapter: string | null;
  weakestChapter: string | null;
};

export default function AnalysisWidget({ strongestChapter, weakestChapter }: AnalysisWidgetProps) {
  // 표시할 분석 결과가 하나도 없으면 컴포넌트 자체를 숨깁니다.
  if (!strongestChapter && !weakestChapter) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">학습 분석</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {strongestChapter ? (
          <div className="bg-white p-4 rounded-lg shadow-md border flex items-start space-x-3">
            <span className="text-2xl">💪</span>
            <div>
              <p className="text-sm text-gray-500">가장 자신 있는 중단원</p>
              <p className="font-bold text-gray-800">{strongestChapter}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md border flex items-start space-x-3 text-gray-400">
             <span className="text-2xl">💪</span>
             <div>
                <p className="text-sm">데이터 부족</p>
                <p className="font-bold">아직 강점 단원이 없어요</p>
             </div>
          </div>
        )}
        {weakestChapter ? (
          <div className="bg-white p-4 rounded-lg shadow-md border flex items-start space-x-3">
            <span className="text-2xl">🧐</span>
            <div>
              <p className="text-sm text-gray-500">보완이 필요한 중단원</p>
              <p className="font-bold text-gray-800">{weakestChapter}</p>
            </div>
          </div>
        ) : (
           <div className="bg-white p-4 rounded-lg shadow-md border flex items-start space-x-3 text-gray-400">
             <span className="text-2xl">🧐</span>
             <div>
                <p className="text-sm">데이터 부족</p>
                <p className="font-bold">아직 약점 단원이 없어요</p>
             </div>
          </div>
        )}
      </div>
    </section>
  );
}
