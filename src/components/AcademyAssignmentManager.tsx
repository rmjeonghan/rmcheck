import React from 'react';
import { AcademyAssignment } from '@/types';
import { isPast, format } from 'date-fns';

type Props = {
  allAssignments: AcademyAssignment[];
  completedAssignmentIds: Set<string>;
  onStart: (assignment: AcademyAssignment) => void;
};

// 각 과제의 상태를 아이콘과 함께 표시하는 컴포넌트
const AssignmentItem: React.FC<{ 
  assignment: AcademyAssignment, 
  isCompleted: boolean, 
  isNext: boolean,
  isOverdue: boolean,
  onStart: (assignment: AcademyAssignment) => void 
}> = ({ assignment, isCompleted, isNext, isOverdue, onStart }) => {
  
  let statusIcon = '⏳';
  let statusColor = 'text-slate-500';
  let borderColor = 'border-slate-200';

  if (isCompleted) {
    statusIcon = '✅';
    statusColor = 'text-green-600';
    borderColor = 'border-green-200';
  } else if (isOverdue) {
    statusIcon = '❗️';
    statusColor = 'text-red-600';
    borderColor = 'border-red-200';
  } else if (isNext) {
    statusColor = 'text-primary';
    borderColor = 'border-primary';
  }

  return (
    <div className={`p-4 rounded-lg border-2 ${borderColor} bg-white transition-all`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={`text-2xl mr-3 ${statusColor}`}>{statusIcon}</span>
          <div>
            <h4 className={`font-bold ${statusColor}`}>{assignment.assignmentName}</h4>
            {assignment.dueDate && (
              <p className={`text-xs mt-1 ${isOverdue ? 'font-bold text-red-600' : 'text-slate-500'}`}>
                마감: {format(assignment.dueDate.toDate(), 'yyyy.MM.dd')}
              </p>
            )}
          </div>
        </div>
        {!isCompleted && (
          <button
            onClick={() => onStart(assignment)}
            disabled={!isNext}
            className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm
                       hover:bg-primary-hover transition-colors
                       disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isNext ? '과제 시작' : '대기'}
          </button>
        )}
      </div>
    </div>
  );
};


const AcademyAssignmentManager: React.FC<Props> = ({ allAssignments, completedAssignmentIds, onStart }) => {
  // 다음에 해야 할 과제를 찾습니다.
  const nextAssignment = allAssignments.find(
    (assignment) => !completedAssignmentIds.has(assignment.id)
  );

  // 등록된 과제가 없는 경우
  if (allAssignments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-center">
        <p className="text-slate-500">아직 등록된 과제가 없어요. 선생님께서 곧 과제를 등록해주실 거예요!</p>
      </div>
    );
  }

  // 모든 과제를 완료한 경우
  if (!nextAssignment) {
    return (
      <div className="bg-green-50 p-6 rounded-lg shadow-sm mb-8 text-center border-l-4 border-green-500">
        <p className="font-semibold text-green-800">모든 과제를 완료했어요! 정말 대단해요! 🎉</p>
      </div>
    );
  }

  // 과제 목록을 시각화하여 보여주는 경우
  return (
    <div className="bg-slate-50 p-6 rounded-lg shadow-sm mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">이번 주 과제 현황</h3>
      <div className="space-y-3">
        {allAssignments.map(assignment => {
          const isCompleted = completedAssignmentIds.has(assignment.id);
          const isOverdue = assignment.dueDate ? isPast(assignment.dueDate.toDate()) && !isCompleted : false;
          const isNext = assignment.id === nextAssignment?.id;

          return (
            <AssignmentItem 
              key={assignment.id}
              assignment={assignment}
              isCompleted={isCompleted}
              isNext={isNext}
              isOverdue={isOverdue}
              onStart={onStart}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AcademyAssignmentManager;
