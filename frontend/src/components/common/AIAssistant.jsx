import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  MessageSquare,
  Bot,
  User,
  Loader2,
  CheckCircle2,
  Calendar,
  BookOpen,
  PieChart
} from 'lucide-react';
import aiService from '../../services/aiService';
import api from '../../lib/api';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AIAssistant. I can help you write diary entries, schedule meetings, or log your wellness. What's on your mind?" }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data = await aiService.chat(userMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        action: data.action,
        success: data.success
      }]);
    } catch (err) {
      console.error("AI Error:", err);
      let errorMsg = "I'm sorry, I encountered an error. Please try again later.";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMsg = "Your session has expired or you are not logged in. Please log in to use Gideon.";
        } else if (err.response.data && err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      } else if (err.request) {
        errorMsg = "Network error: I couldn't reach the server. Is the backend running?";
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-2xl z-50 flex items-center justify-center border border-white/20"
      >
        {isOpen ? <X size={24} /> : <Sparkles className="animate-pulse" size={28} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] md:w-[400px] h-[550px] max-h-[calc(100vh-140px)] bg-black/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Bot className="text-indigo-400" size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-white text-sm">AIAssistant</h3>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Online & Ready</span>
                   </div>
                 </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                  <Minimize2 size={18} />
               </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-premium">
               {messages.map((msg, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                 >
                   <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${
                        msg.role === 'user' ? 'bg-zinc-800 border-white/10' : 'bg-indigo-500/20 border-indigo-500/30'
                      }`}>
                         {msg.role === 'user' ? <User size={14} /> : <Bot className="text-indigo-400" size={14} />}
                      </div>

                      <div className="space-y-2">
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-200'
                        }`}>
                           {msg.content}
                        </div>
                        
                        {/* Action Badge */}
                        {msg.action && msg.action !== 'CHAT' && (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] uppercase font-bold tracking-widest ${
                            msg.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                             {msg.success ? <CheckCircle2 size={12} /> : <X size={12} />}
                             {msg.action.replace('_', ' ')} Successful
                          </div>
                        )}
                      </div>
                   </div>
                 </motion.div>
               ))}
               {loading && (
                 <div className="flex justify-start">
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <Loader2 className="animate-spin text-indigo-400" size={14} />
                       </div>
                       <div className="bg-white/5 px-4 py-2 rounded-xl text-xs text-zinc-500 animate-pulse">
                          Thinking...
                       </div>
                    </div>
                 </div>
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-black/40 border-t border-white/5">
               <div className="relative">
                 <input 
                   type="text"
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleSend()}
                   placeholder="Type a command (e.g., 'Log my water'...)"
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 pr-14 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || loading}
                   className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors"
                 >
                   <Send size={18} />
                 </button>
               </div>
               
               {/* Quick Commands */}
               <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { label: 'Summarize Day', icon: <PieChart size={10} />, prompt: 'Can you summarize my day so far?' },
                    { label: 'New Diary', icon: <BookOpen size={10} />, prompt: 'I want to write a short diary entry about my morning.' },
                    { label: 'Schedule', icon: <Calendar size={10} />, prompt: 'Schedule a meeting for tomorrow.' }
                  ].map(cmd => (
                    <button 
                      key={cmd.label}
                      onClick={() => setInput(cmd.prompt)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:border-white/10 text-[10px] text-zinc-400 hover:text-white transition-all"
                    >
                      {cmd.icon} {cmd.label}
                    </button>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
