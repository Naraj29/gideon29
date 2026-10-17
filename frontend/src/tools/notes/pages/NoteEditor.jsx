import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Pin, 
  Sparkles,
  Loader2,
  Share2,
  Trash
} from 'lucide-react';
import notesService from '../services/notesService';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState({
    title: '',
    content: '',
    is_pinned: false,
    tags: []
  });

  useEffect(() => {
    if (id) {
      loadNote(id);
    }
  }, [id]);

  const loadNote = async (noteId) => {
    setLoading(true);
    try {
      const data = await notesService.getNote(noteId);
      setNote(data);
    } catch (err) {
      console.error(err);
      navigate('/tools/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await notesService.updateNote(id, note);
      } else {
        await notesService.createNote(note);
      }
      navigate('/tools/notes');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Opening Document...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Top Navbar */}
      <nav className="flex items-center justify-between mb-12">
        <button 
          className="btn-premium btn-secondary h-12 px-6 rounded-2xl" 
          onClick={() => navigate('/tools/notes')}
        >
          <ArrowLeft size={18} /> Documentation
        </button>

        <div className="flex gap-4">
          <button 
            className={`btn-premium h-12 w-12 rounded-2xl p-0 transition-all ${
              note.is_pinned 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'btn-secondary'
            }`}
            onClick={() => setNote({ ...note, is_pinned: !note.is_pinned })}
          >
            <Pin size={18} className={note.is_pinned ? 'fill-current' : ''} />
          </button>
          
          <button 
            className="btn-premium btn-primary h-12 px-8 rounded-2xl font-bold" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Synchronizing...' : (id ? 'Update Note' : 'Create Note')}
          </button>
        </div>
      </nav>

      {/* Editor Surface */}
      <div className="card-premium p-0 overflow-hidden border border-white/5 bg-zinc-950/40">
        <div className="flex flex-wrap items-center gap-8 py-6 px-10 border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-2 text-amber-500/60">
            <Sparkles size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Knowledge Module</span>
          </div>
          
          <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
          
          <div className="flex items-center gap-4 text-zinc-500">
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Status: <span className="text-emerald-500">Authenticated</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">
              Format: <span className="text-zinc-300">Markdown Capable</span>
            </span>
          </div>

          <div className="flex-1 flex justify-end gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Ready
            </div>
          </div>
        </div>

        <div className="p-10 md:p-16">
          <textarea
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            placeholder="A title for the archives..."
            className="w-full bg-transparent border-none outline-none text-4xl md:text-6xl font-bold text-white placeholder-white/5 mb-10 selection:bg-amber-500/30 resize-none h-auto"
            rows="1"
          />

          <textarea
            value={note.content}
            onChange={(e) => setNote({ ...note, content: e.target.value })}
            placeholder="Begin your transcription..."
            autoFocus
            className="w-full min-h-[500px] bg-transparent border-none outline-none text-xl md:text-2xl text-zinc-300 placeholder-zinc-700 leading-relaxed resize-none selection:bg-amber-500/30"
          />
        </div>
      </div>

      <footer className="mt-8 flex items-center justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          End-to-End Encrypted Storage
        </p>
        <div className="h-4 w-[1px] bg-white/10" />
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          Real-time Sync Active
        </p>
      </footer>
    </motion.div>
  );
}
