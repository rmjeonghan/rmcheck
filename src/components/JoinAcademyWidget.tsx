import React from 'react';
import { FaPlus } from 'react-icons/fa';

interface JoinAcademyWidgetProps {
  onJoinClick: () => void;
}

const JoinAcademyWidget: React.FC<JoinAcademyWidgetProps> = ({ onJoinClick }) => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center text-center mb-8">
      <div className="flex items-center justify-center bg-gray-300 text-white rounded-full w-12 h-12 mb-4">
        <FaPlus size={24} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">학원에 가입하시겠어요?</h2>
      <p className="text-gray-600 mb-4">
        소속된 학원이 있다면, 학원에서 내준 과제를 확인하고 학습할 수 있어요!
      </p>
      <button 
        onClick={onJoinClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        학원 가입 요청하기
      </button>
    </div>
  );
};

export default JoinAcademyWidget;