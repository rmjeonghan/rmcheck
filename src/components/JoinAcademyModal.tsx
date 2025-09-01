// src/components/JoinAcademyModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const JoinAcademyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [academies, setAcademies] = useState<{ id: string, name: string }[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAcademies = async () => {
      const snapshot = await getDocs(collection(db, 'academies'));
      const academyList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setAcademies(academyList);
    };
    if (isOpen) {
      fetchAcademies();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user || !selectedAcademy) {
      toast.error("학원을 선택해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const studentRef = doc(db, 'students', user.uid);
      await updateDoc(studentRef, {
        academyName: selectedAcademy,
        status: 'pending', // 관리자 승인을 위해 'pending' 상태로 변경
      });
      toast.success(`${selectedAcademy}에 가입을 요청했습니다!`);
      onClose();
    } catch (error) {
      toast.error("가입 요청 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div /* ... 모달 배경 ... */>
          <motion.div /* ... 모달 컨텐츠 ... */>
            <h2 className="text-xl font-bold mb-4">학원 등록하기</h2>
            <select
              value={selectedAcademy}
              onChange={(e) => setSelectedAcademy(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            >
              <option value="">학원을 선택하세요</option>
              {academies.map(academy => (
                <option key={academy.id} value={academy.name}>{academy.name}</option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-indigo-300"
            >
              {isLoading ? '요청 중...' : '가입 요청하기'}
            </button>
            <button onClick={onClose} className="mt-4 text-sm text-slate-500">다음에 할게요</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default JoinAcademyModal;