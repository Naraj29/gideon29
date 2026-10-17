import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  History, 
  TrendingUp,
  BookOpen,
  ClipboardList,
  Calendar,
  Briefcase,
  StickyNote,
  ShieldCheck,
  Compass,
  Calculator,
  Share2,
  ScanLine,
  Activity,
  Bot,
  Loader2,
  CheckCircle2,
  X,
  ShieldAlert,
  LayoutGrid
} from 'lucide-react';
import aiService from '../services/aiService';
import api from '../lib/api';
import { useTheme } from '../context/ThemeContext';
import FloatingGideonButton from '../components/FloatingGideonButton';

const tools = [
  { id: 'diary', name: 'Personal Diary', icon: <BookOpen className="w-5 h-5" />, path: '/tools/diary', color: 'from-amber-400 to-orange-500' },
  { id: 'todo', name: 'Task Master', icon: <ClipboardList className="w-5 h-5" />, path: '/tools/todo', color: 'from-blue-400 to-indigo-500' },
  { id: 'calendar', name: 'Unified Calendar', icon: <Calendar className="w-5 h-5" />, path: '/tools/calendar', color: 'from-emerald-400 to-teal-500' },
  { id: 'planner', name: 'Event Architect', icon: <Briefcase className="w-5 h-5" />, path: '/tools/planner', color: 'from-rose-400 to-pink-500' },
  { id: 'notes', name: 'Note Archive', icon: <StickyNote className="w-5 h-5" />, path: '/tools/notes', color: 'from-amber-400 to-yellow-600' },
  { id: 'vault', name: 'The Vault', icon: <ShieldCheck className="w-5 h-5" />, path: '/tools/vault', color: 'from-cyan-400 to-emerald-500' },
  { id: 'compass', name: 'The Navigator', icon: <Compass className="w-5 h-5" />, path: '/tools/compass', color: 'from-blue-400 to-indigo-500' },
  { id: 'calculator', name: 'The Calculator', icon: <Calculator className="w-5 h-5" />, path: '/tools/calculator', color: 'from-purple-400 to-fuchsia-600' },
  { id: 'dropzone', name: 'DropZone', icon: <Share2 className="w-5 h-5" />, path: '/tools/dropzone', color: 'from-pink-500 to-blue-500' },
  { id: 'qrstudio', name: 'QR Studio', icon: <ScanLine className="w-5 h-5" />, path: '/tools/qrstudio', color: 'from-cyan-400 to-green-500' },
  { id: 'lifetracker', name: 'Life Tracker', icon: <Activity className="w-5 h-5" />, path: '/tools/lifetracker', color: 'from-emerald-400 to-teal-500' },
  { id: 'promise', name: 'Promise Tracker', icon: <ShieldAlert className="w-5 h-5" />, path: '/tools/promise', color: 'from-amber-400 to-orange-600' },
  { id: 'timetable', name: 'Timetable Maker', icon: <LayoutGrid className="w-5 h-5" />, path: '/tools/timetable', color: 'from-blue-500 to-indigo-600' }
];

