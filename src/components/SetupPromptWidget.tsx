// src/components/SetupPromptWidget.tsx
"use client";

import { motion } from "framer-motion";
import { ListPlus } from "lucide-react";

interface SetupPromptWidgetProps {
  onSetupClick: () => void;
}

const SetupPromptWidget = ({ onSetupClick }: SetupPromptWidgetProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        나만의 학습 계획을 만들어보세요!
      </h2>
      <p className="text-slate-500 mb-6">
        AI가 목표에 맞춰 최적의 학습 경로를 추천해 드려요.
      </p>
      <motion.button
        onClick={onSetupClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg shadow-lg"
      >
        <ListPlus className="w-6 h-6 mr-2" />
        학습 계획 시작하기
      </motion.button>
    </div>
  );
};

export default SetupPromptWidget;