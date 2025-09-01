// src/components/QuizHeader.tsx
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizHeaderProps {
  current: number;
  total: number;
  onExit: () => void;
}

const QuizHeader = ({ current, total, onExit }: QuizHeaderProps) => {
  const progress = (current / total) * 100;

  return (
    <header className="p-4 bg-white shadow-sm w-full">
      <div className="flex items-center justify-between gap-4">
        <button onClick={onExit} className="p-2 rounded-full hover:bg-slate-100">
          <X className="w-6 h-6 text-slate-500" />
        </button>
        <div className="flex-grow bg-slate-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="bg-green-400 h-full rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <span className="font-bold text-slate-600 w-12 text-right">
          {current}/{total}
        </span>
      </div>
    </header>
  );
};

export default QuizHeader;