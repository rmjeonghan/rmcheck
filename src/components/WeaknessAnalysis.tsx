// src/components/WeaknessAnalysis.tsx

'use client';

import { useMemo } from 'react';
// ---👇 useMyPageData 훅에 정의된 Submission 타입을 직접 import 합니다. ---
import { Submission } from '@/hooks/useMyPageData';

// ---👇 로컬에 있던 Submission, ChapterStats 타입 정의를 제거합니다. ---
// (ChapterStats는 useMemo 안에서 바로 타입을 추론하므로 별도 정의가 필요 없습니다.)

interface WeaknessAnalysisProps {
  submissions: Submission[];
}

export default function WeaknessAnalysis({ submissions }: WeaknessAnalysisProps) {
  const chapterStats = useMemo(() => {
    if (!submissions || submissions.length === 0) {
      return [];
    }

    const stats: { [key: string]: { total: number; correct: number } } = {};

    submissions.forEach(submission => {
      // isCorrect 배열이 실제로 존재하는지 안전하게 확인합니다.
      if (submission.isCorrect && Array.isArray(submission.isCorrect)) {
        submission.isCorrect.forEach(isCorrect => {
          // subChapter가 없는 경우를 대비해 기본값을 설정할 수 있습니다.
          const chapter = submission.subChapter || '기타';
          if (!stats[chapter]) {
            stats[chapter] = { total: 0, correct: 0 };
          }
          stats[chapter].total++;
          if (isCorrect) {
            stats[chapter].correct++;
          }
        });
      }
    });

    const statsArray = Object.entries(stats).map(([chapterName, data]) => ({
      chapterName,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      totalQuestions: data.total,
      correctQuestions: data.correct,
    }));
    
    statsArray.sort((a, b) => a.accuracy - b.accuracy);

    return statsArray;
  }, [submissions]);

  if (chapterStats.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <p className="text-slate-500">아직 학습 기록이 충분하지 않아요.<br/>퀴즈를 풀고 나면 이곳에서 약점을 분석해 드릴게요!</p>
      </div>
    );
  }

  const getBarColor = (accuracy: number) => {
    if (accuracy < 50) return 'bg-red-400';
    if (accuracy < 80) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-4">
      {chapterStats.map(stat => (
        <div key={stat.chapterName} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-700 truncate pr-4">{stat.chapterName}</span>
            <span className="text-sm font-bold text-slate-600">{stat.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(stat.accuracy)}`} 
              style={{ width: `${stat.accuracy}%` }}
            ></div>
          </div>
           <p className="text-xs text-right text-slate-500 mt-1">
              ({stat.totalQuestions}문제 중 {stat.correctQuestions}문제 정답)
            </p>
        </div>
      ))}
    </div>
  );
}