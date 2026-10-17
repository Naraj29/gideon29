import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  KeyRound,
  RefreshCw,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import vaultService from '../services/vaultService';

export default function VaultEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [entry, setEntry] = useState({
    title: '',
    username_or_email: '',
    password: '',
    url: '',
    notes: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  
  // Generator State
  const [genLength, setGenLength] = useState(16);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
  }, [id]);

  const loadEntry = async (entryId) => {
    setLoading(true);
    try {
      const data = await vaultService.getEntry(entryId);
      setEntry(data);
    } catch (err) {
      console.error(err);
      navigate('/tools/vault');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await vaultService.updateEntry(id, entry);
      } else {
        await vaultService.createEntry(entry);
      }
      navigate('/tools/vault');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const syms = '!@#$%^&*()_+~|}{[]:;?><,./-=';
    
    let validChars = chars;
    if (genNumbers) validChars += nums;
    if (genSymbols) validChars += syms;

    let generated = '';
    for (let i = 0; i < genLength; i++) {
      generated += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }
    
    setEntry({ ...entry, password: generated });
    setShowPassword(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <p className="text-zinc-600 font-bold text-xs uppercase tracking-widest">Decrypting Asset...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20 px-6"
    >
      <nav className="flex items-center justify-between mb-12">
        <button 
          className="btn-premium btn-secondary h-12 px-6 rounded-2xl hover:bg-white/10" 
          onClick={() => navigate('/tools/vault')}
        >
          <ArrowLeft size={18} /> Disconnect
        </button>

        <button 
          className="btn-premium h-12 px-8 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-black border-none" 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Encrypting...' : (id ? 'Update Secure Asset' : 'Store Secure Asset')}
        </button>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-8 border border-white/5 bg-black/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <KeyRound className="w-40 h-40 text-cyan-500" />
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Service / Asset Name</label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => setEntry({ ...entry, title: e.target.value })}
                  placeholder="e.g. Acme Corp Server"
                  className="input-premium w-full text-xl h-14 bg-white/5 border-white/10 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Identity (Username/Email)</label>
                <input
                  type="text"
                  value={entry.username_or_email}
                  onChange={(e) => setEntry({ ...entry, username_or_email: e.target.value })}
                  placeholder="admin@acme.com"
                  className="input-premium w-full h-14 bg-white/5 border-white/10 focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">Authentication Token (Password)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={entry.password}
                    onChange={(e) => setEntry({ ...entry, password: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="input-premium w-full text-xl h-14 bg-white/5 border-white/10 focus:border-emerald-500 font-mono pr-24"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(entry.password)}
                      className="p-2 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Access URI (URL)</label>
                <input
                  type="url"
                  value={entry.url}
                  onChange={(e) => setEntry({ ...entry, url: e.target.value })}
                  placeholder="https://console.acme.com"
                  className="input-premium w-full h-14 bg-white/5 border-white/10 focus:border-cyan-500 font-mono text-cyan-400/80"
                />
              </div>
            </div>
          </div>

          <div className="card-premium p-8 border border-white/5 bg-black/40">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Encrypted Notes</label>
            <textarea
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              placeholder="Recovery codes, PINs, or additional secure contexts..."
              className="w-full min-h-[150px] bg-white/5 border border-white/10 outline-none text-zinc-300 placeholder-zinc-700 leading-relaxed resize-y p-4 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
            />
          </div>
        </div>

        {/* Generator Sidebar */}
        <div className="space-y-6">
          <div className="card-premium p-6 border border-cyan-500/20 bg-cyan-950/20">
            <div className="flex items-center gap-2 mb-6 text-cyan-500">
               <RefreshCw size={20} />
               <h3 className="font-bold uppercase tracking-widest text-sm">Generator</h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Length</label>
                  <span className="text-xs font-bold text-cyan-400">{genLength}</span>
                </div>
                <input 
                  type="range" 
                  min="8" 
                  max="64" 
                  value={genLength} 
                  onChange={(e) => setGenLength(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Numbers</label>
                <button 
                  onClick={() => setGenNumbers(!genNumbers)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${genNumbers ? 'bg-cyan-500' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${genNumbers ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Symbols</label>
                <button 
                  onClick={() => setGenSymbols(!genSymbols)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${genSymbols ? 'bg-cyan-500' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${genSymbols ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              <button 
                onClick={generatePassword}
                className="w-full btn-premium bg-white/5 hover:bg-cyan-500 hover:text-black border border-cyan-500/30 text-cyan-500 font-bold tracking-wide transition-all h-12"
              >
                Synthesize Key
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
