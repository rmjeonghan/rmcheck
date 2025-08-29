// src/components/LearningPlanSetup.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { add, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
// ▼▼▼ 새로 만든 NewChapterSelectModal을 import 합니다. ▼▼▼
import NewChapterSelectModal from './NewChapterSelectModal';
import { WeeklyPlan, PlanToSave } from '@/types';
import { X, Calendar, Repeat, BookOpen, Star, ChevronLeft, ChevronRight } from 'lucide-react';

type LearningPlanSetupProps = {
  onClose: () => void;
  onSave: (plan: PlanToSave) => void;
  existingPlan?: any;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const DEFAULT_DAYS_BY_FREQ: { [key: number]: number[] } = {
  1: [1], 2: [1, 3], 3: [1, 3, 5], 4: [1, 3, 5, 0],
  5: [1, 2, 3, 4, 5], 6: [1, 2, 3, 4, 5, 6], 7: [0, 1, 2, 3, 4, 5, 6],
};

const safeConvertToDate = (dateSource: any): Date | null => {
  if (!dateSource) return null;
  if (typeof dateSource.toDate === 'function') return dateSource.toDate();
  if (dateSource instanceof Date) return dateSource;
  return null;
};

export default function LearningPlanSetup({ onClose, onSave, existingPlan }: LearningPlanSetupProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingWeekIndex, setEditingWeekIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (existingPlan?.weeklyPlans) {
      setStartDate(safeConvertToDate(existingPlan.startDate) || new Date());
      setTotalWeeks(existingPlan.weeklyPlans.length);
      setWeeklyPlans(existingPlan.weeklyPlans);
    } else {
      const initialPlans = Array.from({ length: 4 }, (_, i) => ({
        week: i + 1, sessionsPerWeek: 3, studyDays: DEFAULT_DAYS_BY_FREQ[3],
        unitIds: [], unitNames: [],
      }));
      setWeeklyPlans(initialPlans);
    }
  }, [existingPlan]);

  const handleTotalWeeksChange = (newTotalWeeks: number) => {
    if (newTotalWeeks < 1 || newTotalWeeks > 8) return;
    setDirection(newTotalWeeks > totalWeeks ? 1 : -1);
    setTotalWeeks(newTotalWeeks);
    setWeeklyPlans(currentPlans => {
      const currentLength = currentPlans.length;
      if (newTotalWeeks > currentLength) {
        return [...currentPlans, ...Array.from({ length: newTotalWeeks - currentLength }, (_, i) => ({
          week: currentLength + i + 1, sessionsPerWeek: 3, studyDays: DEFAULT_DAYS_BY_FREQ[3],
          unitIds: [], unitNames: [],
        }))];
      }
      return currentPlans.slice(0, newTotalWeeks);
    });
  };

  const updateWeeklyPlan = (index: number, updatedProps: Partial<WeeklyPlan>) => {
    setWeeklyPlans(currentPlans => {
      const newPlans = [...currentPlans];
      newPlans[index] = { ...newPlans[index], ...updatedProps };
      return newPlans;
    });
  };

  const handleOpenChapterModal = (index: number) => {
    setEditingWeekIndex(index);
    setIsChapterModalOpen(true);
  };
  
  const handleUnitsSelected = ({ unitIds, unitNames }: { unitIds: string[], unitNames: string[] }) => {
    if (editingWeekIndex !== null) {
      updateWeeklyPlan(editingWeekIndex, { unitIds, unitNames });
    }
    setIsChapterModalOpen(false);
    setEditingWeekIndex(null);
  };

  const handleSave = () => onSave({ startDate, weeklyPlans });
  
  const endDate = useMemo(() => add(startDate, { weeks: totalWeeks, days: -1 }), [startDate, totalWeeks]);

  const textAnimationVariants = {
    enter: (direction: number) => ({ y: direction > 0 ? 15 : -15, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (direction: number) => ({ y: direction < 0 ? 15 : -15, opacity: 0 }),
  };

  // initialSelectedIds 변수 선언 및 초기화
  const initialSelectedIds = useMemo(() => {
    if (editingWeekIndex !== null && weeklyPlans[editingWeekIndex]) {
      return weeklyPlans[editingWeekIndex].unitIds;
    }
    return [];
  }, [editingWeekIndex, weeklyPlans]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <div className="flex-shrink-0 p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{existingPlan ? '학습 계획 수정' : '나만의 학습 계획 세우기'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X /></button>
          </div>

          <div className="flex-grow p-6 space-y-8 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                전체 학습 기간
              </h3>
              <div className="flex items-center justify-center gap-4">
                <motion.button whileTap={{scale:0.9}} onClick={() => handleTotalWeeksChange(totalWeeks - 1)} disabled={totalWeeks === 1} className="p-2 rounded-full bg-white shadow-sm disabled:opacity-50"><ChevronLeft /></motion.button>
                <AnimatePresence mode="wait"><motion.span key={totalWeeks} className="text-4xl font-bold text-blue-500 w-20 text-center">{totalWeeks}주</motion.span></AnimatePresence>
                <motion.button whileTap={{scale:0.9}} onClick={() => handleTotalWeeksChange(totalWeeks + 1)} disabled={totalWeeks === 8} className="p-2 rounded-full bg-white shadow-sm disabled:opacity-50"><ChevronRight /></motion.button>
              </div>
              <div className="mt-4 p-4 bg-white rounded-xl text-center shadow-sm h-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p key={endDate.toISOString()} variants={textAnimationVariants} custom={direction} initial="enter" animate="center" exit="exit"
                    transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.1 }}
                    className="font-bold text-lg text-gray-800 flex items-center justify-center gap-2">
                    <Calendar size={20} className="text-blue-500" />
                    {format(startDate, 'yyyy.MM.dd')} ~ {format(endDate, 'yyyy.MM.dd')}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                주차별 상세 계획
              </h3>
              <div className="space-y-4">
                {weeklyPlans.map((plan, index) => (
                  <motion.div key={plan.week} className="bg-white p-5 rounded-xl shadow-sm space-y-4"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.05 }}>
                    <h4 className="font-bold text-lg text-gray-800">{plan.week}주차</h4>
                    
                    <div>
                      {/* ▼▼▼ 학습 횟수 UI를 한 줄로 합쳤습니다. ▼▼▼ */}
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-md font-semibold text-gray-600 flex items-center gap-2"><Repeat size={18} /> 학습 횟수</label>
                        <div className="text-blue-500 font-bold h-6 flex items-center">
                          <AnimatePresence mode="wait">
                            <motion.span key={plan.sessionsPerWeek} variants={textAnimationVariants} custom={1} initial="enter" animate="center" exit="exit" transition={{duration: 0.1}}>
                              주 {plan.sessionsPerWeek}회
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="relative pt-2">
                        <input type="range" min="1" max="7" value={plan.sessionsPerWeek}
                          onChange={(e) => {
                            const newFreq = parseInt(e.target.value, 10);
                            updateWeeklyPlan(index, { sessionsPerWeek: newFreq, studyDays: DEFAULT_DAYS_BY_FREQ[newFreq] });
                          }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb" />
                           <motion.div className="absolute top-1 left-0 h-2 bg-blue-500 rounded-lg pointer-events-none" style={{ originX: 0 }}
                            animate={{ width: `${((plan.sessionsPerWeek - 1) / 6) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {WEEKDAYS.map((day, dayIndex) => (
                        <motion.button key={dayIndex} onClick={() => {
                            const newDays = plan.studyDays.includes(dayIndex)
                              ? plan.studyDays.filter(d => d !== dayIndex)
                              : [...plan.studyDays, dayIndex].sort((a, b) => a - b);
                            updateWeeklyPlan(index, { studyDays: newDays, sessionsPerWeek: newDays.length });
                          }}
                          className={`p-2 rounded-lg font-semibold text-sm transition-colors ${plan.studyDays.includes(dayIndex) ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}
                          whileTap={{ scale: 0.9 }}>
                          {day}
                        </motion.button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-md font-semibold mb-2 text-gray-600 flex items-center gap-2"><BookOpen size={18} /> 학습 단원</label>
                      <div className="p-3 bg-slate-50 rounded-lg text-sm text-gray-600 min-h-[40px]">
                        {plan.unitNames.join(', ') || '아래 버튼을 눌러 단원을 선택해주세요.'}
                      </div>
                      <button onClick={() => handleOpenChapterModal(index)} className="mt-2 w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                        단원 선택하기
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200 text-right">
            <motion.button onClick={handleSave} className="px-8 py-3 bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:bg-blue-600 flex items-center gap-2 float-right"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Star size={20} /><span>계획 저장하기</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ▼▼▼ 기존 ChapterSelectModal을 새로 만든 NewChapterSelectModal로 교체합니다. ▼▼▼ */}
      {isChapterModalOpen && (
        <NewChapterSelectModal
          onClose={() => setIsChapterModalOpen(false)}
          onComplete={handleUnitsSelected}
          initialSelectedIds={initialSelectedIds} // useMemo로 정의된 initialSelectedIds 사용
        />
      )}
    </>
  );
}