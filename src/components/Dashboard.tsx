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
import { QuizStartParams } from "@/app/page";

interface DashboardProps {
  onStartQuiz: (params: QuizStartParams) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const Dashboard = ({ onStartQuiz }: DashboardProps) => {
  const { hasLearningPlan, isLoading } = useLearningPlan();
  const [isSetupModalOpen, setSetupModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="bg-slate-100 min-h-screen">
        <Header />
        <motion.main
          className="p-4 sm:p-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            {/* --- 📍 여기에 onStartQuiz를 전달합니다 --- */}
            <AcademyAssignmentWidget onStartQuiz={onStartQuiz} />
          </motion.div>
          
          {hasLearningPlan ? (
            <motion.div variants={itemVariants}>
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                   <h2 className="text-lg font-bold">나의 학습 계획</h2>
                   <p className="text-slate-500 mt-2">학습 계획 위젯이 여기에 표시됩니다.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <SetupPromptWidget onSetupClick={() => setSetupModalOpen(true)} />
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <ActionButtons onStartQuiz={onStartQuiz} />
          </motion.div>
        </motion.main>
      </div>

      <LearningPlanSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;