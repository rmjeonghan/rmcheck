// src/components/ReviewModeModal.tsx
'use client';

type ReviewModeModalProps = {
  onClose: () => void;
  // 사용자가 선택한 모드('review_all' 또는 'review_incorrect')를 부모에게 전달합니다.
  onSelectMode: (mode: 'review_all' | 'review_incorrect') => void;
};

export default function ReviewModeModal({ onClose, onSelectMode }: ReviewModeModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-8">
        <h2 className="text-2xl font-bold mb-6">복습 방식 선택</h2>
        <div className="space-y-4">
          <button
            onClick={() => onSelectMode('review_all')}
            className="w-full p-4 bg-slate-100 text-slate-800 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            풀었던 문제 전체 복습
          </button>
          <button
            onClick={() => onSelectMode('review_incorrect')}
            className="w-full p-4 bg-slate-100 text-slate-800 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            틀린 문항만 다시 풀기
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-8 text-gray-500 hover:text-gray-800"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
