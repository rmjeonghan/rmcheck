// src/components/SetupPromptWidget.tsx
'use client';

type SetupPromptWidgetProps = {
  onSetupClick: () => void;
};

export default function SetupPromptWidget({ onSetupClick }: SetupPromptWidgetProps) {
  return (
    <section className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg shadow mb-8">
      {/* ---👇 모바일에서는 세로(flex-col), sm 사이즈부터 가로(sm:flex-row)로 변경 --- */}
      {/* ---👇 모바일에서는 중앙 정렬, sm 사이즈부터 왼쪽 정렬 --- */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-yellow-800">체계적인 학습을 시작해보세요!</h3>
          <p className="text-sm text-yellow-700 mt-1">학습 계획을 설정하여 매일 꾸준히 실력을 향상시킬 수 있습니다.</p>
        </div>
        <div className="ml-auto w-full sm:w-auto">
          <button onClick={onSetupClick} className="px-5 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors whitespace-nowrap w-full sm:w-auto">
            계획 설정하기
          </button>
        </div>
      </div>
    </section>
  );
}