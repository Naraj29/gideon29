import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  X,
  BookOpen,
  Calendar,
  HeartPulse,
  LayoutGrid,
  Zap,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  History,
  Shield,
  ShieldOff,
  Share2,
  ExternalLink,
  Ghost,
  Camera
} from 'lucide-react';
import GideonCamera from '../components/GideonCamera';
import aiService from '../services/aiService';
import api from '../lib/api';
import unifiedService from '../lib/unifiedService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function HomePage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { lang, t } = useLang();
  const [hasPrompt, setHasPrompt] = useState(false);

  // Sync isCameraOpen with URL param on mount/updates
  useEffect(() => {
    const vision = searchParams.get('vision') === 'true';
    if (vision !== isCameraOpen) setIsCameraOpen(vision);
  }, [searchParams]);

  // Handle prompt from URL parameter
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && promptParam.trim()) {
      setHasPrompt(true);
      const textPrompt = promptParam.trim();
      setMessages([{ role: 'user', content: textPrompt }]);
      setInput('');
      setLoading(true);
      
      // Clear the prompt from URL
      searchParams.delete('prompt');
      setSearchParams(searchParams);

      const streamId = Date.now();
      setMessages(prev => [...prev, {
        role: 'assistant', content: '', _streamId: streamId, action: null, success: true,
      }]);

      aiService.chat(textPrompt, {
        onToken: (token) => {
          setMessages(prev => prev.map(m =>
            m._streamId === streamId ? { ...m, content: m.content + token } : m
          ));
        },
      })
        .then(data => {
          const GideonMsg = data.message || "I processed that for you.";
          setMessages(prev => prev.map(m =>
            m._streamId === streamId
              ? { ...m, content: GideonMsg, action: data.action, success: data.success, _streamId: undefined }
              : m
          ));
          speakResponse(GideonMsg, data.voice_token, data.voice_base64);
        })
        .catch(err => {
          console.error("AI Error:", err);
          setMessages(prev => prev.map(m =>
            m._streamId === streamId
              ? { ...m, content: "I apologize, but I encountered an error processing your request.", action: 'ERROR', success: false, _streamId: undefined }
              : m
          ));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams]);


  const toggleCamera = (open) => {
    if (open) {
      searchParams.set('vision', 'true');
    } else {
      searchParams.delete('vision');
    }
    setSearchParams(searchParams);
  };

  const introText = "Hello. I am Gideon, your Universal Companion. I am here to manage your productivity, your promises, and your sanity. How shall we orchestrate your day today?";

  // --- TYPEWRITER EFFECT FOR INTRO (skip if prompt from URL) ---
  useEffect(() => {
    if (!hasPrompt) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= introText.length) {
          setMessages([{ role: 'assistant', content: introText.slice(0, index) }]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 30); // Speed of typing
      return () => clearInterval(interval);
    }
  }, [hasPrompt]);

  // --- FETCH HISTORY FOR DRAWER ---
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await unifiedService.getHistory(30);
      setHistoryItems(data.results || data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (historyOpen) fetchHistory();
  }, [historyOpen]);

  // --- HELPERS ---
  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const shareChat = () => {
    const text = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    showToastMsg("Conversation copied to clipboard");
  };

  // --- VOICE OUTPUT (TTS - Instant Neural Pipeline) ---
  const speakResponse = useCallback(async (text, bundledToken = null, base64Data = null) => {
    if (isMuted) return;

    try {
      // 1. HYPER-SYNC: If we have the audio data already, play it INSTANTLY
      if (base64Data) {
        const audio = new Audio(`data:audio/mpeg;base64,${base64Data}`);
        await audio.play();
        return;
      }

      // 2. Fallback: Streaming via Token
      let token = bundledToken;
      if (!token) {
        const tokenResponse = await api.post('tools/ai/voice-token/');
        token = tokenResponse.data.token;
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'https://uc-6js2.onrender.com/api/';
      const streamUrl = `${baseUrl}tools/ai/speak/?token=${token}&text=${encodeURIComponent(text)}`;
      const audio = new Audio(streamUrl);
      
      await audio.play();
    } catch (err) {
      console.warn("Instant TTS failed, falling back to system voice:", err);
      
      // Fallback to basic browser synthesis if backend fails
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const indianFemaleVoice = voices.find(v => 
          (v.lang === 'en-IN' || v.lang === 'hi-IN') && 
          (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'))
        ) || voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN') || voices[0];
        
        if (indianFemaleVoice) utterance.voice = indianFemaleVoice;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isMuted]);

  // --- VOICE INPUT (STT) ---
  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN'; // Good for Hinglish too

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Auto-send if it's a clear voice command
        setTimeout(() => handleSend(transcript), 500);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt = null) => {
    const textPrompt = (typeof customPrompt === 'string') ? customPrompt : input;
    const prompt = textPrompt ? textPrompt.trim() : '';
    
    if (!prompt || loading) return;

    // Clear history for Ghost Protocol (temporary chat)
    if (isTemporaryChat) aiService.clearHistory();

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);

    // Add a streaming placeholder message for assistant
    const streamId = Date.now();
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      _streamId: streamId,
      action: null,
      success: true,
    }]);

    try {
      const data = await aiService.chat(prompt, {
        onToken: (token) => {
          setMessages(prev => prev.map(m =>
            m._streamId === streamId
              ? { ...m, content: m.content + token }
              : m
          ));
        }
      });

      const GideonMsg = data.message || "I processed that for you.";

      // Finalise the streamed message with action metadata
      setMessages(prev => prev.map(m =>
        m._streamId === streamId
          ? { ...m, content: GideonMsg, action: data.action, success: data.success, _streamId: undefined }
          : m
      ));

      // Gideon Speaks!
      speakResponse(GideonMsg, data.voice_token, data.voice_base64);

    } catch (err) {
      console.error("AI Error:", err);
      const errorMsg = `I'm having trouble connecting to my cognitive core. (${err.message})`;
      
      setMessages(prev => prev.map(m =>
        m._streamId === streamId
          ? { ...m, content: errorMsg, action: 'ERROR', success: false, _streamId: undefined }
          : m
      ));
      speakResponse("I'm having trouble connecting to my cognitive core.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { label: 'Write Diary', icon: <BookOpen className="text-blue-400" size={18} />, prompt: 'I want to write a reflection for today.' },
    { label: 'Add Event', icon: <Calendar className="text-amber-400" size={18} />, prompt: 'Schedule a new meeting for me.' },
    { label: 'Log Health', icon: <HeartPulse className="text-emerald-400" size={18} />, prompt: 'I want to log my health metrics.' },
    { label: 'Day Summary', icon: <Zap className="text-indigo-400" size={18} />, prompt: 'Show me my summary for today.' }
  ];

  return (
    <div className={`h-dvh w-full relative overflow-hidden [isolation:isolate] ${
      isDark ? 'bg-[#09090b]' : 'bg-[#F8F7F4]'
    }`}>

      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ===== TOP BAR ===== */}
      {!isCameraOpen && (
        <div className={`fixed top-0 inset-x-0 z-[200] backdrop-blur-2xl border-b pt-[env(safe-area-inset-top,0px)] ${
          isDark ? 'bg-[#09090b]/70 border-white/5' : 'bg-white/70 border-black/5'
        }`}>
          <div className="h-14 md:h-16 px-4 md:px-6 flex items-center justify-between max-w-7xl mx-auto">

            <div className="flex-1" />

            {/* Center Indicator */}
            <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-2xl ${
              isDark ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-black/[0.03] border-black/[0.05]'
            }`}>
              <div className="shrink-0 w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`shrink-0 text-[10px] tracking-[0.2em] uppercase font-black whitespace-nowrap ${
                isDark ? 'text-zinc-500' : 'text-slate-600'
              }`}>
                Gideon · qwen2.5:1.5b
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <button onClick={() => setHistoryOpen(true)} className={`p-2 md:p-2.5 rounded-xl transition-colors ${
                isDark ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-black hover:bg-black/5'
              }`}>
                <History size={16} />
              </button>

              <button
                onClick={() => setIsTemporaryChat(!isTemporaryChat)}
                className={`p-2 md:p-2.5 rounded-xl transition-colors ${
                  isTemporaryChat
                    ? 'bg-amber-500/20 text-amber-500 shadow-lg shadow-amber-500/5'
                    : (isDark ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-black hover:bg-black/5')
                }`}
              >
                {isTemporaryChat ? <ShieldOff size={16} /> : <Shield size={16} />}
              </button>

              <button onClick={shareChat} className={`p-2 md:p-2.5 rounded-xl transition-colors ${
                isDark ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-black hover:bg-black/5'
              }`}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHAT AREA (FULL SCREEN LAYER) ===== */}
      <div className="absolute inset-0 overflow-y-auto z-10 scrollbar-premium scroll-smooth px-3 sm:px-4 md:px-6">
        <div className="max-w-3xl mx-auto w-full pt-20 md:pt-24 pb-[180px] md:pb-[140px]">
          {messages.map((msg, idx) => (
            <div key={idx} className="py-6 md:py-8 border-y border-transparent">
              <div className="flex gap-3 md:gap-5 items-start">
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded border ${
                  msg.role === 'user' 
                    ? (isDark ? 'bg-zinc-800 border-white/5' : 'bg-slate-200 border-black/5')
                    : 'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} className={isDark ? 'text-zinc-400' : 'text-slate-600'} />
                    : <Zap size={14} className="text-indigo-400" />}
                </div>
                <div className={`flex-1 min-w-0 ${
                  msg.role === 'user' ? (isDark ? 'text-zinc-200' : 'text-slate-800') : (isDark ? 'text-white' : 'text-[#1A1A1A]')
                }`}>
                  <div className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words ${
                    isDark ? 'text-zinc-200' : 'text-slate-800'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.action && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded ${
                        msg.success 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {msg.action.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`py-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-zinc-500' : 'text-slate-600'
            }`}>
              <Loader2 className="animate-spin" size={14} />
              {t.processing}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ===== FLOATING INPUT BAR (PROFESSIONAL OVERLAY) ===== */}
      <div className="fixed bottom-0 inset-x-0 z-[150] pointer-events-none">
        <div className={`w-full bg-gradient-to-t via-60% to-transparent pt-16 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-[env(safe-area-inset-bottom,20px)] px-3 sm:px-4 md:px-6 flex flex-col items-center ${
          isDark ? 'from-[#09090b] via-[#09090b]/95' : 'from-white via-white/95'
        }`}>
          
          <div className="w-full max-w-3xl pointer-events-auto">
            {/* Ghost Protocol Banner - Attached to Input Bar for visibility */}
            {isTemporaryChat && (
              <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-t-xl py-1 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2 backdrop-blur-md">
                <Ghost size={10} />
                {t.ghostProtocol}
              </div>
            )}
            
            <div className={`flex items-center gap-2 border rounded-2xl px-2 py-2 backdrop-blur-xl transition-colors ${
              isTemporaryChat 
                ? 'bg-[#121214]/90 border-amber-500/30 shadow-lg shadow-amber-500/5'
                : (isDark ? 'bg-[#121214]/90 border-white/10 shadow-2xl' : 'bg-white/90 border-black/10 shadow-2xl')
            }`}>
            <button
              onClick={toggleListening}
              className={`w-10 h-10 shrink-0 flex items-center justify-center transition-all ${
                isListening ? 'text-indigo-400 scale-110' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black')
              }`}
            >
              {isListening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={16} />}
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.tellGideon}
              className={`flex-1 bg-transparent outline-none text-[15px] px-2 min-w-0 ${
                isDark ? 'text-white placeholder:text-zinc-600' : 'text-[#1A1A1A] placeholder:text-slate-600'
              }`}
            />

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 transition-colors ${isMuted ? 'text-rose-500' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black')}`}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <button
                onClick={() => toggleCamera(true)}
                className={`p-2 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black'}`}
                title="Open Camera"
              >
                <Camera size={16} />
              </button>

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                  input.trim() && !loading
                    ? (isDark ? 'bg-white text-black' : 'bg-slate-900 text-white')
                    : (isDark ? 'bg-white/5 text-zinc-600 grayscale' : 'bg-black/5 text-slate-400 grayscale')
                }`}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
          <p className={`text-[9px] text-center font-medium mt-2 max-w-[80%] mx-auto pb-1 drop-shadow-md pointer-events-auto ${
            isDark ? 'text-zinc-600' : 'text-slate-600'
          }`}>
            {t.gideonMistakes}
          </p>
        </div>
      </div>
    </div>

      {/* --- HISTORY DRAWER --- */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001]"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 right-0 w-[320px] md:w-[400px] border-l shadow-2xl flex flex-col pt-6 ${
                isDark ? 'bg-[#09090b] border-white/5' : 'bg-white border-black/5'
              }`}
            >
               <div className={`p-6 flex items-center justify-between border-b ${
                 isDark ? 'border-white/5' : 'border-black/5'
               }`}>
                  <div className="flex items-center gap-3">
                     <History className="text-indigo-400" size={20} />
                     <h2 className={`text-xl font-bold tracking-tight ${
                       isDark ? 'text-white' : 'text-[#1A1A1A]'
                     }`}>{t.cycleHistory}</h2>
                  </div>
                  <button 
                    onClick={() => setHistoryOpen(false)}
                    className={`p-2 rounded-xl transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                  >
                    <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto scrollbar-premium p-4 space-y-3">
                  {historyLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 opacity-30">
                       <Loader2 className="animate-spin" size={24} />
                       <span className="text-[10px] font-bold tracking-widest uppercase">Syncing Timeline</span>
                    </div>
                  ) : historyItems.length > 0 ? (
                    historyItems.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          if (item.type === 'diary') navigate(`/tools/diary/entry/${item.id}`);
                          else if (item.type === 'task_completed') navigate(`/tools/planner/project/${item.meta?.project_id}`);
                          else navigate('/history');
                          setHistoryOpen(false);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border hover:border-white/20 hover:bg-white/[0.05] transition-all group ${
                          isDark ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'
                        }`}
                      >
                         <div className="flex items-center justify-between mb-2">
                            <span className={`text-[9px] font-black uppercase tracking-widest group-hover:text-amber-500/80 transition-colors ${
                              isDark ? 'text-zinc-600' : 'text-slate-600'
                            }`}>
                               {item.type.replace('_', ' ')}
                            </span>
                            <span className={`text-[9px] font-medium ${
                              isDark ? 'text-zinc-700' : 'text-slate-700'
                            }`}>
                               {format(new Date(item.timestamp), 'MMM d')}
                            </span>
                         </div>
                         <div className={`text-sm font-semibold truncate mb-1 ${
                           isDark ? 'text-white' : 'text-[#1A1A1A]'
                         }`}>{item.title}</div>
                         <div className={`text-xs line-clamp-1 italic ${
                           isDark ? 'text-zinc-500' : 'text-slate-600'
                         }`}>"{item.preview}"</div>
                      </button>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-20">
                       <History size={40} className="mb-4" />
                       <p className="text-sm font-medium">No cycles preserved in this timeline yet.</p>
                    </div>
                  )}
               </div>

               <div className={`p-4 border-t ${
                 isDark ? 'border-white/5' : 'border-black/5'
               }`}>
                  <button 
                    onClick={() => { navigate('/history'); setHistoryOpen(false); }}
                    className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                    }`}
                  >
                     Review Universal Timeline <ExternalLink size={12} />
                  </button>
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 lg:bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl z-[2000] shadow-2xl text-white text-xs font-bold tracking-wide flex items-center gap-3"
          >
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CAMERA SCANNER VIEW --- */}
      <AnimatePresence>
        {isCameraOpen && (
          <GideonCamera onClose={() => toggleCamera(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
