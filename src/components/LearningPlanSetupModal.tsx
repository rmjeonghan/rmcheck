// src/components/LearningPlanSetupModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LearningPlan, WeeklyPlan } from "@/types";
import ChapterSelectModal from "./ChapterSelectModal";
import { useLearningPlan } from "@/hooks/useLearningPlan";

interface LearningPlanSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: LearningPlan | null; // 기존 계획을 받기 위한 prop 추가
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const LearningPlanSetupModal = ({ isOpen, onClose, initialPlan }: LearningPlanSetupModalProps) => {
  const { savePlan } = useLearningPlan();
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [currentEditingWeek, setCurrentEditingWeek] = useState(1);

  // 모달이 열릴 때 initialPlan 값에 따라 상태를 초기화
  useEffect(() => {
    if (isOpen) {
      if (initialPlan && initialPlan.weeklyPlans.length > 0) {
        setTotalWeeks(initialPlan.weeklyPlans.length);
        const fullPlans = Array.from({ length: 8 }, (_, i) => {
            const existing = initialPlan.weeklyPlans.find(p => p.week === i + 1);
            return existing || { week: i + 1, days: [1, 3, 5], unitIds: [] };
        });
        setWeeklyPlans(fullPlans);
      } else {
        setTotalWeeks(4);
        setWeeklyPlans(Array.from({ length: 8 }, (_, i) => ({
          week: i + 1,
          days: [1, 3, 5],
          unitIds: [],
        })));
      }
    }
  }, [isOpen, initialPlan]);
  
  const handleWeekChange = (week: number, field: string, value: any) => {
    setWeeklyPlans(
      weeklyPlans.map((plan) =>
        plan.week === week ? { ...plan, [field]: value } : plan
      )
    );
  };

  const handleDayToggle = (week: number, dayIndex: number) => {
    const plan = weeklyPlans.find((p) => p.week === week);
    if (!plan) return;
    const newDays = plan.days.includes(dayIndex)
      ? plan.days.filter((d) => d !== dayIndex)
      : [...plan.days, dayIndex].sort();
    handleWeekChange(week, "days", newDays);
  };
  
  const handleOpenChapterModal = (week: number) => {
    setCurrentEditingWeek(week);
    setChapterModalOpen(true);
  };

  const handleChapterSelect = (selectedIds: string[]) => {
    handleWeekChange(currentEditingWeek, "unitIds", selectedIds);
    setChapterModalOpen(false);
  };
  
  const handleSavePlan = async () => {
    const validPlans = weeklyPlans.slice(0, totalWeeks).filter(p => p.unitIds.length > 0);
    if (validPlans.length === 0) {
        alert("하나 이상의 학습 단원을 선택해주세요.");
        return;
    }
    await savePlan(validPlans);
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
            className="bg-slate-100 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{initialPlan ? '학습 계획 수정' : '나의 학습 계획 설정'}</h2>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <div>
                <label className="font-semibold">총 학습 기간</label>
                <div className="flex items-center gap-4 mt-2">
                  <input 
                    type="range" min="1" max="8" value={totalWeeks} 
                    onChange={(e) => setTotalWeeks(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="font-bold text-indigo-600 w-12 text-center">{totalWeeks}주</span>
                </div>
              </div>

              <div className="space-y-4">
                {weeklyPlans.slice(0, totalWeeks).map((plan) => (
                  <div key={plan.week} className="bg-white p-4 rounded-lg shadow-sm border">
                    <p className="font-bold text-lg mb-2">{plan.week}주차</p>
                    <div className="mb-4">
                        <p className="text-sm font-medium mb-2">학습 요일</p>
                        <div className="grid grid-cols-7 gap-2">
                            {WEEKDAYS.map((day, index) => (
                                <button
                                    key={day}
                                    onClick={() => handleDayToggle(plan.week, index)}
                                    className={`p-2 rounded-md text-sm font-semibold ${
                                        plan.days.includes(index)
                                        ? "bg-indigo-500 text-white"
                                        : "bg-slate-200 text-slate-700"
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium mb-2">학습 단원</p>
                        <div className="p-3 bg-white rounded-md text-sm text-slate-600 min-h-[40px] mb-2 border">
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
        </div>
      )}
    </AnimatePresence>
  );
};

export default LearningPlanSetupModal;

