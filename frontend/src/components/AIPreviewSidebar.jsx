import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Mic, 
  MicOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import aiService from '../services/aiService';

export default function AIPreviewSidebar() {
  const { isDark } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const chatEndRef = useRef(null);

  const introText = "Hello. I am Gideon, your Universal Companion. I am here to manage your productivity, your promises, and your sanity.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= introText.length) {
        setMessages([{ role: 'assistant', content: introText.slice(0, index) }]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto", block: "nearest" });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setLoading(true);

    try {
      const data = await aiService.chat(prompt);
      const GideonMsg = data.message || "I processed that for you.";
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: GideonMsg,
        action: data.action,
        success: data.success
      }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I encountered an error processing your request." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className={`flex flex-col h-full rounded-3xl border overflow-hidden shadow-xl ${
      isDark ? 'border-white/5 bg-[#09090b]' : 'border-black/5 bg-white'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isDark ? 'border-white/5' : 'border-black/5'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot size={20} />
          </div>
          <div>
            <h2 className={`text-sm font-bold tracking-tight flex items-center gap-1 ${
              isDark ? 'text-white' : 'text-[#1A1A1A]'
            }`}>
              Gideon AI
              <Sparkles size={12} className="text-indigo-400" />
            </h2>
            <p className={`text-[10px] ${
              isDark ? 'text-zinc-500' : 'text-slate-600'
            }`}>
              Universal Companion
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/5 text-zinc-500 hover:text-white' : 'hover:bg-black/5 text-slate-500 hover:text-black'
          }`}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-premium">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                      <Bot size={16} />
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0 text-white">
                      <User size={16} />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-tr-sm'
                        : isDark
                          ? 'bg-white/5 border border-white/5 text-zinc-200 rounded-tl-sm'
                          : 'bg-black/5 border border-black/5 text-slate-700 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                    <Bot size={16} />
                  </div>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    isDark ? 'bg-white/5 border border-white/5 text-zinc-400' : 'bg-black/5 border border-black/5 text-slate-600'
                  }`}>
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}>
            <div className={`flex items-center gap-2 border rounded-2xl px-3 py-2 backdrop-blur-xl transition-colors ${
              isDark ? 'bg-[#121214]/90 border-white/10' : 'bg-white/90 border-black/10'
            }`}>
              <button
                onClick={toggleListening}
                className={`w-8 h-8 shrink-0 flex items-center justify-center transition-all ${
                  isListening ? 'text-indigo-400 scale-110' : (isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-black')
                }`}
              >
                {isListening ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
              </button>
              <input
                type="text"
                placeholder="Tell Gideon anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className={`flex-1 bg-transparent outline-none text-sm ${
                  isDark ? 'text-white placeholder:text-zinc-500' : 'text-black placeholder:text-slate-500'
                }`}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-all ${
                  input.trim()
                    ? (isDark ? 'bg-white text-black' : 'bg-slate-900 text-white')
                    : (isDark ? 'bg-white/5 text-zinc-600 grayscale' : 'bg-black/5 text-slate-400 grayscale')
                }`}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
