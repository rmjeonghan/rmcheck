// src/components/ChapterSelectModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

type ChapterSelectModalProps = {
  onClose: () => void;
  onComplete: (options: { unitIds: string[]; unitNames: string[]; count: number; }) => void;
  initialSelectedIds?: string[];
  hideQuestionCount?: boolean;
};

// 사용자가 최종적으로 제공한 원본 단원 데이터를 정확히 반영합니다.
const curriculumData = {
  '통합과학 1': [
    { id: '1-1', name: '과학의 기초', subChapters: ['1-1-1: 시간과 공간', '1-1-2: 기본량과 단위', '1-1-3: 측정과 측정 표준', '1-1-4: 정보와 디지털 기술'] },
    { id: '1-2', name: '원소의 형성', subChapters: ['1-2-1: 우주 초기에 형성된 원소', '1-2-2: 지구와 생명체를 이루는 원소의 생성'] },
    { id: '1-3', name: '물질의 규칙성과 성질', subChapters: ['1-3-1: 원소의 주기성과 화학 결합', '1-3-2: 이온 결합과 공유 결합', '1-3-3: 지각과 생명체 구성 물질의 규칙성', '1-3-4: 물질의 전기적 성질'] },
    { id: '1-4', name: '지구시스템', subChapters: ['1-4-1: 지구시스템의 구성 요소', '1-4-2: 지구시스템의 상호작용', '1-4-3: 지권의 변화'] },
    { id: '1-5', name: '역학 시스템', subChapters: ['1-5-1: 중력과 역학 시스템', '1-5-2: 운동과 충돌'] },
    { id: '1-6', name: '생명 시스템', subChapters: ['1-6-1: 생명 시스템의 기본 단위', '1-6-2: 물질대사와 효소', '1-6-3: 세포 내 정보의 흐름'] },
  ],
  '통합과학 2': [
    { id: '2-1', name: '지질 시대와 생물 다양성', subChapters: ['2-1-1: 지질시대의 생물과 화석', '2-1-2: 자연선택과 진화', '2-1-3: 생물다양성과 보전'] },
    { id: '2-2', name: '화학 변화', subChapters: ['2-2-1: 산화와 환원', '2-2-2: 산성과 염기성', '2-2-3: 중화 반응', '2-2-4: 물질 변화에서 에너지 출입'] },
    { id: '2-3', name: '생태계와 환경 변화', subChapters: ['2-3-1: 생태계 구성 요소', '2-3-2: 생태계 평형', '2-3-3: 기후 변화와 지구 환경 변화'] },
    { id: '2-4', name: '에너지와 지속가능한 발전', subChapters: ['2-4-1: 태양 에너지의 생성과 전환', '2-4-2: 전기 에너지의 생산', '2-4-3: 에너지 효율과 신재생 에너지'] },
    { id: '2-5', name: '과학과 미래 사회', subChapters: ['2-5-1: 과학의 유용성과 필요성', '2-5-2: 과학 기술 사회와 빅데이터', '2-5-3: 과학 기술의 발전과 미래 사회', '2-5-4: 과학 관련 사회적 쟁점과 과학 윤리'] },
  ],
};

type CurriculumKey = keyof typeof curriculumData;

export default function ChapterSelectModal({
  onClose,
  onComplete,
  initialSelectedIds = [],
  hideQuestionCount = false,
}: ChapterSelectModalProps) {
  // ✅ **수정**: useState의 초기값으로만 initialSelectedIds를 사용합니다.
  // 이렇게 하면 컴포넌트가 처음 마운트될 때만 초기값이 설정되고,
  // 이후 부모 컴포넌트의 리렌더링에 의해 상태가 덮어씌워지지 않습니다.
  const [selectedChapters, setSelectedChapters] = useState<string[]>(initialSelectedIds);
  
  const [questionCount, setQuestionCount] = useState(30);
  const [activeTab, setActiveTab] = useState<CurriculumKey>('통합과학 1');
  const [openChapters, setOpenChapters] = useState<string[]>([]);

  // ❌ **수정**: 무한 루프와 체크박스 오류의 원인이었던 useEffect 훅을 삭제했습니다.

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev =>
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  const getSubChapterId = (subChapter: string) => subChapter.split(':')[0].trim();
  const getSubChapterName = (subChapter: string) => subChapter.split(':')[1].trim();

  const handleSubChapterChange = (subChapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(subChapterId) ? prev.filter(id => id !== subChapterId) : [...prev, subChapterId]
    );
  };

  const handleMainChapterChange = (mainChapterId: string, subChapters: string[]) => {
    const subChapterIds = subChapters.map(getSubChapterId);
    const allSelected = subChapterIds.every(id => selectedChapters.includes(id));
    
    if (allSelected) {
      setSelectedChapters(prev => prev.filter(id => !subChapterIds.includes(id)));
    } else {
      setSelectedChapters(prev => [...new Set([...prev, ...subChapterIds])]);
    }
  };

  const getSelectedSubChapterDetails = () => {
    const details = { unitIds: [] as string[], unitNames: [] as string[] };
    Object.values(curriculumData).flat().forEach(chapter => {
      chapter.subChapters.forEach(subChapter => {
        const subId = getSubChapterId(subChapter);
        if (selectedChapters.includes(subId)) {
          details.unitIds.push(subId);
          details.unitNames.push(getSubChapterName(subChapter));
        }
      });
    });
    return details;
  };

  const handleComplete = () => {
    const { unitIds, unitNames } = getSelectedSubChapterDetails();
    onComplete({ unitIds, unitNames, count: questionCount });
  };
  
  const chaptersForActiveTab = curriculumData[activeTab];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">학습 단원 선택</h2>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {(Object.keys(curriculumData) as CurriculumKey[]).map(tabName => (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`w-full py-2 px-4 text-base font-semibold rounded-md transition-colors duration-300 ${
                  activeTab === tabName
                    ? 'bg-white text-blue-600 shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tabName}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {chaptersForActiveTab.map(chapter => {
            const isChapterOpen = openChapters.includes(chapter.id);
            const allSubChapters = chapter.subChapters.map(getSubChapterId);
            const isAllSelected = allSubChapters.every(id => selectedChapters.includes(id));
            const isPartiallySelected = allSubChapters.some(id => selectedChapters.includes(id)) && !isAllSelected;

            return (
              <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isPartiallySelected;
                      }}
                      onChange={() => handleMainChapterChange(chapter.id, chapter.subChapters)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="ml-4 text-lg font-semibold text-gray-800">{chapter.name}</span>
                  </div>
                  <ChevronDownIcon
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                      isChapterOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isChapterOpen && (
                  <ul className="p-4 bg-white space-y-2 border-t border-gray-200">
                    {chapter.subChapters.map(subChapter => {
                      const subId = getSubChapterId(subChapter);
                      const subName = getSubChapterName(subChapter);
                      return (
                        <li key={subId}>
                          <label className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedChapters.includes(subId)}
                              onChange={() => handleSubChapterChange(subId)}
                            />
                            <span className="ml-3 text-gray-700">{subName}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
          {!hideQuestionCount && (
            <div>
              <label htmlFor="questionCountRange" className="block text-lg font-semibold mb-2 text-gray-800">
                문항 수: <span className="text-blue-600 font-bold">{questionCount}</span>개
              </label>
              <input
                id="questionCountRange"
                type="range"
                min="10"
                max="50"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 font-bold text-lg rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleComplete}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={getSelectedSubChapterDetails().unitIds.length === 0}
            >
              학습 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}