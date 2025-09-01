"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Combine, ListRestart, LucideProps } from "lucide-react";
import React from "react";
import { QuizStartParams } from "@/app/page";
import ChapterSelectModal from "./ChapterSelectModal";
import ReviewModeModal from "./ReviewModeModal";

type QuizMode = NonNullable<QuizStartParams>['mode'];

interface ActionButtonsProps {
  onStartQuiz: (params: NonNullable<QuizStartParams>) => void;
}

const ActionButtons = ({ onStartQuiz }: ActionButtonsProps) => {
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<QuizMode>('new');

  const handleNewQuizClick = (mode: 'new' | 'new_review') => {
    setCurrentMode(mode);
    setChapterModalOpen(true);
  };

  const handleReviewQuizClick = () => {
    setReviewModalOpen(true);
  };

  const handleChapterSelectConfirm = (selectedIds: string[], questionCount: number) => {
    setChapterModalOpen(false);
    onStartQuiz({ mode: currentMode, unitIds: selectedIds, questionCount });
  };

  const handleReviewModeSelect = (mode: 'review_all' | 'review_incorrect') => {
    setReviewModalOpen(false);
    onStartQuiz({ mode, unitIds: [], questionCount: 30 });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionButton
          label="신규 문항"
          icon={Sparkles}
          color="from-blue-500 to-blue-400"
          onClick={() => handleNewQuizClick('new')}
        />
        <ActionButton
          label="신규+복습"
          icon={Combine}
          color="from-purple-500 to-purple-400"
          onClick={() => handleNewQuizClick('new_review')}
        />
        <ActionButton
          label="자유 복습"
          icon={ListRestart}
          color="from-green-500 to-green-400"
          onClick={handleReviewQuizClick}
        />
      </div>

      <ChapterSelectModal
        isOpen={isChapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        onConfirm={handleChapterSelectConfirm}
        initialSelectedIds={[]}
        showQuestionCountSlider={true}
      />
      <ReviewModeModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSelect={handleReviewModeSelect}
      />
    </>
  );
};


// --- 📍 타입 정의 추가 ---
interface ActionButtonProps {
    label: string;
    icon: React.ComponentType<LucideProps>;
    color: string;
    onClick: () => void;
}

// 재사용성을 위한 버튼 컴포넌트
const ActionButton = ({ label, icon: Icon, color, onClick }: ActionButtonProps) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.95 }}
    className={`flex flex-col items-center justify-center p-6 rounded-xl text-white font-bold text-lg shadow-lg bg-gradient-to-br ${color}`}
  >
    <Icon className="w-8 h-8 mb-2" />
    {label}
  </motion.button>
);

export default ActionButtons;