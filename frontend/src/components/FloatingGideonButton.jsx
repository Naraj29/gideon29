import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function FloatingGideonButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/ai')}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:bottom-8 z-50 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center"
    >
      <Sparkles size={24} className="lg:size-28 animate-pulse" />
    </motion.button>
  );
}
