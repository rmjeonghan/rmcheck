// src/components/LoadingSpinner.tsx
"use client";
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
          repeat: Infinity,
          ease: 'linear',
          duration: 1,
        }}
      />
    </div>
  );
};

// const LoadingSpinner = () => {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-50">
//       <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
//     </div>
//   );

// };

// const LoadingSpinner = () => {
//   return <p>Loading...</p>;

// };

export default LoadingSpinner;