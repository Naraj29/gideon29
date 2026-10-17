import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Coffee,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import timetableService from '../services/timetableService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimetableDashboard() {
  const [timetable, setTimetable] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBlock, setNewBlock] = useState({
    subject: '',
    day_of_week: 0,
    start_time: '09:00',
    end_time: '10:00',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const data = await timetableService.getSchedules();
      if (data.results && data.results.length > 0) {
        setTimetable(data.results[0]);
        fetchBlocks(data.results[0].id);
      } else {
        // Create default if none exists
        const newTT = await timetableService.createSchedule({ title: "Primary Schedule" });
        setTimetable(newTT);
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to fetch timetable', err);
      setLoading(false);
    }
  };

  const fetchBlocks = async (ttId) => {
    try {
      const data = await timetableService.getBlocks({ timetable: ttId });
      setBlocks(data.results || data);
    } catch (err) {
      console.error('Failed to fetch blocks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    if (!newBlock.subject || !timetable) return;
    try {
      await timetableService.createBlock({ ...newBlock, timetable: timetable.id });
      setNewBlock({ ...newBlock, subject: '' });
      setIsAdding(false);
      fetchBlocks(timetable.id);
    } catch (err) {
      console.error('Failed to add block', err);
    }
  };

  const handleDeleteBlock = async (id) => {
    try {
      await timetableService.deleteBlock(id);
      fetchBlocks(timetable.id);
    } catch (err) {
      console.error('Failed to delete block', err);
    }
  };

  // Convert "HH:MM:SS" or "HH:MM" to minutes for positioning
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const getBlockStyle = (block) => {
    const start = timeToMinutes(block.start_time);
    const end = timeToMinutes(block.end_time);
    const duration = end - start;
    
    // Each hour is 80px high in our grid
    const top = (start / 60) * 80;
    const height = (duration / 60) * 80;
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: `${block.color}20`, // 20% opacity
      borderColor: block.color,
    };
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      {/* Tool Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
           <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20"
          >
            <LayoutGrid className="w-6 h-6 text-black" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black tracking-tight text-white mb-2"
          >
            Tactical <span className="text-amber-500">Timetable</span>
          </motion.h1>
          <p className="text-zinc-500 text-sm font-medium tracking-wide">Design your daily flow with military precision.</p>
        </div>

        <button 
          onClick={() => setIsAdding(true)}
          className="btn-premium btn-primary px-8 h-14 rounded-2xl text-xs font-bold shrink-0"
        >
          <Plus size={18} /> Insert Routine Block
        </button>
      </header>

      {/* Main Timetable View */}
      <div className="relative glass rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl bg-black/20">
        
        {/* Horizontal Header (Days) */}
        <div className="flex border-b border-white/10 bg-white/5 sticky top-0 z-30 backdrop-blur-3xl">
           <div className="w-20 border-r border-white/10 shrink-0" />
           {DAYS.map((day, i) => (
             <div key={i} className="flex-1 py-4 text-center border-r border-white/5 last:border-r-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{day}</span>
             </div>
           ))}
        </div>

        {/* Scrollable Container */}
        <div className="flex h-[800px] overflow-y-auto scrollbar-premium relative">
           
           {/* Time Column */}
           <div className="w-20 border-r border-white/10 bg-white/[0.02] shrink-0 sticky left-0 z-20 backdrop-blur-md">
              {HOURS.map(h => (
                <div key={h} className="h-20 border-b border-white/5 flex items-center justify-center">
                   <span className="text-[10px] font-bold text-zinc-600">{h}:00</span>
                </div>
              ))}
           </div>

           {/* Grid Columns */}
           <div className="flex-1 flex relative">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                 {HOURS.map(h => (
                   <div key={h} className="h-20 border-b border-white/[0.03] w-full" />
                 ))}
                 <div className="flex h-full w-full">
                    {DAYS.map((_, i) => (
                      <div key={i} className="flex-1 border-r border-white/[0.03] last:border-r-0" />
                    ))}
                 </div>
              </div>

              {/* Data Columns */}
              {DAYS.map((_, dayIndex) => (
                <div key={dayIndex} className="flex-1 relative">
                   <AnimatePresence>
                      {blocks.filter(b => b.day_of_week === dayIndex).map(block => (
                         <motion.div
                           key={block.id}
                           initial={{ opacity: 0, scale: 0.9 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.9 }}
                           style={getBlockStyle(block)}
                           className="absolute left-1 right-1 rounded-2xl border-2 flex flex-col p-3 shadow-xl z-10 hover:z-20 transition-all cursor-pointer group backdrop-blur-sm"
                         >
                            <div className="flex items-start justify-between gap-1 mb-1">
                               <div className="font-black text-[10px] md:text-xs text-white leading-tight break-words uppercase tracking-tighter">
                                  {block.subject}
                               </div>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                                 className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/40 rounded-lg text-white/60 hover:text-red-500"
                               >
                                  <Trash2 size={12} />
                               </button>
                            </div>
                            <div className="text-[9px] font-bold text-white/40 flex items-center gap-1 mt-auto">
                               <Clock size={10} /> {block.start_time.substring(0,5)} - {block.end_time.substring(0,5)}
                            </div>
                         </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
         {isAdding && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                onClick={() => setIsAdding(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl glass rounded-[3rem] border border-white/10 p-8 md:p-12 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Clock size={200} />
                 </div>

                 <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                    <Zap className="text-amber-500" /> New Task Block
                 </h2>

                 <form onSubmit={handleAddBlock} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Subject / Category</label>
                       <input 
                         autoFocus
                         type="text" 
                         placeholder="e.g., Deep Work, Physics Study, Gym"
                         value={newBlock.subject}
                         onChange={e => setNewBlock({...newBlock, subject: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Day of Week</label>
                          <select 
                            value={newBlock.day_of_week}
                            onChange={e => setNewBlock({...newBlock, day_of_week: parseInt(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 appearance-none"
                          >
                             {DAYS.map((d, i) => <option key={i} value={i} className="bg-zinc-900">{d}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Theme Color</label>
                          <div className="flex items-center gap-2 mt-1">
                             {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f43f5e'].map(c => (
                                <button 
                                  key={c}
                                  type="button"
                                  onClick={() => setNewBlock({...newBlock, color: c})}
                                  className={`w-10 h-10 rounded-xl transition-all ${newBlock.color === c ? 'scale-110 shadow-lg shadow-black/40 ring-2 ring-white/20' : 'opacity-40 hover:opacity-100'}`}
                                  style={{ backgroundColor: c }}
                                />
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Start Time</label>
                          <input 
                            type="time" 
                            value={newBlock.start_time}
                            onChange={e => setNewBlock({...newBlock, start_time: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">End Time</label>
                          <input 
                            type="time" 
                            value={newBlock.end_time}
                            onChange={e => setNewBlock({...newBlock, end_time: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                          />
                       </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                       <button 
                         type="button" 
                         onClick={() => setIsAdding(false)}
                         className="flex-1 h-14 rounded-2xl bg-white/5 text-zinc-400 font-bold hover:text-white"
                       >
                          Discard
                       </button>
                       <button 
                         type="submit" 
                         className="flex-1 h-14 rounded-2xl bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20"
                       >
                          Deploy Block
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
