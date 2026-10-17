import React, { useMemo, useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Search, LayoutGrid, User, Sparkles, Home, QrCode, RefreshCw, LogOut, Share, Sun, Moon, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import AIPreviewSidebar from './AIPreviewSidebar';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';

function ProfileCard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();
  const { lang, t } = useLang();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    window.location.href = '/account';
  };

  const handleIncognito = () => {
    console.log("Incognito mode toggled");
    setIsDropdownOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Demo User',
        text: `Check out Demo User's profile on UC Platform`,
        url: window.location.href
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const handleQRClick = (e) => {
    e.stopPropagation();
    setIsQRModalOpen(true);
  };

  // Demo user data
  const displayName = 'Demo User';
  const username = '@demouser';
  const userId = 'DEMO-001';
  const firstName = 'Demo';
  const displayUsername = username;

  return (
    <div className="mx-3 mb-3 relative" ref={dropdownRef}>
      <div
        onClick={handleProfileClick}
        className={`p-4 rounded-2xl border backdrop-blur-sm hover:border-indigo-500/20 transition-all cursor-pointer ${
          isDark
            ? 'border-white/6 bg-[#141520]/80'
            : 'border-black/6 bg-white/80'
        }`}
      >
        {/* Profile Picture and Info */}
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          <div className="relative shrink-0 group">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20 transition-all`}>
              <User size={22} className="text-indigo-400" />
            </div>
            <div className={`absolute inset-0 rounded-full transition-colors ${
              isDark ? 'bg-white/0 group-hover:bg-white/5' : 'bg-black/0 group-hover:bg-black/5'
            }`} />
          </div>

          {/* Username and QR Trigger */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate leading-tight ${
                  isDark ? 'text-white' : 'text-[#1A1A1A]'
                }`}>{firstName}</p>
                <p className={`text-xs truncate ${
                  isDark ? 'text-zinc-500' : 'text-slate-600'
                }`}>{displayUsername}</p>
              </div>
              <button
                onClick={handleQRClick}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                  isDark ? 'hover:bg-white/8' : 'hover:bg-black/8'
                }`}
              >
                <QrCode size={16} className={`hover:text-indigo-400 transition-colors ${
                  isDark ? 'text-zinc-400' : 'text-slate-600'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Switch Account Button */}
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className={`w-full mt-3 pt-3 border-t flex items-center justify-center gap-2 py-2 rounded-xl transition-all group ${
            isDark
              ? 'border-white/4 bg-white/4 hover:bg-white/8 hover:border-white/10'
              : 'border-black/4 bg-black/4 hover:bg-black/8 hover:border-black/10'
          }`}
        >
          <RefreshCw size={14} className={`group-hover:text-indigo-400 transition-colors ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`} />
          <span className={`text-xs font-medium group-hover:text-indigo-400 transition-colors ${
            isDark ? 'text-zinc-400' : 'text-slate-600'
          }`}>{t.switchAccount}</span>
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50"
          >
            <div className={`rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden ${
              isDark
                ? 'border-white/8 bg-[#141520]/95'
                : 'border-black/8 bg-white/95'
            }`}>
              {/* Actions Section */}
              <div className="p-2">
                <button
                  onClick={handleIncognito}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    isDark ? 'hover:bg-white/6' : 'hover:bg-black/6'
                  }`}
                >
                  <RefreshCw size={14} className={isDark ? 'text-zinc-400' : 'text-slate-600'} />
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-zinc-300' : 'text-slate-700'
                  }`}>{t.refreshDemo}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={14} className="text-red-400" />
                  <span className="text-xs font-medium text-red-400">{t.logout}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isQRModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQRModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl ${
                isDark ? 'bg-[#1a1d2e] border-white/6' : 'bg-white border-black/6'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <QrCode size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${
                      isDark ? 'text-white' : 'text-[#1A1A1A]'
                    }`}>Share Profile</h2>
                    <p className={`text-xs ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>Scan to connect</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQRModalOpen(false)}
                  className={`w-8 h-8 rounded-full p-2 hover:bg-white/6 text-zinc-400 hover:text-white transition-all ${
                    isDark ? '' : 'hover:bg-black/6'
                  }`}
                >
                  ✕
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-4 mb-6 flex items-center justify-center">
                <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <QrCode size={120} className="text-slate-800 mx-auto" />
                    <p className="text-xs text-slate-600 mt-2 font-medium">{displayUsername}</p>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className={`rounded-xl p-4 mb-6 border ${
                isDark
                  ? 'bg-white/4 border-white/6'
                  : 'bg-black/4 border-black/6'
              }`}>
                <p className={`text-[10px] font-black tracking-[0.18em] uppercase mb-3 ${
                  isDark ? 'text-zinc-500' : 'text-slate-600'
                }`}>Account Details</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>Username</span>
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-white' : 'text-[#1A1A1A]'
                    }`}>{displayUsername}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      isDark ? 'text-zinc-400' : 'text-slate-600'
                    }`}>User ID</span>
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-white' : 'text-[#1A1A1A]'
                    }`}>{userId}</span>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
              >
                <Share size={16} />
                Share Profile Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isVisionActive = searchParams.get('vision') === 'true';
  const { toggleTheme, isDark } = useTheme();
  const { lang, toggleLang, t } = useLang();

  const navItems = useMemo(() => {
    const isToolActive = location.pathname.startsWith('/tools');

    return [
      { id: 'home', label: t.home, icon: Home, path: '/home' },
      { id: 'search', label: t.search, icon: Search, path: '/search' },
      { id: 'gideon', label: t.gideon, icon: Sparkles, path: '/ai' },
      { 
        id: 'tool', 
        label: t.tools, 
        icon: LayoutGrid, 
        path: (isToolActive && location.pathname !== '/tools') ? location.pathname : '/tools', 
        isActive: isToolActive 
      },
      { id: 'account', label: t.account, icon: User, path: '/account' },
    ];
  }, [location.pathname, t]);

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isGideon = location.pathname === '/ai';
  const isGideonPage = location.pathname === '/gideon';

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans relative ${
      isDark ? 'bg-[#09090b] text-[#f5f5f7]' : 'bg-[#F8F7F4] text-[#1A1A1A]'
    }`}>
      <div className="w-full flex relative max-w-full">
      
      {/* Mobile TopBar - Suppressed in Vision Mode */}
      {!isGideon && !isGideonPage && !isVisionActive && (
        <div className={`lg:hidden fixed top-0 left-0 right-0 h-[72px] backdrop-blur-xl border-b z-[60] flex items-center justify-between px-5 ${
          isDark ? 'bg-[#09090b]/80 border-white/5' : 'bg-white/80 border-black/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
               <LayoutGrid className="w-4 h-4 text-black" />
            </div>
            <span className={`font-bold text-lg tracking-tight uppercase italic ${
              isDark ? 'text-white' : 'text-[#1A1A1A]'
            }`}>{t.toolsAndProducts}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' 
                  : 'bg-black/5 border-black/10 text-amber-600 hover:bg-black/10'
              }`}
              title="Change Language"
            >
              {lang === 'en' ? 'हिन्दी' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'bg-white/5 text-zinc-300 hover:bg-white/10' : 'bg-black/5 text-slate-700 hover:bg-black/10'
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop Only - Suppressed in Vision Mode */}
      {!isVisionActive && (
        <aside className={`hidden lg:flex flex-col w-64 glass border-r z-[1001] shrink-0 ${
          isDark ? 'border-white/5' : 'border-black/5'
        }`}>
          {/* Profile Card */}
          <ProfileCard />

          <nav className="flex-1 px-4 py-2 space-y-1.5 flex flex-col">
            {navItems.map((item) => {
              const active = item.isActive || location.pathname === item.path || (item.id === 'search' && location.pathname === '/search' && !item.isActive);
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative
                    ${active 
                      ? (isDark 
                          ? 'bg-white/10 text-white shadow-xl border border-white/10' 
                          : 'bg-black/10 text-[#1A1A1A] shadow-lg border border-black/10')
                      : (isDark 
                          ? 'text-zinc-500 hover:text-white hover:bg-white/5'
                          : 'text-slate-600 hover:text-black hover:bg-black/5')
                    }
                  `}
                >
                  <div className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300 shrink-0`}>
                     <Icon className="w-6 h-6" />
                  </div>
                  <span className={`ml-4 font-semibold transition-all duration-300 ${
                    active 
                      ? (isDark ? 'text-white' : 'text-[#1A1A1A]')
                      : (isDark ? 'text-zinc-500 group-hover:text-white' : 'text-slate-600 group-hover:text-black')
                  }`}>
                    {item.label}
                  </span>

                  {active && (
                    <motion.div 
                      layoutId="active-nav-bg"
                      className={`absolute inset-0 rounded-2xl -z-10 ${
                        isDark ? 'bg-white/5' : 'bg-black/5'
                      }`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Controls: Language & Theme Switches */}
          <div className={`px-3 pb-3 space-y-1.5 border-t ${
            isDark ? 'border-white/5' : 'border-black/5'
          } pt-3`}>
            {/* Language Switch Button */}
            <button
              onClick={toggleLang}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                isDark ? 'hover:bg-white/6 bg-white/[0.02]' : 'hover:bg-black/6 bg-black/[0.02]'
              }`}
              title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                  isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-500/15 text-amber-600'
                }`}>
                  <Languages size={16} />
                </div>
                <div className="text-left">
                  <div className={`text-[12px] font-semibold leading-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    {lang === 'en' ? 'English' : 'हिन्दी'}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {lang === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isDark ? 'bg-white/10 text-amber-400 border border-white/5' : 'bg-black/5 text-amber-700 border border-black/5'
              }`}>
                {lang === 'en' ? 'हिन्दी' : 'EN'}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group ${
                isDark ? 'hover:bg-white/6 bg-white/[0.02]' : 'hover:bg-black/6 bg-black/[0.02]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-500/15 text-indigo-600'
                }`}>
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </div>
                <div className="text-left">
                  <div className={`text-[12px] font-semibold leading-tight ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    {isDark ? t.lightMode : t.darkMode}
                  </div>
                  <div className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    {isDark ? (lang === 'hi' ? 'लाइट थीम' : 'Light Mode') : (lang === 'hi' ? 'डार्क थीम' : 'Dark Mode')}
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-700'
              }`}>
                {isDark ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 relative overflow-hidden flex flex-col border-r min-w-0 ${
        isDark ? 'bg-[#09090b] border-white/5' : 'bg-[#f8fafc] border-black/5'
      } ${!isGideon ? 'main-content' : ''}`}>
        {!isGideon && <Navbar />}
        <div className={`absolute inset-0 pointer-events-none ${
          isDark 
            ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_50%)]' 
            : 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.03),transparent_50%)]'
        }`} />
        <div className={`flex-1 relative w-full ${isGideon ? 'overflow-hidden' : 'overflow-y-auto scrollbar-premium'}`}>
          <div className={`${isGideon ? 'p-0 h-full' : 'layout-container pb-20 lg:pb-8 min-h-full'}`}>
            <Outlet />
          </div>
        </div>
      </main>

      {/* Right: AI Preview Sidebar (hidden on mobile, shown on xl screens) */}
      <aside className="hidden xl:block w-[340px] sticky top-0 h-screen overflow-y-auto scrollbar-premium shrink-0 pl-6 pr-2 pt-4">
        <AIPreviewSidebar />
      </aside>
      </div>

      {/* Mobile Bottom Navigation - Suppressed in Vision Mode */}
      {!isVisionActive && (
        <nav className={`fixed bottom-0 left-0 right-0 z-[200] backdrop-blur-3xl border-t lg:hidden flex items-center justify-around px-2 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] ${
          isDark ? 'bg-[#09090b]/95 border-white/5' : 'bg-white/95 border-black/5'
        }`}>
          {navItems.map((item) => {
            const active = item.isActive || location.pathname === item.path || (item.id === 'search' && location.pathname === '/search' && !item.isActive);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center w-[72px] h-12 rounded-xl transition-all duration-300 ${
                  active 
                    ? (isDark ? "text-amber-500" : "text-amber-600")
                    : (isDark ? "text-zinc-500 hover:text-white" : "text-slate-600 hover:text-black")
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} className={`mb-1 transition-transform ${active ? 'scale-110' : ''}`} />
                <span className={`text-[10px] tracking-tight ${active ? 'font-black' : 'font-bold'} ${
                  active ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-400' : 'text-slate-600')
                }`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
}

