// src/components/NewChapterSelectModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { X, Check } from 'lucide-react';

// 타입 정의
interface Subject { id: string; name: string; order: number; }
interface MainChapter { id: string; name: string; subjectId: string; order: number; }
interface SubChapter { id: string; name: string; mainChapterId: string; order: number; }

type NewChapterSelectModalProps = {
  onClose: () => void;
  onComplete: (selection: { unitIds: string[]; unitNames: string[] }) => void;
  initialSelectedIds?: string[];
};

export default function NewChapterSelectModal({
  onClose,
  onComplete,
  initialSelectedIds = [],
}: NewChapterSelectModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mainChapters, setMainChapters] = useState<MainChapter[]>([]);
  const [subChapters, setSubChapters] = useState<SubChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeSubjectId, setActiveSubjectId] = useState<string>('');
  const [activeMainChapterId, setActiveMainChapterId] = useState<string>('');
  const [selectedSubChapterIds, setSelectedSubChapterIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const subjectQuery = query(collection(db, 'subjects'), orderBy('order'));
        const mainChapterQuery = query(collection(db, 'mainChapters'), orderBy('order'));
        const subChapterQuery = query(collection(db, 'subChapters'), orderBy('order'));

        const [subjectSnapshot, mainChapterSnapshot, subChapterSnapshot] = await Promise.all([
          getDocs(subjectQuery), getDocs(mainChapterQuery), getDocs(subChapterQuery),
        ]);

        const subjectData = subjectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
        setSubjects(subjectData);
        if (subjectData.length > 0) setActiveSubjectId(subjectData[0].id);

        setMainChapters(mainChapterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MainChapter)));
        setSubChapters(subChapterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubChapter)));

      } catch (error) {
        console.error("단원 정보를 불러오는 데 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const handleSubjectChange = (newSubjectId: string) => {
    const currentIndex = subjects.findIndex(s => s.id === activeSubjectId);
    const newIndex = subjects.findIndex(s => s.id === newSubjectId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveSubjectId(newSubjectId);
    setActiveMainChapterId('');
  };

  const handleSelectSubChapter = (id: string) => {
    setSelectedSubChapterIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleComplete = () => {
    const unitIds = Array.from(selectedSubChapterIds);
    const unitNames = subChapters.filter(sc => unitIds.includes(sc.id)).map(sc => sc.name);
    onComplete({ unitIds, unitNames });
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
          <h2 className="text-xl font-bold text-gray-800">학습 단원 선택</h2>
          <div className="flex items-center p-1 bg-gray-200 rounded-lg">
            {subjects.map((subject) => (
              <button key={subject.id} onClick={() => handleSubjectChange(subject.id)}
                className={`relative px-4 py-2 rounded-md font-bold text-sm transition-colors
                  ${activeSubjectId === subject.id ? 'text-blue-600' : 'text-gray-500 hover:text-black'}`}>
                {activeSubjectId === subject.id && 
                  <motion.div layoutId="subject-highlighter" className="absolute inset-0 bg-white rounded-md shadow-sm z-0"/>}
                <span className="relative z-10">{subject.name}</span>
              </button>
            ))}
          </div>
        </header>

        <main className="flex-grow flex overflow-hidden relative">
          {isLoading ? (
            <div className="flex items-center justify-center w-full text-gray-500">단원 목록을 불러오는 중...</div>
          ) : (
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={activeSubjectId}
                variants={sliderVariants}
                custom={direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex"
              >
                <div className="flex-grow bg-white p-6 overflow-y-auto">
                  {activeMainChapterId ? (
                    <div className="space-y-2">
                      {subChapters.filter(sc => sc.mainChapterId === activeMainChapterId).map(sc => (
                        <motion.button key={sc.id} onClick={() => handleSelectSubChapter(sc.id)}
                          className="w-full text-left p-3 rounded-md flex items-center gap-3 transition-colors hover:bg-slate-50"
                          whileTap={{scale: 0.98}}>
                          <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                            ${selectedSubChapterIds.has(sc.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            {selectedSubChapterIds.has(sc.id) && <Check size={14} className="text-white" />}
                          </div>
                          <span className="text-gray-700">{sc.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>오른쪽 탭에서 대단원을 선택하세요.</p>
                    </div>
                  )}
                </div>

                <div className="w-48 bg-slate-50 border-l border-gray-200 p-3 overflow-y-auto">
                  <div className="space-y-2">
                    {mainChapters.filter(mc => mc.subjectId === activeSubjectId).map(mc => (
                      <button key={mc.id} onClick={() => setActiveMainChapterId(mc.id)}
                        className={`relative w-full p-3 rounded-lg text-left font-semibold text-sm transition-all
                          ${activeMainChapterId === mc.id ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>
                        {activeMainChapterId === mc.id && 
                          <motion.div layoutId="main-chapter-highlighter" className="absolute inset-0 bg-blue-100 rounded-lg z-0"/>}
                        <span className="relative z-10">{mc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-gray-200 flex justify-between items-center">
          <button onClick={onClose} className="font-bold text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200">
            취소
          </button>
          <button onClick={handleComplete}
            className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full shadow-md hover:bg-blue-600">
            선택 완료 ({selectedSubChapterIds.size}개)
          </button>
        </footer>
      </motion.div>
    </div>
  );
}