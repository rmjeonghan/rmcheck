// src/components/JoinAcademyWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { School, Check, Clock } from "lucide-react";
import JoinAcademyModal from "./JoinAcademyModal";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuth } from "@/context/AuthContext";
import { Student } from "@/types";

const JoinAcademyWidget = () => {
  const { user } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, "students", user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStudentInfo({ uid: docSnap.id, ...docSnap.data() } as Student);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const getStatusContent = () => {
    if (!studentInfo) return <p>계정 정보에 문제가 생겼습니다. 관리자에게 문의해주세요.</p>;
    if (studentInfo.academyName) {
      if (studentInfo.status === 'active') {
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Check size={20} />
            <span className="font-semibold">{studentInfo.academyName} 소속</span>
          </div>
        );
      }
      if (studentInfo.status === 'pending') {
        return (
          <div className="flex items-center space-x-2 text-orange-500">
            <Clock size={20} />
            <span className="font-semibold">{studentInfo.academyName} 승인 대기중</span>
          </div>
        );
      }
    }
    return (
      <button
        onClick={() => setModalOpen(true)}
        className="text-indigo-600 font-semibold hover:underline"
      >
        학원 등록하고 맞춤 과제 받아보기
      </button>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-md"
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-full">
            <School className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">학원 등록</h2>
            <div className="text-sm text-slate-500 mt-1">{getStatusContent()}</div>
          </div>
        </div>
      </motion.div>
      <JoinAcademyModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default JoinAcademyWidget;