import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Send,
  CheckCircle2,
  Circle,
  Plus,
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
  HeartPulse,
  Lock,
  Cpu,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import FloatingGideonButton from '../components/FloatingGideonButton';

export default function Home() {
  const { isDark } = useTheme();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const [commandQuery, setCommandQuery] = useState('');
  const [quickTask, setQuickTask] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentTasks, setRecentTasks] = useState([]);
  const [stats, setStats] = useState({
    tasks: 0,
    notes: 0,
    memories: 0,
    vault: 0
  });

  // Keep live time updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load telemetry stats from localStorage
  const loadWorkspaceStats = () => {
    try {
      const todoData = JSON.parse(localStorage.getItem('todo_items') || '[]');
      const notesData = JSON.parse(localStorage.getItem('notes_entries') || '[]');
      const diaryData = JSON.parse(localStorage.getItem('diary_entries') || '[]');
      const vaultData = JSON.parse(localStorage.getItem('vault_entries') || '[]');

      const pendingTasks = Array.isArray(todoData) ? todoData.filter(i => !i.completed) : [];
      setStats({
        tasks: pendingTasks.length,
        notes: Array.isArray(notesData) ? notesData.length : 0,
        memories: Array.isArray(diaryData) ? diaryData.length : 0,
        vault: Array.isArray(vaultData) ? vaultData.length : 0
      });

      setRecentTasks(pendingTasks.slice(0, 4));
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadWorkspaceStats();
  }, []);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return t.goodMorning;
    if (hour < 17) return t.goodAfternoon;
    return t.goodEvening;
  }, [currentTime, t]);

  const formattedDate = useMemo(() => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return currentTime.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', options);
  }, [currentTime, lang]);

  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [currentTime]);

  const handleCommandSubmit = (e) => {
    if (e) e.preventDefault();
    if (!commandQuery.trim()) return;
    navigate(`/ai?prompt=${encodeURIComponent(commandQuery.trim())}`);
  };

  const handlePromptClick = (promptText) => {
    navigate(`/ai?prompt=${encodeURIComponent(promptText)}`);
  };

  const handleAddQuickTask = (e) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem('todo_items') || '[]');
      const newTask = {
        id: Date.now().toString(),
        text: quickTask.trim(),
        completed: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      };
      const updated = [newTask, ...existing];
      localStorage.setItem('todo_items', JSON.stringify(updated));
      setQuickTask('');
      loadWorkspaceStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = (taskId) => {
    try {
      const existing = JSON.parse(localStorage.getItem('todo_items') || '[]');
      const updated = existing.map(item => 
        item.id === taskId ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem('todo_items', JSON.stringify(updated));
      loadWorkspaceStats();
    } catch (err) {
      console.error(err);
    }
  };

  const workspaceTools = useMemo(() => [
    {
      id: 'diary',
      title: lang === 'hi' ? 'मेमोरी आर्काइव' : 'Memory Sanctuary',
      category: lang === 'hi' ? 'जर्नल' : 'Journaling',
      desc: lang === 'hi' ? 'दैनिक विचार और व्यक्तिगत संस्मरण सुरक्षित रखें।' : 'Private personal reflections and memory logging.',
      icon: BookOpen,
      path: '/tools/diary',
      accent: 'amber',
      badge: `${stats.memories} ${t.memoriesLogged}`
    },
    {
      id: 'todo',
      title: lang === 'hi' ? 'टास्क मास्टर' : 'Task Sanctuary',
      category: lang === 'hi' ? 'उत्पादकता' : 'Productivity',
      desc: lang === 'hi' ? 'कार्यों की प्राथमिकता और चेकलिस्ट का प्रबंधन।' : 'High-impact task organization and execution tracker.',
      icon: ClipboardList,
      path: '/tools/todo',
      accent: 'blue',
      badge: `${stats.tasks} ${t.tasksPending}`
    },
    {
      id: 'notes',
      title: lang === 'hi' ? 'नोट्स आर्काइव' : 'Deep Notes',
      category: lang === 'hi' ? 'ज्ञान आधार' : 'Knowledge',
      desc: lang === 'hi' ? 'दस्तावेज़, विचार और त्वरित संदर्भ सहेजें।' : 'Markdown documents and structured idea repository.',
      icon: StickyNote,
      path: '/tools/notes',
      accent: 'emerald',
      badge: `${stats.notes} ${t.notesSaved}`
    },
    {
      id: 'calendar',
      title: lang === 'hi' ? 'एकीकृत कैलेंडर' : 'Unified Calendar',
      category: lang === 'hi' ? 'शेड्यूल' : 'Schedule',
      desc: lang === 'hi' ? 'इवेंट्स, समय सीमा और दैनिक योजनाएं।' : 'Seamless agenda tracking and timeline orchestration.',
      icon: Calendar,
      path: '/tools/calendar',
      accent: 'purple'
    },
    {
      id: 'vault',
      title: lang === 'hi' ? 'द वॉल्ट' : 'The Vault',
      category: lang === 'hi' ? 'सुरक्षा' : 'Security',
      desc: lang === 'hi' ? 'स्थानीय रूप से एन्क्रिप्टेड क्रेडेंशियल्स और कीज।' : 'Zero-knowledge client-side encrypted credentials.',
      icon: ShieldCheck,
      path: '/tools/vault',
      accent: 'rose',
      badge: `${stats.vault} ${t.vaultSecured}`
    },
    {
      id: 'planner',
      title: lang === 'hi' ? 'इवेंट आर्किटेक्ट' : 'Event Architect',
      category: lang === 'hi' ? 'प्रोजेक्ट्स' : 'Projects',
      desc: lang === 'hi' ? 'जटिल प्रोजेक्ट्स और मील के पत्थरों की रूपरेखा।' : 'Multi-stage milestones and structured project delivery.',
      icon: Briefcase,
      path: '/tools/planner',
      accent: 'indigo'
    },
    {
      id: 'lifetracker',
      title: lang === 'hi' ? 'लाइफ ट्रैकर' : 'Life Tracker',
      category: lang === 'hi' ? 'स्वास्थ्य' : 'Wellbeing',
      desc: lang === 'hi' ? 'आदतों, नींद और दैनिक मैट्रिक्स की निगरानी।' : 'Biometric indicators, habits, and daily vital signals.',
      icon: HeartPulse,
      path: '/tools/lifetracker',
      accent: 'cyan'
    },
    {
      id: 'calculator',
      title: lang === 'hi' ? 'द कैलकुलेटर' : 'The Calculator',
      category: lang === 'hi' ? 'गणना' : 'Computation',
      desc: lang === 'hi' ? 'स्थायी इतिहास और सटीक गणितीय विश्लेषण।' : 'Precision computational engine with permanent audit trail.',
      icon: Calculator,
      path: '/tools/calculator',
      accent: 'amber'
    },
    {
      id: 'dropzone',
      title: 'DropZone P2P',
      category: lang === 'hi' ? 'नेटवर्क' : 'Transfer',
      desc: lang === 'hi' ? 'स्थानीय वाई-फाई पर बिना इंटरनेट फ़ाइल शेयरिंग।' : 'Local WiFi zero-cloud high-bandwidth file relay.',
      icon: Share2,
      path: '/tools/dropzone',
      accent: 'teal'
    },
    {
      id: 'qrstudio',
      title: 'QR Studio',
      category: lang === 'hi' ? 'यूटिलिटी' : 'Utility',
      desc: lang === 'hi' ? 'कस्टम QR कोड निर्माण और कैमरा स्कैनर।' : 'High-fidelity dynamic QR generator and optical decoder.',
      icon: ScanLine,
      path: '/tools/qrstudio',
      accent: 'sky'
    },
    {
      id: 'compass',
      title: lang === 'hi' ? 'द नेविगेटर' : 'The Navigator',
      category: lang === 'hi' ? 'सेंसर' : 'Orientation',
      desc: lang === 'hi' ? 'हार्डवेयर सेंसर और दिशा सूचक उपकरण।' : 'Hardware telemetry and directional orientation.',
      icon: Compass,
      path: '/tools/compass',
      accent: 'blue'
    },
    {
      id: 'promise',
      title: lang === 'hi' ? 'कमिटमेंट लेजर' : 'Promise Tracker',
      category: lang === 'hi' ? 'प्रतिबद्धता' : 'Accountability',
      desc: lang === 'hi' ? 'व्यक्तियों और लक्ष्यों के प्रति अपने वादे ट्रैक करें।' : 'Explicit commitments ledger and integrity verification.',
      icon: TrendingUp,
      path: '/tools/promise',
      accent: 'emerald'
    }
  ], [lang, t, stats]);

  return (
    <div className={`min-h-full pb-20 ${
      isDark ? 'bg-[#09090b] text-[#f8fafc]' : 'bg-[#F8F9FA] text-[#0f172a]'
    }`}>
      {/* Top Ambient Glow Effect */}
      <div className="relative overflow-hidden pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 rounded-full pointer-events-none blur-3xl opacity-25 ${
          isDark ? 'bg-gradient-to-b from-amber-500/20 via-indigo-500/10 to-transparent' : 'bg-gradient-to-b from-amber-500/15 via-indigo-500/10 to-transparent'
        }`} />

        {/* Header Bar: Status & Time */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className={`text-[11px] font-bold tracking-wider uppercase ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                {t.aiStatusActive}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">Demo</span>
            </h1>
            <p className={`text-xs sm:text-sm mt-1 font-medium ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              {t.heroTagline}
            </p>
          </div>

          {/* Live Date/Time Pill */}
          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-sm shrink-0 ${
            isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white/90 border-black/8'
          }`}>
            <Clock size={16} className="text-amber-500" />
            <div className="text-right">
              <div className="text-xs font-bold leading-none">{formattedTime}</div>
              <div className={`text-[10px] font-medium leading-tight mt-0.5 ${
                isDark ? 'text-zinc-400' : 'text-slate-500'
              }`}>{formattedDate}</div>
            </div>
          </div>
        </div>

        {/* Gideon Command / Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 mb-8"
        >
          <form
            onSubmit={handleCommandSubmit}
            className={`flex items-center gap-3 p-2 rounded-2xl border backdrop-blur-xl shadow-xl transition-all ${
              isDark
                ? 'bg-[#12131a]/90 border-white/10 focus-within:border-amber-500/50 focus-within:shadow-amber-500/5'
                : 'bg-white/95 border-black/10 focus-within:border-amber-500/60 focus-within:shadow-amber-500/10'
            }`}
          >
            <div className={`p-2.5 rounded-xl ml-1 ${
              isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-500/15 text-amber-600'
            }`}>
              <Sparkles size={18} />
            </div>

            <input
              type="text"
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              placeholder={t.commandPlaceholder}
              className={`flex-1 bg-transparent outline-none text-sm sm:text-base font-medium px-1 min-w-0 ${
                isDark ? 'text-white placeholder:text-zinc-500' : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />

            <button
              type="submit"
              disabled={!commandQuery.trim()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                commandQuery.trim()
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95'
                  : (isDark ? 'bg-white/5 text-zinc-600 cursor-not-allowed' : 'bg-black/5 text-slate-400 cursor-not-allowed')
              }`}
            >
              <span>{t.askGideon}</span>
              <Send size={14} />
            </button>
          </form>

          {/* Quick Prompts Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-3 pb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              isDark ? 'text-zinc-500' : 'text-slate-600'
            }`}>
              {t.quickPrompts}:
            </span>
            {[t.prompt1, t.prompt2, t.prompt3, t.prompt4].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-all shrink-0 hover:scale-[1.02] active:scale-95 ${
                  isDark
                    ? 'bg-white/[0.03] border-white/8 text-zinc-300 hover:border-amber-500/40 hover:text-white hover:bg-amber-500/5'
                    : 'bg-white border-black/8 text-slate-700 hover:border-amber-500/50 hover:text-black hover:bg-amber-50'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Telemetry Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {/* Card 1: Tasks */}
          <div 
            onClick={() => navigate('/tools/todo')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              isDark 
                ? 'bg-white/[0.02] border-white/6 hover:bg-white/[0.05] hover:border-blue-500/30' 
                : 'bg-white border-black/6 hover:shadow-md hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>{t.tasksPending}</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <ClipboardList size={16} />
              </div>
            </div>
            <div className="text-2xl font-black">{stats.tasks}</div>
            <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <span>{lang === 'hi' ? 'कार्यों को प्रबंधित करें' : 'Active checklists'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Memories */}
          <div 
            onClick={() => navigate('/tools/diary')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              isDark 
                ? 'bg-white/[0.02] border-white/6 hover:bg-white/[0.05] hover:border-amber-500/30' 
                : 'bg-white border-black/6 hover:shadow-md hover:border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>{t.memoriesLogged}</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="text-2xl font-black">{stats.memories}</div>
            <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <span>{lang === 'hi' ? 'जर्नल प्रविष्टियां' : 'Diary reflections'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Deep Notes */}
          <div 
            onClick={() => navigate('/tools/notes')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              isDark 
                ? 'bg-white/[0.02] border-white/6 hover:bg-white/[0.05] hover:border-emerald-500/30' 
                : 'bg-white border-black/6 hover:shadow-md hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>{t.notesSaved}</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <StickyNote size={16} />
              </div>
            </div>
            <div className="text-2xl font-black">{stats.notes}</div>
            <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <span>{lang === 'hi' ? 'सहेजे दस्तावेज़' : 'Drafts & notes'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: The Vault */}
          <div 
            onClick={() => navigate('/tools/vault')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
              isDark 
                ? 'bg-white/[0.02] border-white/6 hover:bg-white/[0.05] hover:border-rose-500/30' 
                : 'bg-white border-black/6 hover:shadow-md hover:border-rose-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>{t.vaultSecured}</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                <Lock size={16} />
              </div>
            </div>
            <div className="text-2xl font-black">{stats.vault}</div>
            <div className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              <span>{lang === 'hi' ? 'एन्क्रिप्टेड सुरक्षित' : 'Zero-knowledge safe'}</span>
              <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Mid Section: Quick Task Capture & Recent Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Quick Capture Panel */}
          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
            isDark ? 'bg-[#12131a]/70 border-white/8' : 'bg-white border-black/8 shadow-sm'
          }`}>
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{t.quickCapture}</h3>
                  <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    {lang === 'hi' ? 'सीधे अपने कार्य सूची में जोड़ें' : 'Instant write directly to your task sanctuary'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddQuickTask} className="mt-4">
                <input
                  type="text"
                  value={quickTask}
                  onChange={(e) => setQuickTask(e.target.value)}
                  placeholder={t.quickTaskPlaceholder}
                  className={`w-full p-3 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDark 
                      ? 'bg-black/30 border-white/10 text-white placeholder-zinc-600 focus:border-amber-500/50' 
                      : 'bg-black/[0.02] border-black/10 text-slate-900 placeholder-slate-400 focus:border-amber-500/60'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!quickTask.trim()}
                  className={`w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    quickTask.trim()
                      ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/10'
                      : (isDark ? 'bg-white/5 text-zinc-600 cursor-not-allowed' : 'bg-black/5 text-slate-400 cursor-not-allowed')
                  }`}
                >
                  <Plus size={14} />
                  <span>{t.addTask}</span>
                </button>
              </form>
            </div>

            <div className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${
              isDark ? 'border-white/5 text-zinc-400' : 'border-black/5 text-slate-600'
            }`}>
              <span>{lang === 'hi' ? 'लोकल सिंक सक्षम' : 'Instant offline persistence'}</span>
              <span className="font-semibold text-emerald-500">✓ Ready</span>
            </div>
          </div>

          {/* Pending Tasks Quick List */}
          <div className={`lg:col-span-2 p-5 rounded-3xl border ${
            isDark ? 'bg-[#12131a]/70 border-white/8' : 'bg-white border-black/8 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold">{t.tasksPending}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isDark ? 'bg-white/10 text-zinc-300' : 'bg-black/5 text-slate-700'
                }`}>
                  {stats.tasks}
                </span>
              </div>
              <button
                onClick={() => navigate('/tools/todo')}
                className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {recentTasks.length > 0 ? (
                recentTasks.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTask(item.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                          item.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : (isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40')
                        }`}
                      >
                        {item.completed && <CheckCircle2 size={13} />}
                      </button>
                      <span className={`text-xs font-medium truncate ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}>
                        {item.text || item.title}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                      item.priority === 'high'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : item.priority === 'low'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.priority || 'medium'}
                    </span>
                  </div>
                ))
              ) : (
                <div className={`p-8 rounded-2xl border border-dashed text-center ${
                  isDark ? 'border-white/10 text-zinc-400' : 'border-black/10 text-slate-600'
                }`}>
                  <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-500/80" />
                  <p className="text-xs font-medium">{t.noTasksYet}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Applications Suite */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2">
                <Layers size={20} className="text-amber-500" />
                <span>{t.workspaceSuite}</span>
              </h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                {t.workspaceSubtitle}
              </p>
            </div>
            <button
              onClick={() => navigate('/tools')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                isDark 
                  ? 'border-white/10 text-zinc-300 hover:text-white hover:bg-white/5' 
                  : 'border-black/10 text-slate-700 hover:text-black hover:bg-black/5'
              }`}
            >
              <span>{t.viewAllTools}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {workspaceTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(tool.path)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between group relative overflow-hidden ${
                    isDark
                      ? 'bg-[#12131a]/60 border-white/6 hover:bg-[#151620] hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5'
                      : 'bg-white border-black/8 hover:shadow-xl hover:border-amber-500/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
                        isDark ? 'bg-white/5 text-amber-400' : 'bg-black/5 text-amber-600'
                      }`}>
                        <Icon size={22} />
                      </div>
                      {tool.badge ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-white/10 text-zinc-300' : 'bg-black/5 text-slate-700'
                        }`}>
                          {tool.badge}
                        </span>
                      ) : (
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          isDark ? 'text-zinc-400' : 'text-slate-600'
                        }`}>
                          {tool.category}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base group-hover:text-amber-500 transition-colors">
                      {tool.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>
                      {tool.desc}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                    isDark ? 'border-white/5 text-zinc-400 group-hover:text-amber-400' : 'border-black/5 text-slate-600 group-hover:text-amber-600'
                  }`}>
                    <span>{t.launch}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <FloatingGideonButton />
    </div>
  );
}
