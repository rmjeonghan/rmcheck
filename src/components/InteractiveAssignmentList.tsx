// src/components/InteractiveAssignmentList.tsx
import { AcademyAssignment } from '@/types';
import { isPast, format } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle } from 'lucide-react';

type Props = {
  assignments: AcademyAssignment[];
  completedIds: Set<string>;
  onStart: (assignment: AcademyAssignment) => void;
};

export default function InteractiveAssignmentList({ assignments, completedIds, onStart }: Props) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const nextAssignmentId = assignments.find(a => !completedIds.has(a.id))?.id;
  
  return (
    <motion.div
      className="bg-white p-6 rounded-2xl shadow-md"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">학원 과제</h3>
      {assignments.length > 0 ? (
        <ul className="space-y-3">
          {assignments.map(assignment => {
            const isCompleted = completedIds.has(assignment.id);
            const isOverdue = !isCompleted && assignment.dueDate && isPast(assignment.dueDate.toDate());
            const isNext = assignment.id === nextAssignmentId;
            
            let Icon = Clock;
            let iconColor = "text-gray-400";
            if (isCompleted) { Icon = Check; iconColor = "text-green-500"; }
            if (isOverdue) { Icon = AlertTriangle; iconColor = "text-red-500"; }
            
            return (
              <motion.li
                key={assignment.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${isNext ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={iconColor} />
                  <div>
                    <p className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {assignment.assignmentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      마감: {format(assignment.dueDate.toDate(), 'yyyy.MM.dd')}
                    </p>
                  </div>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => onStart(assignment)}
                    disabled={!isNext}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isNext ? '시작' : '대기'}
                  </button>
                )}
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">아직 등록된 과제가 없어요.</p>
        </div>
      )}
    </motion.div>
  );
}