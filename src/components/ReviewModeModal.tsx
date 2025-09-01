// src/components/ReviewModeModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

interface ReviewModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mode: 'review_all' | 'review_incorrect') => void;
}

const ReviewModeModal = ({ isOpen, onClose, onSelect }: ReviewModeModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div /* ... 모달 배경 ... */ >
          <motion.div /* ... 모달 컨텐츠 ... */ >
            <h2 className="text-xl font-bold mb-6 text-center">자유 복습 모드 선택</h2>
            <div className="space-y-4">
              <button
                onClick={() => onSelect('review_all')}
                className="w-full p-4 bg-blue-100 text-blue-800 font-semibold rounded-lg flex items-center justify-center hover:bg-blue-200"
              >
                <Check className="w-5 h-5 mr-2" /> 맞은 문항도 복습하기
              </button>
              <button
                onClick={() => onSelect('review_incorrect')}
                className="w-full p-4 bg-red-100 text-red-800 font-semibold rounded-lg flex items-center justify-center hover:bg-red-200"
              >
                <X className="w-5 h-5 mr-2" /> 틀린 문항만 복습하기
              </button>
            </div>
            <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:underline">닫기</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModeModal;