import React, { useState } from 'react';
import { 
  Heart, 
  DollarSign, 
  Briefcase, 
  Users, 
  Brain, 
  Target,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const categories = [
  { id: 'health', name: 'Health', icon: Heart, color: 'text-rose-500' },
  { id: 'wealth', name: 'Wealth', icon: DollarSign, color: 'text-emerald-500' },
  { id: 'career', name: 'Career', icon: Briefcase, color: 'text-blue-500' },
  { id: 'relationships', name: 'Relationships', icon: Users, color: 'text-purple-500' },
  { id: 'growth', name: 'Growth', icon: Brain, color: 'text-amber-500' },
  { id: 'goals', name: 'Goals', icon: Target, color: 'text-cyan-500' },
];

export default function CategoryBar() {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <>
      {/* Vertical Category Bar */}
      <div className="fixed left-[18rem] xl:left-[20rem] top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isDark 
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                  : 'bg-black/5 border border-black/10 hover:bg-black/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-white/5' : 'bg-black/5'
              }`}>
                <Icon size={18} className={category.color} />
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${
                isDark ? 'text-white' : 'text-black'
              }`}>
                {category.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={() => setActiveCategory(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-2xl border shadow-2xl ${
                isDark 
                  ? 'bg-[#09090b] border-white/10' 
                  : 'bg-white border-black/10'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-white/10' : 'border-black/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-white/5' : 'bg-black/5'
                  }`}>
                    {React.createElement(activeCategory.icon, { 
                      size: 20, 
                      className: activeCategory.color 
                    })}
                  </div>
                  <h2 className={`text-xl font-bold ${
                    isDark ? 'text-white' : 'text-black'
                  }`}>
                    {activeCategory.name}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'hover:bg-white/5 text-zinc-400 hover:text-white' 
                      : 'hover:bg-black/5 text-slate-400 hover:text-black'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className={`text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  <p className="mb-4">
                    Welcome to your {activeCategory.name.toLowerCase()} dashboard. 
                    This is a professional template for managing your {activeCategory.name.toLowerCase()} goals and activities.
                  </p>
                  <p>
                    Features coming soon:
                  </p>
                  <ul className={`mt-2 space-y-2 ml-4 ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    <li>• Personalized insights and analytics</li>
                    <li>• Goal tracking and progress monitoring</li>
                    <li>• AI-powered recommendations</li>
                    <li>• Integration with other tools</li>
                  </ul>
                </div>

                {/* Action Button */}
                <button className={`w-full py-3 rounded-xl font-medium transition-all ${
                  isDark 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-black text-white hover:bg-black/90'
                }`}>
                  Get Started with {activeCategory.name}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
