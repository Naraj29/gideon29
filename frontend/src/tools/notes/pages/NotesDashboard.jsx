import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  StickyNote, 
  Pin, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import notesService from '../services/notesService';

export default function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await notesService.getNotes();
      setNotes(data.results || data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (e, note) => {
    e.stopPropagation();
    try {
      await notesService.updateNote(note.id, { is_pinned: !note.is_pinned });
      fetchNotes();
    } catch (err) {
      console.error('Failed to pin/unpin', err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Archive this note?')) return;
    try {
      await notesService.deleteNote(id);
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-6">
      {/* Tool Header */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20"
        >
          <StickyNote className="w-8 h-8 text-black" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white"
        >
          Note <span className="text-amber-500">Sanctuary</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg"
        >
          Capture brilliance. Organize chaos. Retain everything.
        </motion.p>
      </header>

      {/* Action Bar */}
      <section className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your collective intelligence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-16 pr-8 h-16 text-lg"
          />
        </div>
        <button 
          onClick={() => navigate('/tools/notes/edit')}
          className="btn-premium btn-primary h-16 px-10 rounded-2xl text-lg font-bold shadow-lg shadow-amber-500/20 whitespace-nowrap"
        >
          <Plus className="w-6 h-6" />
          Quick Jot
        </button>
      </section>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Accessing Vault...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 glass rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center text-center px-10"
        >
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8">
            <Sparkles className="w-10 h-10 text-zinc-700" />
          </div>
          <p className="text-zinc-500 text-xl font-medium">Your sanctuary is empty. Start recording your journey.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/tools/notes/edit/${note.id}`)}
                className="card-premium group relative h-[320px] flex flex-col p-8 cursor-pointer overflow-hidden"
              >
                {/* Pin Badge */}
                <button
                  onClick={(e) => handleTogglePin(e, note)}
                  className={`absolute top-6 right-6 p-3 rounded-xl transition-all z-20 ${
                    note.is_pinned 
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' 
                      : 'bg-white/5 text-zinc-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-current' : ''}`} />
                </button>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-zinc-500 line-clamp-5 leading-relaxed">
                    {note.content || 'Start writing your legacy...'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => handleDelete(e, note.id)}
                      className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-2 bg-white/5 rounded-xl group-hover:bg-amber-500 group-hover:text-black transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Ambient Highlight */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-500/5 blur-[80px] group-hover:bg-amber-500/10 transition-all rounded-full" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && notes.length > 0 && (
        <footer className="mt-20 flex justify-center">
          <div className="px-6 py-2 glass rounded-full border border-white/10 flex items-center gap-4 text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Insights:</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-extrabold text-white">{notes.length} Documents</span>
            <div className="h-1 w-1 rounded-full bg-amber-500" />
            <span className="text-[10px] font-extrabold text-white">{notes.filter(n => n.is_pinned).length} Pinned</span>
          </div>
        </footer>
      )}
    </div>
  );
}
