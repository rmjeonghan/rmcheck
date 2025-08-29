// src/components/AcademyAssignmentWidget.tsx
'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

// ---👇 any 타입을 없애기 위해 타입을 정의했습니다. ---
interface Assignment {
  assignmentName: string;
  dueDate?: string | Date | Timestamp;
}

type AcademyAssignmentWidgetProps = {
  assignment: Assignment | null;
  onStart: () => void;
};

export default function AcademyAssignmentWidget({ assignment, onStart }: AcademyAssignmentWidgetProps) {
  if (!assignment) return null;

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate as string) : null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-2 border-primary p-6 rounded-lg shadow-lg mb-8"
    >
      {/* ---👇 모바일에서는 세로(flex-col), sm 사이즈부터 가로(sm:flex-row)로 변경 --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
            학원 과제
          </span>
          {/* ---👇 제목 글자 크기를 반응형으로 조절 --- */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">{assignment.assignmentName}</h2>
          {dueDate && (
            <p className="text-sm text-gray-500 mt-1">
              마감일: {format(dueDate, 'yyyy년 MM월 dd일')}
            </p>
          )}
        </div>
        <button
          onClick={onStart}
          // ---👇 모바일에서는 꽉 찬 너비(w-full), sm 사이즈부터 자동 너비(sm:w-auto)로 변경 ---
          className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap w-full sm:w-auto"
        >
          과제 시작하기
        </button>
      </div>
    </motion.section>
  );
}