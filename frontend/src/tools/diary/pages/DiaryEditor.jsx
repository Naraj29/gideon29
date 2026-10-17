import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { diaryApi } from '../services/diary.api';
import unifiedService from '../../../lib/unifiedService';
import plannerService from '../../event-planner/services/plannerService';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Calendar as CalendarIcon, 
  Smile, 
  Loader2, 
  Sparkles,
  ChevronDown,
  Clock,
  Flag,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

const MOODS = ['Happy', 'Determined', 'Calm', 'Reflective', 'Anxious', 'Sad', 'Excited'];

export default function DiaryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: '',
    entry_date: new Date().toLocaleDateString('en-CA'),
    project: null,
  });

  const [dayContext, setDayContext] = useState(null);
  const [showContext, setShowContext] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
    fetchProjects();
  }, [id]);

  const fetchProjects = async () => {
    try {
      const data = await plannerService.getProjects();
      setProjects(data.results || data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  useEffect(() => {
    if (entry.entry_date) {
      fetchDayContext(entry.entry_date);
    }
  }, [entry.entry_date]);

  const fetchDayContext = async (date) => {
    try {
      const details = await unifiedService.getDayDetails(date);
      setDayContext(details);
    } catch (err) {
      console.error('Failed to fetch day context', err);
    }
  };

  const loadEntry = async (entryId) => {
    setLoading(true);
    try {
      const data = await diaryApi.get(entryId);
      setEntry({
        title: data.title,
        content: data.content,
        mood: data.mood || '',
        entry_date: data.entry_date,
        project: data.project,
      });
    } catch (err) {
      console.error(err);
      navigate('/tools/diary');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!entry.content.trim()) return;
    setSaving(true);
    try {
      if (id) {
        await diaryApi.update(id, entry);
      } else {
        await diaryApi.create(entry);
      }
      navigate('/tools/diary');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    setDeleting(true);
    try {
      await diaryApi.delete(id);
      navigate('/tools/diary');
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8"
    >
      <div className="flex-1">
        {/* Top Toolbar */}
        <nav className="flex items-center justify-between mb-8">
          <button 
            className="btn-premium btn-secondary h-12 px-6 rounded-2xl" 
            onClick={() => navigate('/tools/diary')}
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex gap-4">
            {id && (
              <button 
                className="btn-premium bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 h-12 w-12 rounded-2xl p-0" 
                onClick={handleDelete} 
                disabled={deleting || saving}
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              className="btn-premium btn-primary h-12 px-8 rounded-2xl font-bold" 
              onClick={handleSave} 
              disabled={saving || deleting || !entry.content.trim()}
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Preserving...' : 'Preserve Memory'}
            </button>
          </div>
        </nav>

        <div className="card-premium p-0 overflow-hidden border border-white/5 bg-zinc-950/40">
          {/* Meta Header */}
          <div className="flex flex-wrap items-center gap-4 md:gap-8 py-6 px-6 md:px-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 md:gap-3 text-zinc-400 group relative">
              <CalendarIcon size={18} className="text-amber-500/60" />
              <input
                type="date"
                value={entry.entry_date}
                onChange={(e) => setEntry({ ...entry, entry_date: e.target.value })}
                className="bg-transparent border-none outline-none text-sm font-bold uppercase tracking-widest cursor-pointer text-white focus:text-amber-500 transition-colors"
              />
            </div>

            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

            <div className="flex items-center gap-3 text-zinc-400 relative">
              <Smile size={18} className="text-amber-500/60" />
              <select
                value={entry.mood}
                onChange={(e) => setEntry({ ...entry, mood: e.target.value })}
                className="bg-transparent border-none outline-none text-sm font-bold uppercase tracking-widest cursor-pointer text-white appearance-none pr-6 focus:text-amber-500 transition-colors"
              >
                <option value="" className="bg-zinc-900">Current Mood</option>
                {MOODS.map(m => (
                  <option key={m} value={m} className="bg-zinc-900">{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            </div>

            <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

            <div className="flex items-center gap-3 text-zinc-400 relative">
              <Flag size={18} className="text-emerald-500/60" />
              <select
                value={entry.project || ''}
                onChange={(e) => setEntry({ ...entry, project: e.target.value || null })}
                className="bg-transparent border-none outline-none text-sm font-bold uppercase tracking-widest cursor-pointer text-white appearance-none pr-6 focus:text-emerald-500 transition-colors"
              >
                <option value="" className="bg-zinc-900">No Project Linked</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            </div>
          </div>

          {/* Editor Content */}
          <div className="p-6 md:p-16">
            <input
              type="text"
              placeholder="A title for this memory..."
              value={entry.title}
              onChange={(e) => setEntry({ ...entry, title: e.target.value })}
              className="w-full bg-transparent border-none outline-none text-4xl md:text-5xl font-bold text-white placeholder-white/5 mb-10 selection:bg-amber-500/30"
            />

            <textarea
              value={entry.content}
              onChange={(e) => setEntry({ ...entry, content: e.target.value })}
              placeholder="Begin your reflection..."
              autoFocus
              className="w-full min-h-[300px] md:min-h-[500px] bg-transparent border-none outline-none text-xl text-zinc-300 placeholder-zinc-700 leading-relaxed resize-none selection:bg-amber-500/30"
            />
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      <aside className="w-full lg:w-80 space-y-6">
        <div className="card-premium p-6 border border-white/5 bg-zinc-900/50 backdrop-blur-xl">
           <h3 className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-amber-500" /> Day Context
           </h3>
           
           <div className="space-y-6">
              {/* Calendar Events */}
              <div>
                 <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-tighter mb-3">
                    <Clock size={12} /> Timeline
                 </div>
                 <div className="space-y-2">
                    {dayContext?.calendar?.length > 0 ? dayContext.calendar.map(event => (
                       <div key={event.id} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                          <p className="font-bold text-white truncate">{event.title}</p>
                          <p className="text-zinc-500 mt-1">{format(new Date(event.start_time), 'p')}</p>
                       </div>
                    )) : (
                       <p className="text-zinc-600 text-[10px] italic">No events recorded.</p>
                    )}
                 </div>
              </div>

              {/* Projects */}
              <div>
                 <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-tighter mb-3">
                    <Flag size={12} /> Milestones
                 </div>
                 <div className="space-y-2">
                    {dayContext?.projects?.length > 0 ? dayContext.projects.map(project => (
                       <div key={project.id} className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-xs">
                          <p className="font-bold text-emerald-400">{project.name}</p>
                       </div>
                    )) : (
                       <p className="text-zinc-600 text-[10px] italic">No milestones reached.</p>
                    )}
                 </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                 <p className="text-zinc-600 text-[9px] uppercase tracking-widest leading-loose">
                    This context helps you bridge the gap between action and reflection.
                 </p>
              </div>
           </div>
        </div>
      </aside>
    </motion.div>
  );
}

