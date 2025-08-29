'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import LoadingSpinner from './LoadingSpinner';

type JoinAcademyModalProps = {
  onClose: () => void;
  onConfirm: (academyName: string) => void;
};

interface Academy {
  id: string;
  name: string;
}

export default function JoinAcademyModal({ onClose, onConfirm }: JoinAcademyModalProps) {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademies = async () => {
      try {
        const q = query(collection(db, 'academies'), where('isDeleted', '!=', true), orderBy('name'));
        const querySnapshot = await getDocs(q);
        const academyList = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setAcademies(academyList);
      } catch (error) {
        console.error("학원 목록을 불러오는 데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAcademies();
  }, []);

  const handleConfirm = () => {
    if (selectedAcademy) {
      onConfirm(selectedAcademy);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">학원 가입 요청</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div>
              <label htmlFor="academy-select" className="block text-sm font-medium text-gray-700 mb-2">
                소속된 학원을 선택해주세요.
              </label>
              <select
                id="academy-select"
                value={selectedAcademy}
                onChange={(e) => setSelectedAcademy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">학원 선택...</option>
                {academies.map(academy => (
                  <option key={academy.id} value={academy.name}>{academy.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedAcademy || loading}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:bg-gray-400"
          >
            가입 요청
          </button>
        </div>
      </div>
    </div>
  );
}
