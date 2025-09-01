// src/components/AcademyAssignmentWidget.tsx
"use client";

import { useAssignments } from "@/hooks/useAssignments";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Assignment } from "@/types";
import { QuizStartParams } from "@/app/page";

// --- 📍 1. onStartQuiz를 props로 받도록 인터페이스를 추가합니다 ---
interface AcademyAssignmentWidgetProps {
  onStartQuiz: (params: QuizStartParams) => void;
}

const AcademyAssignmentWidget = ({ onStartQuiz }: AcademyAssignmentWidgetProps) => {
  const { assignments, isLoading, error } = useAssignments();
  const today = new Date();

  // --- 📍 2. 클릭 시 onStartQuiz 함수를 호출하도록 로직을 수정합니다 ---
  const handleAssignmentClick = (assignment: Assignment) => {
    // 과제는 '신규' 모드로, 과제에 포함된 모든 단원을 대상으로 퀴즈를 시작합니다.
    onStartQuiz({
      mode: 'new',
      questionCount: 30, // 과제는 일반적으로 문항 수가 정해져 있지 않으므로 기본값 30으로 설정
      unitIds: assignment.assignedUnitIds,
      mainChapter: assignment.title,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[150px] flex items-center justify-center">
        <p>과제를 불러오는 중...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="bg-white p-4 rounded-lg shadow-md text-red-500">과제 로딩 중 오류가 발생했습니다.</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <h2 className="text-lg font-bold text-slate-700 mb-2">학원 과제</h2>
        <p className="text-slate-500">오늘은 할당된 학원 과제가 없어요. 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-bold text-slate-700 mb-4">오늘의 과제</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {assignments.map((assignment, index) => {
          const isCompleted = assignment.isCompleted;
          const dueDate = assignment.dueDate.toDate();
          const isOverdue = !isCompleted && dueDate < today;

          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => !isCompleted && handleAssignmentClick(assignment)}
              className={`flex-shrink-0 w-48 p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-300 transform hover:-translate-y-1
                ${isCompleted ? 'bg-green-100' : isOverdue ? 'bg-red-100 border border-red-300' : 'bg-blue-100'}
                ${isCompleted ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <p className={`text-xs font-semibold ${isCompleted ? 'text-green-700' : isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                    {format(dueDate, 'M월 d일 (E)', { locale: ko })}
                  </p>
                  <p className={`mt-1 font-bold truncate ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                    {assignment.dayTitle}
                  </p>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 truncate">{assignment.title}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AcademyAssignmentWidget;