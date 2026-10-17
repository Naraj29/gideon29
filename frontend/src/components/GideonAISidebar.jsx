import { useState } from 'react';
import { Bot, Sparkles, Send, Minimize2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function GideonAISidebar() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hi! I\'m Gideon, your AI assistant. How can I help you with your tools today?', time: 'Just now' }
  ]);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isDark } = useTheme();

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      time: 'Just now'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'I\'m here to help! You can ask me about any tool, get recommendations, or learn how to use specific features.',
        time: 'Just now'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
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
              Your AI Assistant
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-premium">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-full ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.sender !== 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                    <Bot size={12} />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-indigo-500 text-white rounded-tr-sm'
                      : isDark
                        ? 'bg-white/5 border border-white/5 text-zinc-200 rounded-tl-sm'
                        : 'bg-black/5 border border-black/5 text-slate-700 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${
            isDark ? 'border-white/5' : 'border-black/5'
          }`}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Gideon..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className={`flex-1 border rounded-xl py-2 px-3 text-xs outline-none focus:border-indigo-500/30 transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/5 text-white placeholder-zinc-500'
                    : 'bg-black/5 border-black/5 text-[#1A1A1A] placeholder-slate-500'
                }`}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
