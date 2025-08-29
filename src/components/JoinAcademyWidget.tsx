'use client';

type JoinAcademyWidgetProps = {
  onJoinClick: () => void;
};

export default function JoinAcademyWidget({ onJoinClick }: JoinAcademyWidgetProps) {
  return (
    <section className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mb-8">
      <h3 className="text-xl font-bold text-gray-800">학원 수업에 참여하시나요?</h3>
      <p className="text-gray-600 mt-2 mb-4">
        학원에 소속되어 있다면, 가입 요청을 보내 선생님이 내주는 과제를 받아보세요.
      </p>
      <button
        onClick={onJoinClick}
        className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
      >
        학원 가입 요청하기
      </button>
    </section>
  );
}
