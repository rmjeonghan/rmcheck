// src/components/RecentActivityView.tsx
import { useState } from 'react';
import { Submission } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ChevronDown, CheckCircle, XCircle } from 'lucide-react';

// 개별 제출 기록 아이템
const SubmissionItem = ({ submission }: { submission: Submission }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const correctCount = submission.isCorrect?.filter(Boolean).length || 0;
  const totalCount = submission.questionIds?.length || 0;

  return (
    <div className="bg-slate-50 rounded-xl">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4">
        <div className="text-left">
          <p className="font-bold text-gray-800">{submission.subChapter}</p>
          <p className="text-sm text-gray-500">{format(submission.createdAt.toDate(), 'yyyy.MM.dd HH:mm')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg text-blue-500">{submission.score}점</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 p-4 text-sm">
              <p className="font-semibold mb-2">세부 결과: ({correctCount}/{totalCount})</p>
              <div className="flex flex-wrap gap-2">
                {submission.isCorrect?.map((isCorrect, index) => (
                  isCorrect 
                    ? <CheckCircle key={index} className="text-green-500" /> 
                    : <XCircle key={index} className="text-red-500" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


interface RecentActivityViewProps {
  submissions: Submission[];
}

export default function RecentActivityView({ submissions }: RecentActivityViewProps) {
  if (submissions.length === 0) {
    return <p className="text-center text-gray-500 py-16">아직 학습 기록이 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {submissions.map(sub => (
        <SubmissionItem key={sub.id} submission={sub} />
      ))}
    </div>
  );
}