import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

interface SetupPromptWidgetProps {
  onSetupClick: () => void;
}

const SetupPromptWidget: React.FC<SetupPromptWidgetProps> = ({ onSetupClick }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center mb-8">
      <div className="flex items-center justify-center bg-gray-200 text-gray-600 rounded-full w-12 h-12 mb-4">
        <FaCalendarAlt size={24} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">학습 계획을 설정해 보세요!</h2>
      <p className="text-gray-600 mb-4">
        계획에 맞춰 학습하고, 꾸준히 실력을 쌓을 수 있습니다.
      </p>
      <button 
        onClick={onSetupClick}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        계획 설정하기
      </button>
    </div>
  );
};

export default SetupPromptWidget;