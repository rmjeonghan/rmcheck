// src/components/Dashboard.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import AcademyAssignmentWidget from "./AcademyAssignmentWidget";
import ActionButtons from "./ActionButtons";
import SetupPromptWidget from "./SetupPromptWidget";
import { useLearningPlan } from "@/hooks/useLearningPlan";
import LoadingSpinner from "./LoadingSpinner";
import LearningPlanSetupModal from "./LearningPlanSetupModal";
import CurrentPlanWidget from "./CurrentPlanWidget"; // CurrentPlanWidget을 import합니다.
import { QuizStartParams } from "@/app/page";

interface DashboardProps {
  onStartQuiz: (params: QuizStartParams) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Dashboard = ({ onStartQuiz }: DashboardProps) => {
  // ▼▼▼ plan을 useLearningPlan 훅에서 가져옵니다. ▼▼▼
  const { plan, hasLearningPlan, isLoading } = useLearningPlan();
  const [isModalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleEditPlan = () => {
    setModalOpen(true);
  };

  return (
    <>
      <div className="bg-slate-100 h-full">
        <Header />
        <motion.main
          className="p-4 sm:p-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <AcademyAssignmentWidget onStartQuiz={onStartQuiz} />
          </motion.div>
          
          {/* ▼▼▼ plan이 null이 아닐 때만 CurrentPlanWidget을 렌더링하도록 수정합니다. ▼▼▼ */}
          {hasLearningPlan && plan ? (
            <motion.div variants={itemVariants}>
              <CurrentPlanWidget plan={plan} onEdit={handleEditPlan} />
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <SetupPromptWidget onSetupClick={() => setModalOpen(true)} />
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <ActionButtons onStartQuiz={onStartQuiz} />
          </motion.div>
        </motion.main>
      </div>
      
      {/* 모달이 열릴 때 plan 데이터를 initialPlan으로 전달합니다. */}
      <LearningPlanSetupModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={plan}
      />
    </>
  );
};

export default Dashboard;

