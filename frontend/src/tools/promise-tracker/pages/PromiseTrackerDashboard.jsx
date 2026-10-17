import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XSquare, 
  Plus, 
  Trash2, 
  Heart,
  Clock,
  Sparkles,
  Search,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import promiseService from '../services/promiseService';

export default function PromiseDashboard() {
  const [promises, setPromises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPromise, setNewPromise] = useState({ title: '', description: '', deadline: '', consequence: '' });

  useEffect(() => {
    fetchPromises();
  }, []);

  const fetchPromises = async () => {
    setLoading(true);
    try {
      const data = await promiseService.getEntries();
      setPromises(data.results || data);
    } catch (err) {
      console.error('Failed to fetch promises', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromise = async (e) => {
    e.preventDefault();
    if (!newPromise.title.trim()) return;
    try {
      await promiseService.createEntry({ ...newPromise, status: 'pending' });
      setNewPromise({ title: '', description: '', deadline: '', consequence: '' });
      setIsAdding(false);
      fetchPromises();
    } catch (err) {
      console.error('Failed to add promise', err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await promiseService.updateEntry(id, { status });
      fetchPromises();
    } catch (err) {
      console.error('Failed to update promise', err);
    }
  };

  const handleDeletePromise = async (id) => {
    try {
      await promiseService.deleteEntry(id);
      fetchPromises();
    } catch (err) {
      console.error('Failed to delete promise', err);
    }
  };

  const statusMeta = {
    pending: { label: 'Active Oath', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <ShieldAlert className="w-5 h-5" /> },
    kept: { label: 'Honor Kept', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: <ShieldCheck className="w-5 h-5" /> },
    broken: { label: 'Oath Broken', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <XSquare className="w-5 h-5" /> }
  };

  const honorScore = promises.filter(p => p.status === 'kept').length;
  const brokenScore = promises.filter(p => p.status === 'broken').length;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Tool Header */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-600/20"
        >
          <ShieldAlert className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white"
        >
          Oath <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Tracker</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg font-light leading-relaxed max-w-xl mx-auto"
        >
          "A man is only as good as his word." <br/> Track your commitments. Never break your moral code.
        </motion.p>
      </header>

      {/* Honor Metric */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-500/60">Honor Guard</span>
            <div className="text-4xl font-black text-white">{honorScore}</div>
            <span className="text-xs text-zinc-500">Kept Oaths</span>
        </div>
        <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500/60">Broken Oaths</span>
            <div className="text-4xl font-black text-white">{brokenScore}</div>
            <span className="text-xs text-zinc-500">Moral Debt</span>
        </div>
      </div>

      {/* Main Action Area */}
      <section className="mb-10 relative z-20">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full h-24 glass rounded-[2.5rem] border border-white/5 flex items-center px-10 gap-6 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all group text-left shadow-xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all shrink-0">
              <Heart className="w-6 h-6 group-hover:text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">Make a new solemn promise...</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium p-10 bg-zinc-950/40 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldAlert size={120} className="text-white" />
             </div>
             
            <form onSubmit={handleAddPromise} className="relative z-10">
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Oath Subject</label>
                   <input
                    autoFocus
                    type="text"
                    placeholder="What do you commit to?"
                    className="w-full bg-transparent border-none outline-none text-3xl font-black text-white placeholder-white/5"
                    value={newPromise.title}
                    onChange={(e) => setNewPromise({ ...newPromise, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Deadline (Optional)</label>
                      <input 
                        type="datetime-local"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        value={newPromise.deadline}
                        onChange={(e) => setNewPromise({ ...newPromise, deadline: e.target.value })}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Consequence of Failure</label>
                      <input 
                        type="text"
                        placeholder="What happens if you fail?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                        value={newPromise.consequence}
                        onChange={(e) => setNewPromise({ ...newPromise, consequence: e.target.value })}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 ml-1">Details & Moral Code Background</label>
                   <textarea 
                    placeholder="Why is this oath important? Describe the stakes..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none font-light"
                    value={newPromise.description}
                    onChange={(e) => setNewPromise({ ...newPromise, description: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/5">
                    <button 
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-6 py-3 rounded-xl text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors"
                    >
                      Wait, Not yet
                    </button>
                    <button 
                      type="submit"
                      disabled={!newPromise.title.trim()}
                      className="btn-premium btn-primary px-10 h-14 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20"
                    >
                      <Sparkles size={16} /> BIND MY OATH
                    </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </section>

      {/* Promise List */}
      <section className="space-y-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : promises.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-32 glass rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center text-center px-10"
            >
              <ShieldCheck className="w-16 h-16 text-zinc-800 mb-8" />
              <p className="text-zinc-500 text-lg font-light">No active oaths at the moment. <br/> Is your moral code complete?</p>
            </motion.div>
          ) : (
            promises.map((promise) => (
              <motion.div
                key={promise.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group glass rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                  promise.status === 'kept' ? 'opacity-60 grayscale-[0.5]' : 
                  promise.status === 'broken' ? 'border-red-500/30 bg-red-500/[0.02]' : 
                  'border-white/5 hover:border-amber-500/30 shadow-2xl'
                }`}
              >
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${statusMeta[promise.status].bg} ${statusMeta[promise.status].color}`}>
                    {statusMeta[promise.status].icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${statusMeta[promise.status].bg} ${statusMeta[promise.status].color} ${statusMeta[promise.status].border}`}>
                         {statusMeta[promise.status].label}
                       </span>
                    </div>
                    <h3 className={`text-2xl font-black mb-3 tracking-tight ${promise.status === 'broken' ? 'text-red-400' : 'text-white'}`}>
                      {promise.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-light leading-relaxed mb-6 line-clamp-2">
                      {promise.description || "No further details recorded for this oath."}
                    </p>
                    
                    {promise.consequence && promise.status !== 'kept' && (
                       <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] font-bold text-red-400/80 uppercase tracking-widest mb-4">
                          <AlertTriangle size={14} /> Consequence: {promise.consequence}
                       </div>
                    )}

                    {promise.deadline && promise.status === 'pending' && (
                      <div className="flex items-center gap-2 text-zinc-600 text-xs font-bold">
                        <Clock className="w-4 h-4" />
                        Expires: {new Date(promise.deadline).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    {promise.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(promise.id, 'kept')}
                          className="flex-1 md:w-16 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
                          title="Fulfull Oath"
                        >
                          <CheckCircle2 size={24} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(promise.id, 'broken')}
                          className="flex-1 md:w-16 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-black transition-all shadow-xl"
                          title="Break Oath"
                        >
                          <XSquare size={24} />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDeletePromise(promise.id)}
                      className="flex-1 md:w-16 h-14 bg-white/5 text-zinc-600 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
