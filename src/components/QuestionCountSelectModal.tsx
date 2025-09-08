// src/components/QuestionCounterSelectModal.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface QuestionCounterSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (questionCount: number) => void;
    initialCount?: number; // 기본 문항 수
}

const QuestionCounterSelectModal = ({
    isOpen,
    onClose,
    onConfirm,
    initialCount = 30,
}: QuestionCounterSelectModalProps) => {
    const [questionCount, setQuestionCount] = useState(initialCount);

    // 모달이 열릴 때 초기값 동기화
    useEffect(() => {
        if (isOpen) {
            setQuestionCount(initialCount);
        }
    }, [isOpen, initialCount]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold">문항 수 선택</h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-slate-100"
                            >
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* Body: 슬라이더 */}
                        <div className="p-6">
                            <label
                                htmlFor="questionCount"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                문항 수:{" "}
                                <span className="font-bold text-indigo-600">
                                    {questionCount}
                                </span>
                            </label>
                            <input
                                id="questionCount"
                                type="range"
                                min="10"
                                max="50"
                                step="5"
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t flex justify-end">
                            <button
                                onClick={() => onConfirm(questionCount)}
                                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                            >
                                확인
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuestionCounterSelectModal;
