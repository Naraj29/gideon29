import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  ShieldCheck, 
  Copy, 
  Trash2, 
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  Loader2,
  Lock
} from 'lucide-react';
import vaultService from '../services/vaultService';

export default function VaultDashboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await vaultService.getEntries();
      setEntries(data.results || data);
    } catch (err) {
      console.error('Failed to fetch vault entries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Erase this credential from The Vault?')) return;
    try {
      await vaultService.deleteEntry(id);
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation();
    if (text) {
      navigator.clipboard.writeText(text);
      // Ideally show a toast here
    }
  };

  const togglePasswordVisibility = (e, id) => {
    e.stopPropagation();
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.username_or_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-6 font-sans">
      {/* Tool Header */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-3xl bg-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20"
        >
          <ShieldCheck className="w-8 h-8 text-black" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white"
        >
          The <span className="text-cyan-500 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Vault</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-500 text-lg"
        >
          Zero-knowledge interface. Encrypted at rest. Absolute security.
        </motion.p>
      </header>

      {/* Action Bar */}
      <section className="flex flex-col md:flex-row gap-6 mb-12">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5 group-focus-within:text-cyan-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search credentials..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-16 pr-8 h-16 text-lg focus:border-cyan-500/50 focus:ring-cyan-500/20"
          />
        </div>
        <button 
          onClick={() => navigate('/tools/vault/edit')}
          className="btn-premium h-16 px-10 rounded-2xl text-lg font-bold shadow-lg shadow-cyan-500/20 whitespace-nowrap bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:opacity-90"
        >
          <Plus className="w-6 h-6" />
          Store Asset
        </button>
      </section>

      {/* Entries List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Decrypting Vault...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 glass rounded-[3rem] border border-cyan-500/10 border-dashed flex flex-col items-center text-center px-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyan-500/5 blur-[100px] rounded-full" />
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 relative z-10 border border-white/5">
            <Lock className="w-10 h-10 text-zinc-700" />
          </div>
          <p className="text-zinc-500 text-xl font-medium relative z-10">The Vault is empty. Secure your first asset.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredEntries.map((entry) => {
              const showPwd = visiblePasswords[entry.id];
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => navigate(`/tools/vault/edit/${entry.id}`)}
                  className="card-premium group relative flex flex-col p-6 cursor-pointer overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-bold text-cyan-500 shrink-0 uppercase">
                      {entry.title ? entry.title.charAt(0) : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate">{entry.title || 'Unknown Asset'}</h3>
                      <p className="text-zinc-400 text-sm truncate">{entry.username_or_email || 'No identity set'}</p>
                    </div>
                    {entry.url && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(entry.url, '_blank'); }}
                        className="p-2 text-zinc-600 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 rounded-lg transition-all"
                        title="Open URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 mb-6 group-hover:border-cyan-500/20 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <Lock className="w-4 h-4 text-zinc-600 shrink-0" />
                      <span className={`text-sm tracking-widest font-mono truncate ${showPwd ? 'text-white' : 'text-zinc-500'}`}>
                        {entry.password ? (showPwd ? entry.password : '••••••••••••••••') : 'No password set'}
                      </span>
                    </div>
                    {entry.password && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button 
                          onClick={(e) => togglePasswordVisibility(e, entry.id)}
                          className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        >
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={(e) => copyToClipboard(e, entry.password)}
                          className="p-1.5 text-zinc-500 hover:text-cyan-400 transition-colors"
                          title="Copy Password"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                     <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                       SECURE
                     </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, entry.id)}
                        className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-2 bg-white/5 rounded-xl group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Ambient Highlight */}
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/5 blur-[60px] group-hover:bg-cyan-500/10 transition-all rounded-full pointer-events-none" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      {!loading && entries.length > 0 && (
        <footer className="mt-20 flex justify-center">
          <div className="px-6 py-2 glass rounded-full border border-cyan-500/20 flex items-center gap-4 text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">Vault Status:</span>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-extrabold text-white">{entries.length} Assets Protected</span>
          </div>
        </footer>
      )}
    </div>
  );
}