const suggestions = ["Write a diary entry", "Check my schedule", "Create a task list", "Secure my passwords", "Calculate finances"];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleAskAI = async () => {
    if (!searchQuery.trim() || aiLoading) return;
    
    setAiLoading(true);
    setAiResult(null);

    try {
      const data = await aiService.chat(searchQuery.trim());
      setAiResult({
        success: data.success,
        message: data.message || "I just executed that command.",
        action: data.action
      });
    } catch (err) {
      console.error("AI Error in Search:", err);
      let errorMsg = "I couldn't process that command. Check your connection.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Your session expired. Please log in again.";
        } else if (err.response.status === 429) {
          errorMsg = "AI rate limit reached. Please wait a moment.";
        } else if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setAiResult({
        success: false,
        message: errorMsg,
        action: 'ERROR'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setAiResult(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (aiResult) setAiResult(null); // Clear previous AI result on new typing
  };

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExactToolMatch = filteredTools.length > 0 && searchQuery.trim().length > 0;

  return (
    <div className={`h-full flex flex-col items-center pt-8 md:pt-16 pb-6 px-4 md:px-6 relative overflow-hidden ${
      isDark ? 'bg-[#09090b]' : 'bg-[#F8F7F4]'
    }`}>
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse delay-700" />

      <div className="w-full max-w-3xl flex flex-col flex-1 min-h-0">
        <header className="text-center mb-8 shrink-0">
          {/* Header text disappears on mobile to save space when typing */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl md:text-5xl font-black tracking-tight transition-all duration-500 ${isFocused ? 'hidden md:block' : 'block'} ${
              isDark ? 'text-white' : 'text-[#1A1A1A]'
            }`}
          >
            How can we help <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">you</span>?
          </motion.h1>
        </header>

        {/* Dynamic Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative group shrink-0 transition-all duration-500 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}
        >
          <div className={`absolute -inset-2 bg-gradient-to-r ${searchQuery && !isExactToolMatch ? 'from-indigo-500/20 to-blue-500/20' : 'from-amber-500/20 to-orange-500/20'} rounded-[2.5rem] blur-2xl transition-all duration-700 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className={`relative backdrop-blur-3xl rounded-[2rem] border p-2 flex items-center shadow-2xl overflow-hidden transition-colors duration-500 ${
            isDark ? 'bg-[#0d0d0f]/80 border-white/10' : 'bg-white/80 border-black/10'
          }`}>
            <div className={`pl-4 md:pl-6 ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>
              <Search className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${isFocused ? (searchQuery && !isExactToolMatch ? 'text-indigo-500' : 'text-amber-500') : ''}`} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tools or ask AI to execute a task..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={e => e.key === 'Enter' && !isExactToolMatch && handleAskAI()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full bg-transparent !border-none !outline-none !shadow-none focus:!bg-transparent focus:!ring-0 focus:!shadow-none text-lg md:text-xl py-4 md:py-5 px-4 font-medium ${
                isDark ? 'text-white placeholder-zinc-600' : 'text-[#1A1A1A] placeholder-slate-600'
              }`}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearSearch}
                className={`mr-2 p-2 rounded-full transition-colors flex shrink-0 ${
                  isDark ? 'hover:bg-white/10 text-zinc-500 hover:text-white' : 'hover:bg-black/10 text-slate-600 hover:text-black'
                }`}
              >
                <X size={20} />
              </motion.button>
            )}
            <div className="hidden md:flex items-center gap-2 pr-4 shrink-0">
               <span className={`px-2 py-1 rounded border text-[10px] font-mono ${
                 isDark ? 'bg-white/5 border-white/10 text-zinc-500' : 'bg-black/5 border-black/10 text-slate-600'
               }`}>Enter ↵</span>
            </div>
          </div>
        </motion.div>

        {/* Scrollable Adaptive Results Area */}
        <div className="mt-8 flex-1 overflow-y-auto scrollbar-premium pr-2 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            {!searchQuery ? (
              /* ================== IDLE STATE ================== */
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setSearchQuery(s); searchInputRef.current?.focus(); }}
                      className={`px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border text-xs md:text-sm font-medium transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/5 border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-white text-zinc-400'
                          : 'bg-black/5 border-black/5 hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-black text-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className={`glass rounded-3xl p-5 md:p-6 border space-y-4 ${
                    isDark ? 'border-white/5' : 'border-black/5'
                  }`}>
                     <div className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                       isDark ? 'text-zinc-500' : 'text-slate-600'
                     }`}>
                        <History className="w-4 h-4" />
                        Recent Tools
                     </div>
                     <div className="space-y-2">
                        {tools.slice(0, 3).map(tool => (
                          <div 
                            key={tool.id}
                            onClick={() => navigate(tool.path)}
                            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer group transition-colors ${
                              isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg shadow-black/20 shrink-0`}>
                               {React.cloneElement(tool.icon, { className: 'w-5 h-5 text-white' })}
                            </div>
                            <span className={`text-sm md:text-base font-semibold group-hover:transition-colors ${
                              isDark ? 'text-zinc-300 group-hover:text-white' : 'text-slate-700 group-hover:text-black'
                            }`}>{tool.name}</span>
                            <ArrowRight className={`w-4 h-4 ml-auto transition-all translate-x-[-10px] group-hover:translate-x-0 ${
                              isDark ? 'text-zinc-600 opacity-0 group-hover:opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                            }`} />
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className={`glass rounded-3xl p-5 md:p-6 border space-y-4 ${
                    isDark ? 'border-white/5' : 'border-black/5'
                  }`}>
                     <div className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                       isDark ? 'text-zinc-500' : 'text-slate-600'
                     }`}>
                        <TrendingUp className="w-4 h-4" />
                        Trending Action
                     </div>
                     <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
                           <div className="text-amber-500 font-bold text-sm">Deep Focus Mode</div>
                           <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>Activate your optimized workspace layout automatically.</div>
                        </div>
                        <div className={`p-4 rounded-2xl border space-y-1 ${
                          isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'
                        }`}>
                           <div className={`font-bold text-sm ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Sync Mobile Devices</div>
                           <div className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-600'}`}>P2P sync active. 2 devices connected nearby.</div>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ================== ACTIVE SEARCH / AI STATE ================== */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* TOOL RESULTS */}
                {filteredTools.length > 0 && (
                  <div className={`glass rounded-3xl border overflow-hidden shadow-2xl ${
                    isDark ? 'border-white/5' : 'border-black/5'
                  }`}>
                    <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
                      isDark ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'
                    }`}>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${
                        isDark ? 'text-zinc-500' : 'text-slate-600'
                      }`}>Tool Matches</span>
                      <span className={`text-[10px] font-semibold ${
                        isDark ? 'text-zinc-600' : 'text-slate-600'
                      }`}>{filteredTools.length} found</span>
                    </div>
                    <div className="p-2 space-y-1">
                      {filteredTools.map((tool, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={tool.id}
                          onClick={() => navigate(tool.path)}
                          className={`flex items-center gap-4 md:gap-5 p-3 md:p-4 rounded-2xl cursor-pointer group transition-all duration-300 ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                          }`}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                             {React.cloneElement(tool.icon, { className: 'w-5 h-5 md:w-6 md:h-6 text-white' })}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className={`text-base md:text-lg font-bold truncate group-hover:text-amber-500 transition-colors ${
                               isDark ? 'text-white' : 'text-[#1A1A1A]'
                             }`}>{tool.name}</h3>
                             <p className={`text-xs md:text-sm font-medium truncate ${
                               isDark ? 'text-zinc-500' : 'text-slate-600'
                             }`}>Open productivity tool</p>
                          </div>
                          <ArrowRight className="w-5 h-5 shrink-0 text-amber-500 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI COMMAND PORTAL */}
                <div className={`glass rounded-3xl border overflow-hidden transition-all duration-500 ${
                  aiResult 
                    ? 'border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] bg-indigo-500/5' 
                    : (isDark ? 'border-white/5' : 'border-black/5')
                }`}>
                  <div className={`p-4 border-b flex items-center gap-3 ${
                    isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-black/10'
                  }`}>
                     <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                        <Bot className="text-indigo-400" size={16} />
                     </div>
                     <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest flex-1 truncate ${
                       isDark ? 'text-zinc-400' : 'text-slate-600'
                     }`}>
                        AI Execution Engine
                     </span>
                  </div>

                  <div className="p-4 md:p-6">
                     {!aiLoading && !aiResult && (
                       <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className={`text-sm md:text-base text-center md:text-left ${
                            isDark ? 'text-zinc-400' : 'text-slate-600'
                          }`}>
                            Instruct the AI to process: <span className={`font-medium italic ${
                              isDark ? 'text-white' : 'text-[#1A1A1A]'
                            }`}>"{searchQuery}"</span>
                          </div>
                          <button 
                            onClick={handleAskAI}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all focus:scale-95 break-keep whitespace-nowrap"
                          >
                             <Sparkles size={16} /> Force Execute
                          </button>
                       </div>
                     )}

                     {aiLoading && (
                       <div className="flex items-center gap-4 text-indigo-400 py-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-sm font-medium animate-pulse">Processing your command via cognitive core...</span>
                       </div>
                     )}

                     {aiResult && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="space-y-4"
                       >
                          <div className="flex gap-4 items-start">
                             <div className={`w-10 h-10 rounded-xl shrink-0 border flex items-center justify-center ${
                               aiResult.success 
                                 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                 : 'bg-red-500/10 border-red-500/20 text-red-400'
                             }`}>
                                {aiResult.success ? <CheckCircle2 size={20} /> : <X size={20} />}
                             </div>
                             <div className={`border p-4 rounded-2xl flex-1 text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap ${
                               isDark ? 'bg-black/30 border-white/5 text-zinc-200' : 'bg-black/10 border-black/5 text-slate-700'
                             }`}>
                                {aiResult.message}
                             </div>
                          </div>
                          
                          {aiResult.action && aiResult.action !== 'CHAT' && aiResult.success && (
                            <div className="flex justify-end pt-2">
                               <div className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                  <Activity size={12} />
                                  Action Logged: {aiResult.action.replace('_', ' ')}
                               </div>
                            </div>
                          )}
                       </motion.div>
                     )}
                  </div>
                </div>

                {filteredTools.length === 0 && !aiLoading && !aiResult && (
                  <div className="py-12 text-center opacity-60">
                     <p className={`text-sm md:text-base font-light ${
                       isDark ? 'text-zinc-400' : 'text-slate-600'
                     }`}>No exact tool matches found. Try executing this as a command above.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <FloatingGideonButton />
    </div>
  );
}
