// src/components/ActionPromptCard.tsx
import { motion } from 'framer-motion';

interface ActionPromptCardProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export default function ActionPromptCard({ title, description, buttonText, onClick }: ActionPromptCardProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg"
      variants={itemVariants}
    >
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-blue-100">{description}</p>
      <button 
        onClick={onClick}
        className="mt-6 w-full bg-white text-blue-500 font-bold py-2.5 px-4 rounded-lg text-sm transition-transform hover:scale-105"
      >
        {buttonText}
      </button>
    </motion.div>
  );
}