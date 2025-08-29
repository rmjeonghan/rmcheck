// src/components/LearningPlanSetupModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { X, Check } from 'lucide-react';

// 타입 정의
interface Subject { id: string; name: string; }
interface MainChapter { id: string; name: string; subjectId: string; }
interface SubChapter { id: string; name: string; mainChapterId: string; }

type LearningPlanSetupModalProps = {
  onClose: () => void;
  onSave: (selectedSubChapterIds: string[]) => void;
  initialSelectedIds?: string[];
};

export default function LearningPlanSetupModal({
  onClose,
  onSave,
  initialSelectedIds = [],
}: LearningPlanSetupModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mainChapters, setMainChapters] = useState<MainChapter[]>([]);
  const [subChapters, setSubChapters] = useState<SubChapter[]>([]);

  const [activeSubjectId, setActiveSubjectId] = useState<string>('');
  const [activeMainChapterId, setActiveMainChapterId] = useState<string>('');
  const [selectedSubChapterIds, setSelectedSubChapterIds] = useState<Set<string>>(new Set(initialSelectedIds));

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Subjects
      const subjectSnapshot = await getDocs(query(collection(db, 'subjects'), orderBy('order')));
      const subjectData = subjectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(subjectData);
      if (subjectData.length > 0) {
        setActiveSubjectId(subjectData[0].id);
      }

      // Fetch Main Chapters
      const mainChapterSnapshot = await getDocs(query(collection(db, 'mainChapters'), orderBy('order')));
      setMainChapters(mainChapterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MainChapter)));

      // Fetch Sub Chapters
      const subChapterSnapshot = await getDocs(query(collection(db, 'subChapters'), orderBy('order')));
      setSubChapters(subChapterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubChapter)));
    };
    fetchData();
  }, []);

  const handleSelectSubChapter = (id: string) => {
    setSelectedSubChapterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedSubChapterIds));
  };

  const sliderVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-100 rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
      >
        <header className="flex-shrink-0 p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">학습 계획 설정</h2>
            <p className="text-sm text-gray-500">학습할 단원을 모두 선택해주세요.</p>
          </div>
          <div className="flex items-center gap-2">
            {subjects.map((subject, index) => (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors
                  ${activeSubjectId === subject.id ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-50'}`
                }
              >
                {subject.name}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-grow flex overflow-hidden">
          <AnimatePresence mode="wait">
            {subjects.map(subject =>
              activeSubjectId === subject.id && (
                <motion.div
                  key={subject.id}
                  variants={sliderVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={subjects.findIndex(s => s.id === activeSubjectId) - subjects.findIndex(s => s.id === subject.id)}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="flex-grow flex"
                >
                  {/* 왼쪽: 중단원 표시 영역 */}
                  <div className="flex-grow bg-white p-6 overflow-y-auto">
                    {activeMainChapterId ? (
                      <div className="space-y-2">
                        {subChapters
                          .filter(sc => sc.mainChapterId === activeMainChapterId)
                          .map(sc => (
                            <button
                              key={sc.id}
                              onClick={() => handleSelectSubChapter(sc.id)}
                              className="w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors hover:bg-slate-50"
                            >
                              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                                ${selectedSubChapterIds.has(sc.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`
                              }>
                                {selectedSubChapterIds.has(sc.id) && <Check size={14} className="text-white" />}
                              </div>
                              <span className="text-gray-700">{sc.name}</span>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <p>오른쪽에서 대단원을 선택하세요.</p>
                      </div>
                    )}
                  </div>

                  {/* 오른쪽: 대단원 파일철 탭 */}
                  <div className="w-48 bg-slate-50 border-l border-gray-200 p-3 overflow-y-auto">
                    <div className="space-y-2">
                      {mainChapters
                        .filter(mc => mc.subjectId === subject.id)
                        .map(mc => (
                          <button
                            key={mc.id}
                            onClick={() => setActiveMainChapterId(mc.id)}
                            className={`w-full p-3 rounded-lg text-left font-semibold text-sm transition-all
                              ${activeMainChapterId === mc.id ? 'bg-blue-500 text-white shadow' : 'hover:bg-gray-200'}`
                            }
                          >
                            {mc.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-between items-center">
          <button onClick={onClose} className="font-bold text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200">
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full shadow-md hover:bg-blue-600"
          >
            선택 완료 ({selectedSubChapterIds.size}개)
          </button>
        </footer>
      </motion.div>
    </div>
  );
}