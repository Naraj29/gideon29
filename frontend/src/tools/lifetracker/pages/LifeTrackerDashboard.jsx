import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  HeartPulse, 
  Droplet, 
  Moon, 
  Activity, 
  Target, 
  Smile, 
  Frown, 
  Meh, 
  PenTool,
  Calendar,
  CloudLightning,
  CloudRain,
  History,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import lifeTrackerService from '../services/lifeTrackerService';

// Utilities
const getTodayString = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local

const MOODS = [
  { id: 'exceptional', icon: <Smile className="text-emerald-400" size={32} />, label: 'Exceptional', color: 'bg-emerald-500/20 border-emerald-500/50' },
  { id: 'good', icon: <Smile size={32} />, label: 'Good', color: 'bg-teal-500/20 border-teal-500/50' },
  { id: 'neutral', icon: <Meh size={32} />, label: 'Neutral', color: 'bg-zinc-500/20 border-zinc-500/50' },
  { id: 'bad', icon: <Frown size={32} />, label: 'Bad', color: 'bg-orange-500/20 border-orange-500/50' },
  { id: 'terrible', icon: <CloudLightning size={32} />, label: 'Terrible', color: 'bg-red-500/20 border-red-500/50' },
];

export default function LifeTrackerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Today's Record State
  const [recordId, setRecordId] = useState(null);
  const [todayData, setTodayData] = useState({
    date: getTodayString(),
    mood: 'none',
    sleep_hours: 0,
    hydration: 0,
    exercise_minutes: 0,
    productivity_score: 0,
    notes: ''
  });

  // History State
  const [history, setHistory] = useState([]);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    initializeTracker();
  }, []);

  const initializeTracker = async () => {
    try {
      const todayStr = getTodayString();
      const todayRec = await lifeTrackerService.getTodayRecord(todayStr);
      
      if (todayRec) {
        setRecordId(todayRec.id);
        setTodayData({
          date: todayRec.date,
          mood: todayRec.mood,
          sleep_hours: todayRec.sleep_hours,
          hydration: todayRec.hydration,
          exercise_minutes: todayRec.exercise_minutes,
          productivity_score: todayRec.productivity_score,
          notes: todayRec.notes
        });
      }

      fetchHistory();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const hist = await lifeTrackerService.getHistoryRecords();
      setHistory(hist.results || hist);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Auto-Save Logic ---
  const handleUpdate = (field, value) => {
    const newData = { ...todayData, [field]: value };
    setTodayData(newData);
    
    // Clear existing timeout
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    
    // Set a new timeout to save after 1 second of inactivity
    setSaving(true);
    debounceTimeout.current = setTimeout(() => {
      saveRecord(newData);
    }, 1000);
  };

  const saveRecord = async (dataToSave) => {
    try {
      let savedRec;
      if (recordId) {
        savedRec = await lifeTrackerService.updateRecord(recordId, dataToSave);
      } else {
        savedRec = await lifeTrackerService.createRecord(dataToSave);
        setRecordId(savedRec.id);
      }
      
      // Update history inline if today is currently mounted
      setHistory(prev => {
         const filtered = prev.filter(p => p.id !== savedRec.id);
         return [savedRec, ...filtered].sort((a,b) => new Date(b.date) - new Date(a.date));
      });
      
    } catch (err) {
      console.error("Auto-save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // Render Helpers
  const getMoodConfig = (moodId) => MOODS.find(m => m.id === moodId) || MOODS[2];

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-500">Loading Tracker...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 font-sans text-white">
      
      {/* Header */}
      <header className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative shrink-0"
           >
             <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-[2rem]"></div>
             <HeartPulse className="w-6 h-6 md:w-8 md:h-8 text-white z-10" />
           </motion.div>
           <div>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-3xl md:text-5xl font-bold tracking-tight mb-1 md:mb-2"
             >
               Life <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Tracker</span>
             </motion.h1>
             <p className="text-zinc-400 text-sm md:text-base">Daily wellness & productivity telemetry.</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Indicator */}
          <div className="flex items-center gap-2 bg-white/5 md:bg-black/40 px-4 py-2.5 rounded-2xl border border-white/5 order-2 lg:order-1">
             <div className={`w-2 h-2 rounded-full ${saving ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{saving ? 'Syncing...' : 'Encrypted & Synced'}</span>
          </div>

          <button 
            onClick={() => navigate('/tools/calendar')}
            className="flex items-center gap-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 px-6 py-2.5 rounded-2xl border border-teal-500/20 font-bold text-[10px] uppercase tracking-widest transition-all order-1 lg:order-2"
          >
            <Calendar size={14} /> View Trends in Calendar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN: TODAY'S LOG */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-4 mb-2">
             <Calendar className="text-emerald-500" size={24} />
             <h2 className="text-2xl font-bold">Today's Entry</h2>
             <span className="text-zinc-500 font-mono bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-sm">{todayData.date}</span>
          </div>

          {/* MOOD SELECTOR */}
          <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 mb-6 flex items-center gap-2">
               <Smile size={16} /> How are you feeling right now?
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4 relative z-10">
               {MOODS.map(m => {
                  const isActive = todayData.mood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleUpdate('mood', m.id)}
                      className={`flex flex-col items-center justify-center p-3 md:p-6 rounded-3xl border transition-all hover:-translate-y-1 ${isActive ? m.color : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10 hover:text-white'}`}
                    >
                       <span className={`mb-2 transition-transform ${isActive ? 'scale-125' : ''}`}>{React.cloneElement(m.icon, { size: 28 })}</span>
                       <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : ''}`}>{m.label}</span>
                    </button>
                  );
               })}
            </div>
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             
             {/* Sleep */}
             <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 flex items-center gap-2 mb-2">
                      <Moon size={14} /> Sleep Duration
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-medium">Total hours rested today</p>
                 </div>
                 <div className="text-3xl font-bold font-mono text-white">{todayData.sleep_hours}<span className="text-indigo-500 ml-1 text-xl">h</span></div>
               </div>
               <input 
                 type="range" 
                 min="0" max="14" step="0.5"
                 value={todayData.sleep_hours}
                 onChange={e => handleUpdate('sleep_hours', parseFloat(e.target.value))}
                 className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
               />
               <div className="flex justify-between text-[8px] text-zinc-700 font-bold mt-4 px-1 uppercase tracking-widest">
                 <span>None</span><span>Ideal (7-8h)</span><span>Oversleep</span>
               </div>
             </div>

             {/* Hydration */}
             <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 flex flex-col justify-between hover:border-cyan-500/30 transition-all duration-300">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-cyan-400 flex items-center gap-2 mb-2">
                      <Droplet size={14} /> Hydration
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-medium">Glasses / Bottles tracked</p>
                 </div>
                 <div className="text-3xl font-bold font-mono text-white">{todayData.hydration}</div>
               </div>
               
               <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => handleUpdate('hydration', Math.max(0, todayData.hydration - 1))} className="flex-1 py-3 text-cyan-500 hover:bg-white/5 rounded-xl text-xl font-bold transition-colors">-</button>
                  <button onClick={() => handleUpdate('hydration', todayData.hydration + 1)} className="flex-[2] py-3 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 active:scale-95 rounded-xl font-bold transition-all uppercase text-[10px] tracking-widest">Drink Water</button>
               </div>
             </div>

             {/* Exercise */}
             <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 flex items-center gap-2 mb-2">
                      <Activity size={14} /> Exercise
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-medium">Active minutes clocked</p>
                 </div>
                 <div className="text-3xl font-bold font-mono text-white">{todayData.exercise_minutes}<span className="text-emerald-500 ml-1 text-xl">m</span></div>
               </div>
               
               <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 gap-1.5">
                  <button onClick={() => handleUpdate('exercise_minutes', Math.max(0, todayData.exercise_minutes - 10))} className="flex-1 py-2 text-emerald-500 hover:bg-white/5 rounded-xl font-bold text-xs">-10</button>
                  <button onClick={() => handleUpdate('exercise_minutes', todayData.exercise_minutes + 15)} className="flex-[1.5] py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-bold text-[8px] uppercase tracking-wider transition-all active:scale-95">+15</button>
                  <button onClick={() => handleUpdate('exercise_minutes', todayData.exercise_minutes + 30)} className="flex-[1.5] py-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl font-bold text-[8px] uppercase tracking-wider transition-all active:scale-95">+30</button>
               </div>
             </div>

             {/* Productivity */}
             <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-[10px] font-bold tracking-widest uppercase text-amber-400 flex items-center gap-2 mb-2">
                      <Target size={14} /> Productivity
                   </h3>
                   <p className="text-[10px] text-zinc-500 font-medium">Overall Focus Score</p>
                 </div>
                 <div className="text-3xl font-bold font-mono text-white">{todayData.productivity_score}<span className="text-amber-500 ml-1 text-xl">/10</span></div>
               </div>
               <input 
                 type="range" 
                 min="0" max="10" step="1"
                 value={todayData.productivity_score}
                 onChange={e => handleUpdate('productivity_score', parseInt(e.target.value))}
                 className="w-full accent-amber-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
               />
                <div className="flex justify-between text-[8px] text-zinc-700 font-bold mt-4 px-1 uppercase tracking-widest">
                 <span>None</span><span>Mid</span><span>Peak</span>
               </div>
             </div>
          </div>

          {/* NOTES / JOURNAL */}
          <div className="card-premium p-6 md:p-8 rounded-[2rem] bg-zinc-950/60 border border-white/5 group">
             <h3 className="text-sm font-bold tracking-widest uppercase text-white flex items-center gap-2 mb-4">
                <PenTool size={16} className="text-emerald-500" /> Daily Reflection
             </h3>
             <textarea 
               value={todayData.notes}
               onChange={e => handleUpdate('notes', e.target.value)}
               placeholder="What are you grateful for today? Any lingering thoughts?"
               className="w-full min-h-[120px] bg-black/40 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500/50 resize-none transition-colors selection:bg-emerald-500/30"
             />
          </div>

        </div>

        {/* RIGHT COLUMN: HISTORY OVERVIEW */}
        <div className="xl:col-span-1 h-full pl-0 xl:pl-8 border-t xl:border-t-0 xl:border-l border-white/5 pt-10 xl:pt-0">
          <div className="flex items-center justify-between mb-8 text-zinc-400">
             <div className="flex items-center gap-3">
               <History className="text-teal-500" size={24} />
               <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Recent Logs</h2>
             </div>
             {history.length > 0 && <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-3 py-1 rounded-full uppercase tracking-tighter">{history.length} Logs</span>}
          </div>

          <div className="space-y-4 pr-1">
             <AnimatePresence mode="popLayout">
               {history.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-center py-16 rounded-[2rem] border border-dashed border-white/10 text-zinc-600 font-medium bg-black/20"
                 >
                   No historical logs found.<br />Start tracking your life today!
                 </motion.div>
               ) : (
                 history.slice(0, 7).map((rec, index) => {
                    const mConfig = getMoodConfig(rec.mood);
                    const isToday = rec.date === todayData.date;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={rec.id}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-start gap-4 p-4 rounded-3xl border transition-all duration-300 ${isToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/5 dark:bg-black/40 border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                      >
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border ${mConfig.color} shrink-0 shadow-lg shadow-black/40`}>
                           {React.cloneElement(mConfig.icon, { size: 24 })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-bold text-[13px] ${isToday ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'}`}>
                              {isToday ? 'Today' : new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h4>
                            <span className="text-[8px] font-bold text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5 uppercase">{rec.productivity_score}/10 Prod</span>
                          </div>
                          <div className="flex gap-4 text-[10px] font-mono text-zinc-500 overflow-x-auto no-scrollbar">
                            <span className="flex items-center gap-1.5 shrink-0"><Moon size={12}/>{rec.sleep_hours}h</span>
                            <span className="flex items-center gap-1.5 shrink-0"><Droplet size={12}/>{rec.hydration}</span>
                            <span className="flex items-center gap-1.5 shrink-0"><Activity size={12}/>{rec.exercise_minutes}m</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
               )}
             </AnimatePresence>

             {history.length > 7 && (
                <div className="text-center pt-6">
                  <button className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 hover:text-white transition-colors flex items-center gap-2 mx-auto decoration-dashed underline-offset-4 hover:underline">
                    View Full Archive Timeline <ArrowRight size={12} />
                  </button>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
