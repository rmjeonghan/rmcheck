// src/components/LearningPlanSetupModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, add, startOfWeek, endOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { WeeklyPlan } from "@/types";
import ChapterSelectModal from "./ChapterSelectModal";

interface LearningPlanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const LearningPlanSetupModal = ({ isOpen, onClose }: LearningPlanSetupModalProps) => {
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>(
    Array.from({ length: 8 }, (_, i) => ({
      week: i + 1,
      days: [1, 3, 5], // 기본: 월, 수, 금
      unitIds: [],
    }))
  );
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [currentEditingWeek, setCurrentEditingWeek] = useState(1);

  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 1 }); // 월요일 시작
  const endDate = endOfWeek(add(startDate, { weeks: totalWeeks - 1 }), { weekStartsOn: 1 });

  const handleWeekChange = (amount: number) => {
    setTotalWeeks((prev) => Math.max(1, Math.min(8, prev + amount)));
  };

  const handleDayToggle = (weekIndex: number, dayIndex: number) => {
    setWeeklyPlans((prev) =>
      prev.map((plan, index) => {
        if (index === weekIndex) {
          const newDays = plan.days.includes(dayIndex)
            ? plan.days.filter((d) => d !== dayIndex)
            : [...plan.days, dayIndex].sort();
          return { ...plan, days: newDays };
        }
        return plan;
      })
    );
  };
  
  const handleOpenChapterModal = (week: number) => {
    setCurrentEditingWeek(week);
    setChapterModalOpen(true);
  };
  
  const handleChapterSelect = (selectedIds: string[]) => {
     setWeeklyPlans(prev => prev.map(plan => 
        plan.week === currentEditingWeek ? { ...plan, unitIds: selectedIds } : plan
    ));
    setChapterModalOpen(false);
  };

  const handleSavePlan = () => {
    // TODO: Firestore에 학습 계획 저장 로직 구현
    console.log({ totalWeeks, weeklyPlans: weeklyPlans.slice(0, totalWeeks) });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">나만의 학습 계획 세우기</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* 기간 설정 */}
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">전체 학습 기간</h3>
                <div className="flex items-center justify-center space-x-4">
                  <button onClick={() => handleWeekChange(-1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200"><ChevronLeft /></button>
                  <span className="text-2xl font-bold w-24 text-center">{totalWeeks}주</span>
                  <button onClick={() => handleWeekChange(1)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200"><ChevronRight /></button>
                </div>
                <p className="mt-2 text-slate-500">
                  {format(startDate, "yyyy.MM.dd")} ~ {format(endDate, "yyyy.MM.dd")}
                </p>
              </div>

              {/* 주차별 상세 계획 */}
              <div className="space-y-6">
                {weeklyPlans.slice(0, totalWeeks).map((plan, weekIndex) => (
                  <div key={plan.week} className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold mb-3">{plan.week}주차 상세 계획</h4>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">학습 횟수: <span className="font-bold text-indigo-600">{plan.days.length}회</span></p>
                      <div className="grid grid-cols-7 gap-2">
                        {WEEKDAYS.map((day, dayIndex) => (
                          <button
                            key={dayIndex}
                            onClick={() => handleDayToggle(weekIndex, dayIndex)}
                            className={`p-2 rounded-md text-sm font-semibold transition-colors ${
                              plan.days.includes(dayIndex)
                                ? "bg-indigo-500 text-white"
                                : "bg-white hover:bg-indigo-100"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-2">학습 단원</p>
                        <div className="p-3 bg-white rounded-md text-sm text-slate-600 min-h-[40px] mb-2">
                            {plan.unitIds.length > 0 ? `총 ${plan.unitIds.length}개 소단원 선택됨` : '선택된 단원이 없습니다.'}
                        </div>
                        <button onClick={() => handleOpenChapterModal(plan.week)} className="w-full py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">
                            {plan.week}주차 단원 선택하기
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t text-right">
              <button onClick={handleSavePlan} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md">
                계획 저장하기
              </button>
            </div>
          </motion.div>
          
          <ChapterSelectModal
            isOpen={isChapterModalOpen}
            onClose={() => setChapterModalOpen(false)}
            onConfirm={handleChapterSelect}
            initialSelectedIds={weeklyPlans.find(p => p.week === currentEditingWeek)?.unitIds || []}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LearningPlanSetupModal;