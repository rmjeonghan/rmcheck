'use client';

import { useState, useMemo, useEffect } from 'react';
import { add, format } from 'date-fns';
import { motion } from 'framer-motion';
import ChapterSelectModal from './ChapterSelectModal';

// 주차별 계획 데이터 타입
interface WeeklyPlan {
  week: number;
  sessionsPerWeek: number;
  studyDays: number[];
  unitIds: string[];
  unitNames: string[]; // 화면 표시용
}

// 부모 컴포넌트로 전달할 계획 데이터 타입
interface PlanToSave {
    startDate: Date;
    weeklyPlans: WeeklyPlan[];
}

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

// Firestore Timestamp 또는 JS Date를 안전하게 Date 객체로 변환
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

  // [BUG FIX] 컴포넌트 마운트 시 또는 existingPlan이 변경될 때 상태를 초기화하는 로직
  useEffect(() => {
    if (existingPlan?.weeklyPlans) {
      // 기존 계획이 있으면 해당 데이터로 상태를 초기화
      setStartDate(safeConvertToDate(existingPlan.startDate) || new Date());
      const initialTotalWeeks = existingPlan.weeklyPlans.length;
      setTotalWeeks(initialTotalWeeks);
      setWeeklyPlans(existingPlan.weeklyPlans);
    } else {
      // 새 계획 설정 시, 기본값(4주)으로 초기 계획을 생성
      const initialPlans = Array.from({ length: 4 }, (_, i) => ({
        week: i + 1,
        sessionsPerWeek: 3,
        studyDays: DEFAULT_DAYS_BY_FREQ[3],
        unitIds: [],
        unitNames: [],
      }));
      setWeeklyPlans(initialPlans);
      setTotalWeeks(4);
    }
  }, [existingPlan]);

  // [BUG FIX] 전체 학습 기간 변경을 처리하는 핸들러 함수
  const handleTotalWeeksChange = (newTotalWeeks: number) => {
    setTotalWeeks(newTotalWeeks);

    setWeeklyPlans(currentPlans => {
      const currentLength = currentPlans.length;
      if (newTotalWeeks > currentLength) {
        // 기간이 늘어나면, 새로운 주차 계획을 기본값으로 추가
        const newWeeks = Array.from({ length: newTotalWeeks - currentLength }, (_, i) => ({
          week: currentLength + i + 1,
          sessionsPerWeek: 3,
          studyDays: DEFAULT_DAYS_BY_FREQ[3],
          unitIds: [],
          unitNames: [],
        }));
        return [...currentPlans, ...newWeeks];
      } else if (newTotalWeeks < currentLength) {
        // 기간이 줄어들면, 뒤쪽 주차 계획을 제거
        return currentPlans.slice(0, newTotalWeeks);
      }
      return currentPlans; // 기간 변경 없으면 그대로 반환
    });
  };

  // 특정 주차의 계획을 업데이트하는 함수
  const updateWeeklyPlan = (index: number, updatedProps: Partial<WeeklyPlan>) => {
    setWeeklyPlans(currentPlans => {
      const newPlans = [...currentPlans];
      newPlans[index] = { ...newPlans[index], ...updatedProps };
      return newPlans;
    });
  };

  // 단원 선택 모달을 여는 함수
  const handleOpenChapterModal = (index: number) => {
    setEditingWeekIndex(index);
    setIsChapterModalOpen(true);
  };
  
  // 단원 선택이 완료되었을 때 호출되는 함수
  const handleUnitsSelected = ({ unitIds, unitNames }: { unitIds: string[], unitNames: string[] }) => {
    if (editingWeekIndex !== null) {
      updateWeeklyPlan(editingWeekIndex, { unitIds, unitNames });
    }
    setIsChapterModalOpen(false);
    setEditingWeekIndex(null);
  };

  const handleSave = () => {
    onSave({ startDate, weeklyPlans });
  };
  
  const endDate = useMemo(() => add(startDate, { weeks: totalWeeks, days: -1 }), [startDate, totalWeeks]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col"
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">{existingPlan ? '학습 계획 수정' : '학습 계획 설정'}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. 전체 학습 기간 설정</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(week => (
                  <button 
                    key={week} 
                    onClick={() => handleTotalWeeksChange(week)} // 수정된 핸들러 호출
                    className={`p-3 rounded-md font-semibold transition-colors ${totalWeeks === week ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {week}주
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-md text-center">
              <p className="font-bold text-lg">
                {format(startDate, 'yyyy.MM.dd')} ~ {format(endDate, 'yyyy.MM.dd')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. 주차별 상세 계획 설정</h3>
              {weeklyPlans.map((plan, index) => (
                <div key={plan.week} className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-bold text-lg">{plan.week}주차 계획</h4>
                  
                  <div>
                    <label className="block text-md font-semibold mb-2">
                      주당 학습 횟수: <span className="text-primary font-bold ml-1">주 {plan.sessionsPerWeek}회</span>
                    </label>
                    <input type="range" min="1" max="7" value={plan.sessionsPerWeek}
                      onChange={(e) => {
                        const newFreq = parseInt(e.target.value, 10);
                        updateWeeklyPlan(index, { sessionsPerWeek: newFreq, studyDays: DEFAULT_DAYS_BY_FREQ[newFreq] });
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {WEEKDAYS.map((day, dayIndex) => (
                      <button key={dayIndex} 
                        onClick={() => {
                          const newDays = plan.studyDays.includes(dayIndex)
                            ? plan.studyDays.filter(d => d !== dayIndex)
                            // 요일 선택/해제 시 학습 횟수도 함께 업데이트
                            : [...plan.studyDays, dayIndex].sort((a, b) => a - b);
                          updateWeeklyPlan(index, { studyDays: newDays, sessionsPerWeek: newDays.length });
                        }}
                        className={`p-2 rounded-md font-semibold text-sm transition-colors ${plan.studyDays.includes(dayIndex) ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-md font-semibold mb-2">학습 단원</label>
                    <div className="p-3 bg-slate-50 rounded-md text-sm text-slate-600 min-h-[40px]">
                      {plan.unitNames && plan.unitNames.length > 0 ? plan.unitNames.join(', ') : '선택된 단원이 없습니다.'}
                    </div>
                    <button onClick={() => handleOpenChapterModal(index)} className="mt-2 w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">
                      학습 단원 선택
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t text-right">
            <button onClick={handleSave} className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover">
              계획 저장하기
            </button>
          </div>
        </motion.div>
      </div>

      {isChapterModalOpen && (
        <ChapterSelectModal
          onClose={() => setIsChapterModalOpen(false)}
          onComplete={handleUnitsSelected}
          initialSelectedIds={editingWeekIndex !== null ? weeklyPlans[editingWeekIndex].unitIds : []}
          hideQuestionCount={true}
        />
      )}
    </>
  );
}
