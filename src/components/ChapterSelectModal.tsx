// src/components/ChapterSelectModal.tsx
import { useState, useEffect } from 'react';

type ChapterSelectModalProps = {
  onClose: () => void;
  onComplete: (options: { unitIds: string[]; unitNames: string[]; count: number; }) => void;
  initialSelectedIds?: string[];
  hideQuestionCount?: boolean;
};

// 실제 단원 데이터
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

// 소단원 ID로 이름을 찾기 위한 Map 생성
const subChapterNameMap = new Map<string, string>();
Object.values(curriculumData).flat().forEach(chapter => {
  chapter.subChapters.forEach(sub => {
    const [id, name] = sub.split(': ');
    subChapterNameMap.set(id.trim(), name.trim());
  });
});


export default function ChapterSelectModal({ onClose, onComplete, initialSelectedIds = [], hideQuestionCount = false }: ChapterSelectModalProps) {
  const [openChapter, setOpenChapter] = useState<string | null>(null);
  // [BUG FIX] useEffect를 제거하고 useState의 초기값으로 initialSelectedIds를 직접 사용
  const [selectedChapters, setSelectedChapters] = useState<string[]>(initialSelectedIds);
  const [questionCount, setQuestionCount] = useState(30);

  const toggleChapter = (chapterName: string) => {
    setOpenChapter(openChapter === chapterName ? null : chapterName);
  };

  const handleChapterChange = (chapterId: string, subChapterIds: string[] = []) => {
    const isSelected = selectedChapters.includes(chapterId);
    let newSelected: string[];
    if (isSelected) {
      newSelected = selectedChapters.filter(id => id !== chapterId && !subChapterIds.includes(id));
    } else {
      newSelected = [...selectedChapters, chapterId, ...subChapterIds];
    }
    setSelectedChapters([...new Set(newSelected)]);
  };

  const handleSubChapterChange = (subChapterId: string, parentId: string) => {
    let newSelected = selectedChapters.includes(subChapterId)
      ? selectedChapters.filter(id => id !== subChapterId)
      : [...selectedChapters, subChapterId];
    const parent = Object.values(curriculumData).flat().find(c => c.id === parentId);
    const allSubChapters = parent?.subChapters?.map(s => s.split(':')[0].trim()) || [];
    const allSubSelected = allSubChapters.every(subId => newSelected.includes(subId));
    if (allSubSelected) {
      if (!newSelected.includes(parentId)) newSelected.push(parentId);
    } else {
      newSelected = newSelected.filter(id => id !== parentId);
    }
    setSelectedChapters(newSelected);
  };
  
  const getSelectedSubChapterIds = () => {
    return selectedChapters.filter(id => id.split('-').length === 3);
  };

  const handleComplete = () => {
    const selectedSubIds = getSelectedSubChapterIds();
    const selectedSubNames = selectedSubIds.map(id => subChapterNameMap.get(id) || '');
    
    onComplete({
      unitIds: selectedSubIds,
      unitNames: selectedSubNames,
      count: questionCount,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">단원 선택 ({getSelectedSubChapterIds().length}개 선택됨)</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto max-h-[60vh]">
          {Object.entries(curriculumData).map(([subject, chapters]) => (
            <div key={subject}>
              <h3 className="p-4 bg-gray-100 text-lg font-semibold sticky top-0">{subject}</h3>
              <div className="p-4">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="border-b last:border-b-0 py-2">
                    <div className="flex justify-between items-center">
                      <label className="flex items-center flex-grow p-2 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" checked={selectedChapters.includes(chapter.id)} onChange={() => handleChapterChange(chapter.id, chapter.subChapters?.map(s => s.split(':')[0].trim()))}/>
                        <span className="ml-3 font-medium text-lg" onClick={(e) => { e.stopPropagation(); toggleChapter(chapter.name); }}>{chapter.name}</span>
                      </label>
                      {chapter.subChapters && (<button onClick={() => toggleChapter(chapter.name)} className="p-2"><svg className={`w-5 h-5 text-gray-500 transition-transform ${openChapter === chapter.name ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg></button>)}
                    </div>
                    {openChapter === chapter.name && chapter.subChapters && (
                      <ul className="pl-12 mt-2 space-y-2">
                        {chapter.subChapters.map((subChapter) => {
                          const [subId, subName] = subChapter.split(': ');
                          return (
                            <li key={subId}><label className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"><input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" checked={selectedChapters.includes(subId.trim())} onChange={() => handleSubChapterChange(subId.trim(), chapter.id)}/><span className="ml-3 text-gray-700">{subName}</span></label></li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t space-y-4">
          {!hideQuestionCount && (
            <div>
              <label htmlFor="questionCountRange" className="block text-lg font-semibold mb-2">문항 수: <span className="text-primary font-bold">{questionCount}</span>개</label>
              <input id="questionCountRange" type="range" min="10" max="50" step="5" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
            </div>
          )}
          <button className="w-full px-6 py-3 bg-primary text-white font-bold text-lg rounded-lg hover:bg-primary-hover disabled:bg-gray-400" disabled={getSelectedSubChapterIds().length === 0} onClick={handleComplete}>
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}
