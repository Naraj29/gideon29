import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff } from 'lucide-react';

export default function InputBar() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      navigate(`/ai?prompt=${encodeURIComponent(input.trim())}`);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[160] pointer-events-none">
      <div className={`w-full bg-gradient-to-t via-60% to-transparent pt-20 pb-24 lg:pb-6 px-3 sm:px-4 md:px-6 flex flex-col items-center ${
        isDark ? 'from-[#09090b] via-[#09090b]/95' : 'from-white via-white/95'
      }`}>
        
        <div className="w-full max-w-3xl pointer-events-auto">
          <div className={`flex items-center gap-2 border rounded-2xl px-2 py-2 backdrop-blur-xl transition-colors ${
            isDark ? 'bg-[#121214]/90 border-white/10 shadow-2xl' : 'bg-white/90 border-black/10 shadow-2xl'
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
              placeholder="Tell Gideon anything..."
              className={`flex-1 bg-transparent outline-none text-[15px] px-2 min-w-0 ${
                isDark ? 'text-white placeholder:text-zinc-500' : 'text-black placeholder:text-slate-500'
              }`}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg transition-all ${
                input.trim()
                  ? 'bg-white text-black'
                  : (isDark ? 'bg-white/5 text-zinc-600 grayscale' : 'bg-black/5 text-slate-600 grayscale')
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
