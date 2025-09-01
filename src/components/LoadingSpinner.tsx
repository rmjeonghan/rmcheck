// src/components/LoadingSpinner.tsx
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <motion.div
        style={{
          width: 50,
          height: 50,
          border: '5px solid #e9e9e9',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: 'linear',
          duration: 1,
        }}
      />
    </div>
  );
};

export default LoadingSpinner;