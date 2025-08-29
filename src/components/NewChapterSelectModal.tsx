import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { FaBook, FaFolder } from 'react-icons/fa';

interface SubChapter {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  subChapters: string[];
}

interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

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

const subjects: Subject[] = Object.entries(curriculumData).map(([subjectName, chapters]) => ({
  id: subjectName,
  name: subjectName,
  chapters: chapters.map(chapter => ({
    ...chapter,
  })),
}));

interface NewChapterSelectModalProps {
  onClose: () => void;
  onComplete: (selected: {
    unitIds: string[];
    unitNames: string[];
  }) => void;
  initialSelectedUnitIds?: string[];
}

const NewChapterSelectModal: React.FC<NewChapterSelectModalProps> = ({
  onClose,
  onComplete,
  initialSelectedUnitIds = [],
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0].id);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSubChapters, setSelectedSubChapters] = useState<string[]>(initialSelectedUnitIds);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const selectedChapter = selectedSubject?.chapters.find((c) => c.id === selectedChapterId);

  const handleSubChapterToggle = (subChapterName: string) => {
    setSelectedSubChapters((prev) => {
      if (prev.includes(subChapterName)) {
        return prev.filter((name) => name !== subChapterName);
      } else {
        return [...prev, subChapterName];
      }
    });
  };

  const isSubChapterSelected = (subChapterName: string) =>
    selectedSubChapters.includes(subChapterName);

  const handleComplete = () => {
    onComplete({
      unitIds: selectedSubChapters.map(name => `${selectedSubjectId}-${name.split(':')[0]}`),
      unitNames: selectedSubChapters,
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-6 md:p-8 bg-white rounded-lg shadow-xl max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">단원 선택</h2>
        <p className="text-gray-500 mb-6">
          학습할 단원들을 선택해주세요.
        </p>

        <div className="flex justify-center space-x-4 mb-6">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => {
                setSelectedSubjectId(subject.id);
                setSelectedChapterId(null);
                setSelectedSubChapters([]);
              }}
              className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                selectedSubjectId === subject.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <div className="bg-gray-100 rounded-xl p-4 md:p-6 flex space-x-4 h-[500px]">
          <div className="w-1/3 flex flex-col space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">대단원</h3>
            {selectedSubject?.chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setSelectedChapterId(chapter.id)}
                className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  selectedChapterId === chapter.id
                    ? 'bg-white text-blue-600 shadow-md transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaFolder className="mr-3" />
                <span className="font-medium text-sm md:text-base text-left">
                  {chapter.name}
                </span>
              </button>
            ))}
          </div>

          <div className="w-2/3 bg-white p-4 rounded-lg shadow-inner overflow-y-auto custom-scrollbar">
            {selectedChapter ? (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <FaBook className="inline mr-2 text-blue-500" />
                  {selectedChapter.name}
                </h3>
                <ul className="space-y-3">
                  {selectedChapter.subChapters.map((subChapterName) => (
                    <li
                      key={subChapterName}
                      onClick={() => handleSubChapterToggle(subChapterName)}
                      className={`cursor-pointer p-4 rounded-lg transition-colors duration-200 border-2 ${
                        isSubChapterSelected(subChapterName)
                          ? 'bg-blue-100 border-blue-500 shadow-sm'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base md:text-lg font-medium text-gray-800">
                          {subChapterName}
                        </span>
                        <input
                          type="checkbox"
                          checked={isSubChapterSelected(subChapterName)}
                          onChange={() => {}}
                          className="form-checkbox h-5 w-5 text-blue-600 rounded-md"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaFolder className="text-6xl mb-4" />
                <p className="text-center text-lg">
                  왼쪽에서 대단원을 선택해주세요.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            취소
          </button>
          <button
            onClick={handleComplete}
            disabled={selectedSubChapters.length === 0}
            className={`px-6 py-2 rounded-full font-bold transition-colors duration-200 ${
              selectedSubChapters.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            선택 완료 ({selectedSubChapters.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NewChapterSelectModal;