'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// 학습 모드를 사람이 읽기 좋은 이름으로 바꿔주는 헬퍼 함수
const getModeDisplayName = (mode: string | null) => {
  switch (mode) {
    case 'new': return '신규 학습';
    case 'mixed': return '추천 학습';
    case 'review_all': return '전체 복습';
    case 'review_incorrect': return '오답 복습';
    default: return '학습';
  }
};

export default function RecentActivity({ submissions }: { submissions: any[] }) {
  if (submissions.length === 0) {
    return null; // 기록이 없으면 아무것도 표시하지 않음
  }

  const lastSubmission = submissions[0];
  const timeAgo = formatDistanceToNow(lastSubmission.createdAt.toDate(), { addSuffix: true, locale: ko });
  const modeName = getModeDisplayName(lastSubmission.quizMode);
  const chapterInfo = `${lastSubmission.mainChapter} - ${lastSubmission.subChapter}`;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-slate-800 mb-4">최근 활동</h2>
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">{modeName}</span>
            <p className="font-semibold mt-2">{chapterInfo}</p>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">점수</p>
            <p className="text-2xl font-bold text-primary">{lastSubmission.score}점</p>
          </div>
        </div>
      </div>
    </section>
  );
}
