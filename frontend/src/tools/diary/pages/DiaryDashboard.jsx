import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Calendar, 
  BookHeart, 
  LayoutGrid, 
  List, 
  ArrowRight,
  Sparkles,
  History
} from 'lucide-react';

import { diaryApi } from '../services/diary.api';

export default function DiaryDashboard() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchEntries = async (query = '') => {
    try {
      setLoading(true);
      const data = await diaryApi.list({ search: query });
      setEntries(data.results || data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-amber-500/20 border border-white/10"
        >
          <BookHeart className="w-10 h-10 text-black" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 text-white"
        >
          Memory <span className="text-amber-500">Archive</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-xl max-w-2xl mx-auto"
        >
          Your personal sanctuary for reflection and growth. Encrypted. Private. Infinite.
        </motion.p>
      </header>

      {/* Toolbar */}
      <section className="mb-12 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            className="input-premium pl-16 rounded-[2rem] h-16 text-lg"
            placeholder="Search your memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="glass rounded-[2rem] p-1.5 flex gap-1 border border-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <LayoutGrid size={22} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
            >
              <List size={22} />
            </button>
          </div>

          <button 
            className="btn-premium btn-primary h-16 px-10 rounded-[2rem] flex-1 md:flex-none text-lg" 
            onClick={() => navigate('/tools/diary/entry')}
          >
            <Plus size={24} /> New Reflection
          </button>
        </div>
      </section>

      {/* Entries Section */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-20 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="text-zinc-500 font-medium tracking-wide">Retrieving your thoughts...</p>
          </motion.div>
        ) : entries.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[3rem] p-20 text-center border border-white/5"
          >
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
              <History className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">A blank page awaits</h3>
            <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto">
              {search ? "No entries match your search." : "Build your secure, private archive and chronicle your journey."}
            </p>
            {!search && (
              <button className="btn-premium btn-primary px-12 h-14" onClick={() => navigate('/tools/diary/entry')}>
                Start Journaling <ArrowRight size={20} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/tools/diary/entry/${entry.id}`)}
                className={`card-premium group cursor-pointer border border-white/5 hover:border-amber-500/30 flex flex-col transition-all duration-500 ${viewMode === 'list' ? 'p-8 flex-row items-center gap-8' : 'p-10 min-h-[380px]'}`}
              >
                <div className={`flex flex-col flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3 text-amber-500 mb-4 opacity-100 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Memoir</span>
                    </div>
                  </div>

                  <h3 className={`font-bold text-white leading-tight mb-4 group-hover:text-amber-500 transition-colors truncate ${viewMode === 'list' ? 'text-2xl' : 'text-3xl'}`}>
                    {entry.title || 'Untitled Thought'}
                  </h3>

                  <p className={`text-zinc-500 leading-relaxed transition-colors group-hover:text-zinc-400 overflow-hidden ${viewMode === 'list' ? 'text-lg line-clamp-1' : 'text-xl line-clamp-4 flex-1'}`}>
                    {entry.content_preview || 'The details of this reflection are preserved within.'}
                  </p>
                </div>

                <div className={`flex items-center justify-between border-t border-white/5 pt-8 mt-6 ${viewMode === 'list' ? 'border-t-0 pt-0 mt-0 min-w-[180px]' : ''}`}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      <Calendar size={14} />
                      <span className="text-xs font-bold uppercase tracking-widest">{formatDate(entry.entry_date)}</span>
                    </div>
                    {entry.mood && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60 mt-2">{entry.mood}</span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500 bg-amber-500">
                    <ArrowRight size={20} className="text-black" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

