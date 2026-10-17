import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Calendar, 
  BookOpen, 
  Briefcase,
  Search,
  ArrowRight,
  StickyNote,
  ShieldCheck,
  Compass,
  Calculator,
  Share2,
  ScanLine,
  Activity,
  Film,
  ShieldAlert,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';
import FloatingGideonButton from '../components/FloatingGideonButton';

export default function ToolSelectionPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { lang, t } = useLang();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('toolViewMode') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('toolViewMode', viewMode);
  }, [viewMode]);

  const tools = useMemo(() => [
    {
      id: 'diary',
      name: lang === 'hi' ? 'व्यक्तिगत डायरी' : 'Personal Diary',
      description: lang === 'hi' ? 'दैनिक विचारों और आत्मनिरीक्षण के लिए एक निजी अभयारण्य।' : 'A sanctuary for your thoughts and daily reflections.',
      icon: BookOpen,
      path: '/tools/diary',
      color: 'from-amber-500 to-orange-500',
      badge: lang === 'hi' ? 'जर्नल' : 'Journal'
    },
    {
      id: 'todo',
      name: lang === 'hi' ? 'टास्क मास्टर' : 'Task Master',
      description: lang === 'hi' ? 'सुरुचिपूर्ण कार्य प्रबंधन और चेकलिस्ट निष्पादन।' : 'Master your productivity with elegant task management.',
      icon: ClipboardList,
      path: '/tools/todo',
      color: 'from-blue-500 to-indigo-600',
      badge: lang === 'hi' ? 'उत्पादकता' : 'Tasks'
    },
    {
      id: 'calendar',
      name: lang === 'hi' ? 'एकीकृत कैलेंडर' : 'Unified Calendar',
      description: lang === 'hi' ? 'सहज शेड्यूलिंग और समय सारणी के साथ अपने जीवन को सिंक करें।' : 'Sync your life with a seamless scheduling experience.',
      icon: Calendar,
      path: '/tools/calendar',
      color: 'from-emerald-500 to-teal-600',
      badge: lang === 'hi' ? 'शेड्यूल' : 'Schedule'
    },
    {
      id: 'planner',
      name: lang === 'hi' ? 'इवेंट आर्किटेक्ट' : 'Event Architect',
      description: lang === 'hi' ? 'सटीकता और मील के पत्थरों के साथ प्रोजेक्ट्स की योजना बनाएं।' : 'Design and execute structured events with precision.',
      icon: Briefcase,
      path: '/tools/planner',
      color: 'from-rose-500 to-pink-600',
      badge: lang === 'hi' ? 'प्रोजेक्ट्स' : 'Projects'
    },
    {
      id: 'notes',
      name: lang === 'hi' ? 'नोट्स आर्काइव' : 'Note Archive',
      description: lang === 'hi' ? 'सामूहिक बुद्धिमत्ता, गहन लेखन और विचारों का भंडार।' : 'A sanctuary for your collective intelligence and deep writing.',
      icon: StickyNote,
      path: '/tools/notes',
      color: 'from-amber-500 to-yellow-600',
      badge: lang === 'hi' ? 'ज्ञान' : 'Notes'
    },
    {
      id: 'vault',
      name: lang === 'hi' ? 'द वॉल्ट' : 'The Vault',
      description: lang === 'hi' ? 'संवेदनशील संपत्तियों के लिए सुरक्षित, एन्क्रिप्टेड क्रेडेंशियल मैनेजर।' : 'Secure, client-side encrypted password & key manager.',
      icon: ShieldCheck,
      path: '/tools/vault',
      color: 'from-cyan-500 to-emerald-600',
      badge: lang === 'hi' ? 'सुरक्षा' : 'Security'
    },
    {
      id: 'compass',
      name: lang === 'hi' ? 'द नेविगेटर' : 'The Navigator',
      description: lang === 'hi' ? 'भौगोलिक स्थिति और दिशा के लिए हार्डवेयर सेंसर एकीकरण।' : 'Hardware sensor integration for geographical positioning.',
      icon: Compass,
      path: '/tools/compass',
      color: 'from-blue-500 to-indigo-600',
      badge: lang === 'hi' ? 'सेंसर' : 'Sensors'
    },
    {
      id: 'calculator',
      name: lang === 'hi' ? 'द कैलकुलेटर' : 'The Calculator',
      description: lang === 'hi' ? 'स्थायी ऐतिहासिक ऑडिट ट्रैकिंग के साथ सटीक संगणना।' : 'Precision computation with permanent historical tracking.',
      icon: Calculator,
      path: '/tools/calculator',
      color: 'from-purple-500 to-fuchsia-600',
      badge: lang === 'hi' ? 'गणना' : 'Math'
    },
    {
      id: 'dropzone',
      name: 'DropZone P2P',
      description: lang === 'hi' ? 'स्थानीय वाई-फाई पर बिना इंटरनेट हाई-स्पीड फ़ाइल ट्रांसफर।' : 'P2P high-speed zero-cloud file transfer over local WiFi.',
      icon: Share2,
      path: '/tools/dropzone',
      color: 'from-pink-500 to-rose-600',
      badge: lang === 'hi' ? 'नेटवर्क' : 'Transfer'
    },
    {
      id: 'qrstudio',
      name: 'QR Studio',
      description: lang === 'hi' ? 'डायनामिक मैट्रिक्स जेनरेशन और उच्च गति कैमरा स्कैनिंग।' : 'Matrix generation and high-speed local optical scanning.',
      icon: ScanLine,
      path: '/tools/qrstudio',
      color: 'from-cyan-500 to-green-600',
      badge: lang === 'hi' ? 'यूटिलिटी' : 'Scanner'
    },
    {
      id: 'lifetracker',
      name: lang === 'hi' ? 'लाइफ ट्रैकर' : 'Life Tracker',
      description: lang === 'hi' ? 'दैनिक स्वास्थ्य, बायोमेट्रिक संकेत और उत्पादकता टेलीमेट्री।' : 'Daily wellness, habit tracking, and biometric telemetry.',
      icon: Activity,
      path: '/tools/lifetracker',
      color: 'from-emerald-500 to-teal-600',
      badge: lang === 'hi' ? 'स्वास्थ्य' : 'Wellbeing'
    },
    {
      id: 'media',
      name: lang === 'hi' ? 'मीडिया ट्रैकर' : 'Media Tracker',
      description: lang === 'hi' ? 'फिल्मों, श्रृंखलाओं और किताबों के संग्रह को एक हब में प्रबंधित करें।' : 'Track movies, series, games, and book collections in a unified hub.',
      icon: Film,
      path: '/tools/media',
      color: 'from-cyan-500 to-blue-600',
      badge: lang === 'hi' ? 'मीडिया' : 'Media'
    },
    {
      id: 'promise',
      name: lang === 'hi' ? 'प्रॉमिस ट्रैकर' : 'Promise Tracker',
      description: lang === 'hi' ? 'गंभीर प्रतिबद्धताओं और प्रतिज्ञाओं के लिए डिजिटल लेजर।' : 'A digital ledger for your solemn commitments and pledges.',
      icon: ShieldAlert,
      path: '/tools/promise',
      color: 'from-amber-500 to-orange-600',
      badge: lang === 'hi' ? 'प्रतिबद्धता' : 'Ledger'
    },
    {
      id: 'timetable',
      name: lang === 'hi' ? 'टाइमटेबल मेकर' : 'Timetable Maker',
      description: lang === 'hi' ? 'सटीक शेड्यूलिंग के साथ अपने दैनिक सामरिक प्रवाह को निष्पादित करें।' : 'Design and execute your daily tactical flow with precision scheduling.',
      icon: LayoutGrid,
      path: '/tools/timetable',
      color: 'from-blue-500 to-indigo-600',
      badge: lang === 'hi' ? 'समय सारणी' : 'Schedule'
    }
  ], [lang]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tools;
    return tools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      (t.badge && t.badge.toLowerCase().includes(q))
    );
  }, [tools, searchQuery]);

  return (
    <div className={`min-h-full py-2 sm:py-3 w-full max-w-7xl mx-auto overflow-x-hidden relative ${
      isDark ? 'text-[#f8fafc]' : 'text-[#0f172a]'
    }`}>
      {/* Header Section */}
      <header className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
              <LayoutGrid size={12} />
              <span>{lang === 'hi' ? 'कार्यक्षेत्र सुइट' : 'Universal Toolbox'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              <span className={isDark ? 'text-zinc-300' : 'text-slate-700'}>
                {lang === 'hi' ? 'आपका ' : 'Your '}
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">
                {lang === 'hi' ? 'कार्यक्षेत्र' : 'Workspace'}
              </span>
            </h1>

            <p className={`text-xs sm:text-sm mt-1 max-w-xl font-medium leading-relaxed ${
              isDark ? 'text-zinc-400' : 'text-slate-600'
            }`}>
              {lang === 'hi' 
                ? 'उच्च प्रदर्शन और उत्पादकता के लिए आवश्यक स्थानीय टूल्स का एक क्यूरेटेड सुइट।'
                : 'A curated suite of essential tools designed for high-performance living. Seamless, integrated, and completely offline.'}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className={`flex items-center gap-1 p-1 border rounded-2xl shrink-0 ${
            isDark ? 'bg-white/[0.03] border-white/8' : 'bg-white border-black/8 shadow-sm'
          }`}>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black')
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black')
              }`}
              title="List View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative mb-5 sm:mb-6 group max-w-xl">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
          isDark ? 'text-zinc-500 group-focus-within:text-amber-400' : 'text-slate-400 group-focus-within:text-amber-600'
        }`} />
        <input 
          type="text" 
          placeholder={lang === 'hi' ? 'टूल्स और सुविधाएं खोजें...' : 'Search workspace tools...'} 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full rounded-2xl pl-11 pr-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium outline-none border transition-all ${
            isDark
              ? 'bg-white/[0.03] border-white/10 text-white placeholder-zinc-500 focus:border-amber-500/50 focus:bg-white/[0.05]'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500/60 focus:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
          }`}
        />
      </div>

      {/* Tools Grid / List */}
      <div className="overflow-hidden relative">
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={`
              grid gap-3.5 sm:gap-4.5
              ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'}
            `}
          >
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  onClick={() => navigate(tool.path)}
                  className={`
                    cursor-pointer group relative overflow-hidden flex rounded-3xl border transition-all duration-300
                    ${viewMode === 'grid' ? 'flex-col justify-between p-5' : 'flex-row items-center p-4 sm:p-5'}
                    ${isDark 
                      ? 'bg-[#12131a]/65 border-white/6 hover:bg-[#151620] hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5' 
                      : 'bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-amber-500/60 hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)]'}
                  `}
                >
                  <div className={viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1 min-w-0'}>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className={`
                        shrink-0 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-md shadow-black/10 transition-transform duration-300 group-hover:scale-105
                        ${viewMode === 'grid' ? 'w-11 h-11' : 'w-10 h-10'}
                      `}>
                        <Icon size={20} className="text-white drop-shadow" />
                      </div>

                      {viewMode === 'grid' && tool.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-white/10 text-zinc-300' : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                        }`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold transition-colors truncate ${
                        viewMode === 'grid' ? 'text-sm sm:text-base mb-1' : 'text-sm sm:text-base'
                      } ${isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-900 group-hover:text-amber-600'}`}>
                        {tool.name}
                      </h3>
                      <p className={`leading-relaxed text-xs font-medium ${
                        viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1 sm:line-clamp-none'
                      } ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className={`
                    flex items-center justify-between text-xs font-semibold pt-3 mt-3 border-t transition-colors
                    ${isDark ? 'border-white/5 text-zinc-400 group-hover:text-amber-400' : 'border-slate-100 text-slate-500 group-hover:text-amber-600'}
                    ${viewMode === 'list' ? 'border-t-0 pt-0 mt-0 ml-4 shrink-0' : ''}
                  `}>
                    <span className="text-[11px] font-bold">{lang === 'hi' ? 'खोलें' : 'Open'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {filteredTools.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`py-16 text-center rounded-3xl border ${
              isDark ? 'bg-white/[0.02] border-white/8 text-zinc-400' : 'bg-white border-black/8 text-slate-600'
            }`}
          >
             <p className="text-sm font-semibold uppercase tracking-wider mb-2">
               {lang === 'hi' ? 'कोई मेल नहीं मिला' : 'No tools matched your search'}
             </p>
             <button 
               onClick={() => setSearchQuery('')}
               className="text-xs font-bold px-4 py-2 rounded-xl bg-amber-500 text-black hover:bg-amber-400 transition-all"
              >
                {lang === 'hi' ? 'खोज साफ़ करें' : 'Clear search'}
             </button>
          </motion.div>
        )}
      </div>

      <FloatingGideonButton />
    </div>
  );
}
