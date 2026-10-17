import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bell, Search, X, Home, Languages, Sun, Moon } from 'lucide-react';
import KarmaWallet from './KarmaWallet';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';

export default function Navbar({ customTitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { toggleTheme, isDark } = useTheme();
  const { lang, toggleLang, t } = useLang();

  const handleQueryChange = (e) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const getTitle = () => {
    if (customTitle) return customTitle;
    const path = location.pathname;
    if (path.includes('/diary')) return t.memoryArchive;
    if (path.includes('/todo')) return t.taskSanctuary;
    if (path.includes('/planner')) return t.eventArchitect;
    if (path.includes('/calendar')) return t.unifiedCalendar;
    if (path.includes('/notes')) return t.noteArchive;
    if (path.includes('/vault')) return t.theVault;
    if (path.includes('/compass')) return t.theNavigator;
    if (path.includes('/calculator')) return t.theCalculator;
    if (path.includes('/dropzone')) return 'DropZone';
    if (path.includes('/qrstudio')) return 'QR Studio';
    if (path.includes('/lifetracker')) return 'Life Tracker';
    if (path.includes('/search')) return t.universalToolbox;
    if (path.includes('/home')) return t.homeDashboard;
    if (path.includes('/ai')) return t.gideonIntelligence;
    if (path.includes('/history')) return t.activityHistory;
    if (path.includes('/account')) return t.accountSettings;
    return t.universalToolbox;
  };

  const isToolView = location.pathname.startsWith('/tools/');
  const isRoot = ['/home', '/search', '/ai', '/account', '/history'].includes(location.pathname);

  // Demo user data
  const displayName = 'Demo User';
  const initials = 'DU';

  const handleProfileClick = () => {
    navigate('/account');
  };

  return (
    <nav className={`shrink-0 z-50 backdrop-blur-2xl border-b w-full ${
      isDark ? 'bg-[#0a0a0c]/85 border-white/5' : 'bg-white/85 border-black/5'
    }`}>
      <div className="w-full px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-[44px]">
            {!isRoot ? (
              <button
                onClick={() => navigate(-1)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/6'
                    : 'text-slate-600 hover:text-black hover:bg-black/6'
                }`}
              >
                <ArrowLeft size={18} />
              </button>
            ) : (
              <button
                onClick={handleProfileClick}
                className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/35 hover:border-indigo-400/70 transition-all flex items-center justify-center focus:outline-none shrink-0"
              >
                <div className="w-full h-full bg-indigo-500/15 flex items-center justify-center text-indigo-400 text-[10px] font-black outfit uppercase">
                  {initials}
                </div>
              </button>
            )}
          </div>

          {/* Centre */}
          <div className="flex-1 text-center">
            <div 
              onClick={() => navigate('/search')}
              className="relative max-w-sm mx-auto w-full cursor-pointer"
            >
              <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-500' : 'text-slate-600'
              }`}>
                <Search size={14} />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder={t.searchPlaceholder}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/search');
                }}
                className={`w-full border focus:border-indigo-500/40 rounded-xl py-1.5 pl-9 pr-9 text-xs outline-none transition-all duration-300 font-medium cursor-pointer ${
                  isDark
                    ? 'bg-white/4 border-white/6 text-white placeholder-slate-500'
                    : 'bg-black/4 border-black/6 text-[#1A1A1A] placeholder-slate-600'
                }`}
              />
              {query && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchParams({}, { replace: true });
                  }}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                    isDark
                      ? 'bg-white/8 hover:bg-white/14 text-slate-400 hover:text-white'
                      : 'bg-black/8 hover:bg-black/14 text-slate-600 hover:text-black'
                  }`}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 min-w-[44px] justify-end">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 text-xs font-bold border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10 hover:text-amber-300'
                  : 'bg-black/5 border-black/10 text-amber-700 hover:bg-black/10 hover:text-amber-800'
              }`}
              title={lang === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
            >
              <Languages size={14} />
              <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-black/5 border-black/10 text-slate-700 hover:text-black hover:bg-black/10'
              }`}
              title={isDark ? t.lightMode : t.darkMode}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <KarmaWallet />

            <button 
              onClick={() => navigate('/home')}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-white/6'
                  : 'text-slate-600 hover:text-black hover:bg-black/6'
              }`}
              title="Home"
            >
              <Home size={17} />
            </button>

            <button className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/6'
                : 'text-slate-600 hover:text-black hover:bg-black/6'
            }`}>
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
