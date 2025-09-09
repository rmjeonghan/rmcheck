// src/components/Dashboard.tsx
"use client";

// ▼▼▼ 1. useEffect, doc, getDoc, db, useAuth를 import합니다. ▼▼▼
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";

import { motion } from "framer-motion";
import Header from "./Header";
import AcademyAssignmentWidget from "./AcademyAssignmentWidget";
import ActionButtons from "./ActionButtons";
import SetupPromptWidget from "./SetupPromptWidget";
import { useLearningPlan, getKSTThursday } from "@/hooks/useLearningPlan";
import LoadingSpinner from "./LoadingSpinner";
import LearningPlanSetupModal from "./LearningPlanSetupModal";
import CurrentPlanWidget from "./CurrentPlanWidget";
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
  const { plan, hasLearningPlan, isLoading: isPlanLoading } = useLearningPlan();
  const [isModalOpen, setModalOpen] = useState(false);

  // ▼▼▼ 2. useAuth를 사용하고, 학원 등록 여부와 관련 로딩 상태를 추가합니다. ▼▼▼
  const { user } = useAuth();
  const [isEnrolledInAcademy, setIsEnrolledInAcademy] = useState(false);
  const [isEnrollmentLoading, setIsEnrollmentLoading] = useState(true);

  // ▼▼▼ 3. 사용자의 학원 등록 상태를 확인하는 로직을 추가합니다. ▼▼▼
  useEffect(() => {
    // 사용자가 로그인 상태가 아니면 로딩을 멈춥니다.
    if (!user) {
      setIsEnrollmentLoading(false);
      return;
    }

    const checkEnrollmentStatus = async () => {
      try {
        const studentDocRef = doc(db, 'students', user.uid);
        const studentDoc = await getDoc(studentDocRef);
        const status = studentDoc.data()?.status || 'false';

        // 학생 정보가 존재하고, academyName 필드가 있으면 등록된 것으로 간주합니다.
        if (studentDoc.exists() && studentDoc.data().academyName && status == "active") {
          setIsEnrolledInAcademy(true);
        }
      } catch (error) {
        console.error("학원 등록 정보 조회 중 오류 발생:", error);
        // 에러가 발생해도 위젯을 숨기지 않도록 기본값 false를 유지합니다.
      } finally {
        setIsEnrollmentLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [user]); // user 객체가 변경될 때마다 실행됩니다.

  // ▼▼▼ 4. 학습 계획 로딩과 학원 등록 정보 로딩 상태를 모두 확인합니다. ▼▼▼
  if (isPlanLoading || isEnrollmentLoading) {
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
          {/* ▼▼▼ 5. isEnrolledInAcademy가 true일 때만 위젯을 렌더링합니다. ▼▼▼ */}
          {isEnrolledInAcademy && (
            <motion.div variants={itemVariants}>
              <AcademyAssignmentWidget onStartQuiz={onStartQuiz} />
            </motion.div>
          )}

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
            <ActionButtons onStartQuiz={onStartQuiz} selectedUnitIds={plan?.weeklyPlans?.[getKSTThursday()]?.unitIds ?? []} hasLearningPlan={hasLearningPlan} />
          </motion.div>
        </motion.main>
      </div>

      <LearningPlanSetupModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={plan}
      />
    </>
  );
};

export default Dashboard;