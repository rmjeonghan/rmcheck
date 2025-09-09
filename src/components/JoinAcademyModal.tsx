"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { collection, getDocs } from "firebase/firestore";

// Academy 타입을 명확히 정의
interface Academy {
  id: string;
  name: string;
}

const JoinAcademyModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user } = useAuth();
  const [academies, setAcademies] = useState<Academy[]>([]);
  // ✅ state를 ID를 저장하도록 변경
  const [selectedAcademyId, setSelectedAcademyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAcademies = async () => {
      const snapshot = await getDocs(collection(db, 'academies'));
      const academyList = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
      setAcademies(academyList);
    };
    if (isOpen) {
      fetchAcademies();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!user || !selectedAcademyId) {
      toast.error("학원을 선택해주세요.");
      return;
    }

    // ✅ ID를 사용해 선택된 학원 정보 전체를 찾습니다.
    const selectedAcademy = academies.find(a => a.id === selectedAcademyId);
    if (!selectedAcademy) {
        toast.error("선택한 학원 정보를 찾을 수 없습니다.");
        return;
    }

    setIsLoading(true);
    try {
      const studentRef = doc(db, 'students', user.uid);
      
      // ✅ academyId와 academyName을 모두 업데이트합니다.
      await updateDoc(studentRef, {
        academyId: selectedAcademy.id,
        academyName: selectedAcademy.name,
        status: 'pending', // 관리자 승인을 위해 'pending' 상태로 변경
      });

      toast.success(`${selectedAcademy.name}에 가입을 요청했습니다!`);
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
        <motion.div 
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <h2 className="text-xl font-bold mb-4">학원 등록하기</h2>
            <select
              // ✅ value와 onChange를 selectedAcademyId에 맞게 수정
              value={selectedAcademyId}
              onChange={(e) => setSelectedAcademyId(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 bg-white"
            >
              <option value="">학원을 선택하세요</option>
              {academies.map(academy => (
                // ✅ option의 value를 academy.id로 변경
                <option key={academy.id} value={academy.id}>
                  {academy.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-indigo-300 transition-colors"
            >
              {isLoading ? '요청 중...' : '가입 요청하기'}
            </button>
            <button onClick={onClose} className="mt-4 text-sm text-slate-500 w-full text-center">다음에 할게요</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default JoinAcademyModal;