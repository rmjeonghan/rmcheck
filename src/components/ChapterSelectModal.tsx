// src/components/ChapterSelectModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { curriculumData } from "@/data/curriculum";

interface ChapterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[], questionCount: number) => void;
  showQuestionCountSlider?: boolean;
  initialSelectedIds: string[];
  forExam?: boolean;
}

const ChapterSelectModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedIds,
  showQuestionCountSlider = false,
  forExam = false,
}: ChapterSelectModalProps) => {
  const [activeSubject, setActiveSubject] = useState("통합과학 1");
  const [activeChapterId, setActiveChapterId] = useState("1-1");
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelectedIds));
  const [questionCount, setQuestionCount] = useState(30);

  // initialSelectedIds에서 sort했을 때 min item
  const minSelectedId = initialSelectedIds.reduce((min, id) => (id < min ? id : min), initialSelectedIds[0]);
  // minSelectedId를 '-'로 split
  const [initialSubject, initialChapter1, initialChapter2] = minSelectedId ? minSelectedId.split('-') : ["1", "1", "1"];

  // 모달이 열릴 때 초기 선택된 ID로 상태를 동기화합니다.
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(initialSelectedIds));
    }
  }, [isOpen, initialSelectedIds]);

  useEffect(() => {
    if (isOpen && minSelectedId) {
      setActiveSubject(`통합과학 ${initialSubject}`);
      setActiveChapterId(`${initialSubject}-${initialChapter1}`);
    }
  }, [isOpen]);

  const handleCheckboxChange = (id: string, isChecked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const activeChapter = curriculumData[activeSubject as keyof typeof curriculumData]
    .find(c => c.id === activeChapterId);

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
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">학습 단원 선택</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              {forExam && (
                <p className="mt-2 text-sm text-indigo-600 font-medium">
                  학습 계획에서 설정한 단원을 변경할 수 있습니다.
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {Object.keys(curriculumData).map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setActiveSubject(subject);
                    setActiveChapterId(curriculumData[subject as keyof typeof curriculumData][0].id);
                  }}
                  className={`px-4 py-3 font-semibold transition-colors ${activeSubject === subject ? "border-b-2 border-indigo-500 text-indigo-600" : "text-slate-500"
                    }`}
                >
                  {subject}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-grow flex overflow-hidden">
              {/* 대단원 목록 (파일철) */}
              <div className="w-1/3 bg-slate-50 border-r overflow-y-auto">
                {curriculumData[activeSubject as keyof typeof curriculumData].map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`w-full text-left p-4 font-medium transition-colors ${activeChapterId === chapter.id ? "bg-indigo-100 text-indigo-700" : "hover:bg-slate-100"
                      }`}
                  >
                    {chapter.name}
                  </button>
                ))}
              </div>

              {/* 소단원 목록 */}
              <div className="w-2/3 p-6 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">{activeChapter?.name}</h3>
                <div className="space-y-3">
                  {activeChapter?.subChapters.map(sub => {
                    const [id, name] = sub.split(': ');
                    return (
                      <label key={id} className="flex items-center p-3 rounded-md hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedIds.has(id)}
                          onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                        />
                        <span className="ml-3 text-gray-700">{name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* --- 📍 1. showQuestionCountSlider 조건부 렌더링 수정 --- */}
            {showQuestionCountSlider && (
              <div className="p-6 border-t">
                <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                  문항 수: <span className="font-bold text-indigo-600">{questionCount}</span>
                </label>
                <input
                  id="questionCount"
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t flex justify-end items-center">
              <span className="text-sm text-slate-600 mr-4">총 {selectedIds.size}개 선택됨</span>
              {/* --- 📍 2. onConfirm 함수에 questionCount 인자 추가 --- */}
              <button
                onClick={() => onConfirm(Array.from(selectedIds), questionCount)}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
              >
                {showQuestionCountSlider ? '시험 시작' : '선택 완료'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChapterSelectModal;