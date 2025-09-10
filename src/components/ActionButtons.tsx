"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Combine, ListRestart, LucideProps } from "lucide-react";
import React from "react";
import { QuizStartParams } from "@/app/page";
import QuestionCountSelectModal from "./QuestionCountSelectModal";
import ChapterSelectModal from "./ChapterSelectModal";
import ReviewModeModal from "./ReviewModeModal";

type QuizMode = NonNullable<QuizStartParams>["mode"];

interface ActionButtonsProps {
  onStartQuiz: (params: NonNullable<QuizStartParams>) => void;
  selectedUnitIds: string[];
  hasLearningPlan: boolean;
}

const ActionButtons = ({
  onStartQuiz,
  selectedUnitIds,
  hasLearningPlan,
}: ActionButtonsProps) => {
  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [isQuestionCountModalOpen, setQuestionCountModalOpen] = useState(false);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<QuizMode>("new");
  const [reviewMode, setReviewMode] = useState<"review_all" | "review_incorrect">("review_all");

  const handleNewQuizClick = (mode: "new" | "new_review") => {
    if (!hasLearningPlan) return; // 방어
    setCurrentMode(mode);
    setChapterModalOpen(true);
  };

  const handleReviewQuizClick = () => {
    if (!hasLearningPlan) return; // 방어
    setReviewModalOpen(true);
  };

  const handleChapterSelectConfirm = (selectedIds: string[], questionCount: number) => {
    setChapterModalOpen(false);
    onStartQuiz({ mode: currentMode, unitIds: selectedIds, questionCount });
  };

  const handleQuestionCountSelectConfirm = (questionCount: number) => {
    setChapterModalOpen(false);
    onStartQuiz({ mode: currentMode, unitIds: selectedUnitIds, questionCount });
  };

  const handleReviewModeSelect = (mode: "review_all" | "review_incorrect") => {
    setReviewMode(mode);
    setReviewModalOpen(false);
    setQuestionCountModalOpen(true);
    // onStartQuiz({ mode, unitIds: selectedUnitIds, questionCount: 30 });
  };

  const handleRevieModeQuestionCountSelectConfirm = (questionCount: number) => {
    setQuestionCountModalOpen(false);
    onStartQuiz({ mode: reviewMode, unitIds: selectedUnitIds, questionCount });
  };

  return (
    <>
      <div className="relative">
        {/* 버튼 영역 */}
        <div
          className={`grid grid-cols-3 gap-4 transition ${!hasLearningPlan ? "blur-sm pointer-events-none select-none" : ""
            }`}
        >
          <ActionButton
            label={
              <div className="flex flex-col items-center leading-tight">
                <span>신규</span>
                <span>문항</span>
              </div>
            }
            icon={Sparkles}
            color="from-blue-500 to-blue-400"
            onClick={() => handleNewQuizClick("new")}
          />
          <ActionButton
            label={
              <div className="flex flex-col items-start leading-tight -ml-2">
                <span className="pl-[0.5em]">신규</span>
                <span className="-ml-1">+복습</span>
              </div>
            }
            icon={Combine}
            color="from-purple-500 to-purple-400"
            onClick={() => handleNewQuizClick("new_review")}
          />
          <ActionButton
            label={
              <div className="flex flex-col items-center leading-tight">
                <span>자유</span>
                <span>복습</span>
              </div>
            }
            icon={ListRestart}
            color="from-green-500 to-green-400"
            onClick={handleReviewQuizClick}
          />
        </div>

        {/* 오버레이 */}
        {!hasLearningPlan && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 text-white text-center px-4 py-2 rounded-lg">
              학습계획을 설정하면 시험지를 생성할 수 있어요!<br />
              상단의 "학습계획 시작하기" 버튼을 눌러 시작해보세요.
            </div>
          </div>
        )}
      </div>

      <ChapterSelectModal
        isOpen={isChapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        onConfirm={handleChapterSelectConfirm}
        initialSelectedIds={selectedUnitIds}
        showQuestionCountSlider={true}
        forExam={true}
      />
      <ReviewModeModal
        isOpen={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSelect={handleReviewModeSelect}
      />
      <QuestionCountSelectModal
        isOpen={isQuestionCountModalOpen}
        onClose={() => setQuestionCountModalOpen(false)}
        onConfirm={handleRevieModeQuestionCountSelectConfirm}
        initialCount={30}
      />
    </>
  );
};

// --- 📍 타입 정의 ---
interface ActionButtonProps {
  label: React.ReactNode;
  icon: React.ComponentType<LucideProps>;
  color: string;
  onClick: () => void;
}

const ActionButton = ({
  label,
  icon: Icon,
  color,
  onClick,
}: ActionButtonProps) => (
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
