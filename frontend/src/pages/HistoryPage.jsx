import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  BookHeart, 
  Flag, 
  Sparkles, 
  ChevronRight,
  History as HistoryIcon,
  CheckCircle2,
  CalendarDays,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import unifiedService from '../lib/unifiedService';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';
import FloatingGideonButton from '../components/FloatingGideonButton';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await unifiedService.getHistory(50);
      setHistory(data.results || data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'diary': return <BookHeart className="w-5 h-5 text-amber-500" />;
      case 'task_completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'calendar_event': return <CalendarDays className="w-5 h-5 text-blue-500" />;
      case 'life_tracker': return <HeartPulse className="w-5 h-5 text-teal-500" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'diary': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'task_completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'calendar_event': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'life_tracker': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      default: return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    }
  };

  const handleNavigate = (item) => {
    if (item.type === 'diary') navigate(`/tools/diary/entry/${item.id}`);
    if (item.type === 'task_completed') navigate(`/tools/planner/project/${item.meta.project_id}`);
    if (item.type === 'calendar_event') navigate(`/tools/calendar`);
    if (item.type === 'life_tracker') navigate(`/tools/lifetracker`);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 border border-white/10"
        >
          <Clock className="w-10 h-10 text-white" />
        </motion.div>
        
        <h1 className={`text-5xl font-bold tracking-tight mb-4 ${
          isDark ? 'text-white' : 'text-[#1A1A1A]'
        }`}>
          Time <span className="text-blue-500">Capsule</span>
        </h1>
        <p className={`text-lg ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Your journey, preserved in a unified timeline.</p>
      </header>

      {loading ? (
         <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className={`font-medium ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Opening the capsule...</p>
         </div>
      ) : history.length === 0 ? (
        <div className={`glass rounded-[3rem] p-20 text-center border ${
          isDark ? 'border-white/5' : 'border-black/5'
        }`}>
          <HistoryIcon className={`w-16 h-16 mx-auto mb-6 ${isDark ? 'text-zinc-700' : 'text-slate-700'}`} />
          <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>The capsule is empty</h3>
          <p className={isDark ? 'text-zinc-500' : 'text-slate-600'}>Activities across your tools will appear here as you grow.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className={`absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b ${
            isDark ? 'from-blue-500/50 via-white/5' : 'from-blue-500/50 via-black/5'
          } to-transparent`} />

          <div className="space-y-12">
            {history.map((item, idx) => (
              <motion.div 
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-24 group"
              >
                {/* Timeline Dot/Icon */}
                <div className={`absolute left-0 top-0 w-16 h-16 rounded-2xl border flex items-center justify-center z-10 shadow-xl group-hover:border-blue-500/50 transition-colors ${
                  isDark ? 'bg-[#1c1c1e] border-white/10' : 'bg-slate-200 border-black/10'
                }`}>
                   {getIcon(item.type)}
                </div>

                <div 
                  onClick={() => handleNavigate(item)}
                  className={`card-premium p-8 cursor-pointer border hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isDark ? 'border-white/5' : 'border-black/5'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getBadgeStyle(item.type)}`}>
                          {item.type.replace('_', ' ')}
                       </span>
                       <span className={`text-xs font-medium ${
                         isDark ? 'text-zinc-500' : 'text-slate-600'
                       }`}>
                          {format(new Date(item.timestamp), 'MMM d, yyyy • h:mm a')}
                       </span>
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors ${
                      isDark ? 'text-white' : 'text-[#1A1A1A]'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`line-clamp-2 italic ${
                      isDark ? 'text-zinc-500' : 'text-slate-600'
                    }`}>
                       "{item.preview}"
                    </p>
                  </div>

                  <div className={`flex items-center gap-4 transition-colors ${
                    isDark ? 'text-zinc-600 group-hover:text-white' : 'text-slate-600 group-hover:text-black'
                  }`}>
                     <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Details</span>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                       isDark ? 'bg-white/5' : 'bg-black/5'
                     }`}>
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <FloatingGideonButton />
    </div>
  );
}
