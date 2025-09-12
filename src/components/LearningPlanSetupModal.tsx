// src/components/LearningPlanSetupModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LearningPlan, WeeklyPlan } from "@/types";
import ChapterSelectModal from "./ChapterSelectModal";
import { useLearningPlan, getKSTThursday } from "@/hooks/useLearningPlan";

interface LearningPlanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: LearningPlan | null; // 이번 주 계획만 받음
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const LearningPlanSetupModal = ({ isOpen, onClose, initialPlan }: LearningPlanSetupModalProps) => {
  const { savePlan } = useLearningPlan();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>({
    week: getKSTThursday(),
    days: [1, 2, 3, 4, 5, 6], // 기본값: 월~토
    unitIds: [],
  });
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      const weeklyPlans: Record<string, WeeklyPlan> = (initialPlan?.weeklyPlans as Record<string, WeeklyPlan>) || {};
      const thursday = getKSTThursday();
      const _plan = weeklyPlans[thursday];
      if (initialPlan && _plan) {
        setWeeklyPlan({
          week: thursday,
          days: _plan.days ?? [1, 2, 3, 4, 5],   // 기본값 보장
          unitIds: _plan.unitIds ?? [],    // 기본값 보장
        });
      } else {
        setWeeklyPlan({ week: getKSTThursday(), days: [1, 2, 3, 4, 5], unitIds: [] });
      }
    }
  }, [isOpen, initialPlan]);


  const handleDayToggle = (dayIndex: number) => {
    const newDays = weeklyPlan.days.includes(dayIndex)
      ? weeklyPlan.days.filter((d) => d !== dayIndex)
      : [...weeklyPlan.days, dayIndex].sort();
    setWeeklyPlan({ ...weeklyPlan, days: newDays });
  };

  const handleChapterSelect = (selectedIds: string[]) => {
    setWeeklyPlan({ ...weeklyPlan, unitIds: selectedIds });
    setChapterModalOpen(false);
  };

  const handleSavePlan = async () => {
    if (weeklyPlan.unitIds.length === 0) {
      alert("최소 하나의 학습 단원을 선택해주세요.");
      return;
    }
    await savePlan(weeklyPlan);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-slate-100 rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{initialPlan ? '이번 주 학습 계획 수정' : '이번 주 학습 계획 설정'}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <p className="font-bold text-lg mb-4">이번 주</p>

                {/* 요일 선택 */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">학습 요일</p>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(index)}
                        className={`p-2 rounded-md text-sm font-semibold ${weeklyPlan.days.includes(index)
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-200 text-slate-700"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 단원 선택 */}
                <div>
                  <p className="text-sm font-medium mb-2">학습 단원</p>
                  <div className="p-3 bg-white rounded-md text-sm text-slate-600 min-h-[40px] mb-2 border">
                    {weeklyPlan.unitIds.length > 0
                      ? `총 ${weeklyPlan.unitIds.length}개 소단원 선택됨`
                      : '선택된 단원이 없습니다.'}
                  </div>
                  <button
                    onClick={() => setChapterModalOpen(true)}
                    className="w-full py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700"
                  >
                    단원 선택하기
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t text-right">
              <button
                onClick={handleSavePlan}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md"
              >
                계획 저장하기
              </button>
            </div>
          </motion.div>

          {/* 단원 선택 모달 */}
          <ChapterSelectModal
            isOpen={isChapterModalOpen}
            onClose={() => setChapterModalOpen(false)}
            onConfirm={handleChapterSelect}
            initialSelectedIds={weeklyPlan.unitIds}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default LearningPlanSetupModal;
