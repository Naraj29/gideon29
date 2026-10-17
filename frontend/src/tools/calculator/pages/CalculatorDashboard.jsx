import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator as CalcIcon, Trash2, History, Delete } from 'lucide-react';
import calculatorService from '../services/calculatorService';

export default function CalculatorDashboard() {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [justCalculated, setJustCalculated] = useState(false);

  useEffect(() => {
    fetchHistory();
    // Add keyboard support
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, equation, justCalculated]); // Re-bind so handleKeyDown has fresh state

  const fetchHistory = async () => {
    try {
      const data = await calculatorService.getHistory();
      setHistory(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleKeyDown = (e) => {
    e.preventDefault();
    const key = e.key;
    if (/[0-9.]/.test(key)) handleNumber(key);
    if (['+', '-', '*', '/'].includes(key)) handleOperator(key);
    if (key === 'Enter' || key === '=') calculate();
    if (key === 'Backspace') handleBackspace();
    if (key === 'Escape' || key.toLowerCase() === 'c') clearAll();
  };

  const handleNumber = (num) => {
    if (justCalculated) {
      setDisplay(num);
      setEquation('');
      setJustCalculated(false);
    } else {
      if (display === '0' && num !== '.') {
        setDisplay(num);
      } else {
        if (num === '.' && display.includes('.')) return;
        setDisplay(display + num);
      }
    }
  };

  const handleOperator = (op) => {
    setJustCalculated(false);
    if (display !== '') {
      if (equation === '' || justCalculated) {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
      } else {
        // Evaluate the existing equation so far, chain it
        try {
          // eslint-disable-next-line
          const result = eval(equation + display);
          setEquation(result + ' ' + op + ' ');
          setDisplay('0');
        } catch (e) {
          setDisplay('Error');
        }
      }
    } else if (equation !== '') {
      // Switch operator
      setEquation(equation.slice(0, -2) + op + ' ');
    }
  };

  const calculate = async () => {
    if (equation === '' || display === '') return;
    try {
      const fullEquation = equation + display;
      // Evaluate securely (only numbers and operators exist by logic)
      // eslint-disable-next-line
      const res = eval(fullEquation.replace(' ', ''));
      
      const resStr = Number.isFinite(res) ? parseFloat(res.toFixed(8)).toString() : 'Error';
      
      setDisplay(resStr);
      setEquation('');
      setJustCalculated(true);

      if (resStr !== 'Error') {
        const payload = {
          equation: fullEquation.trim(),
          result: resStr
        };
        const newRecord = await calculatorService.saveCalculation(payload);
        setHistory([newRecord, ...history]);
      }
      
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setJustCalculated(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setEquation('');
    setJustCalculated(false);
  };

  const handleBackspace = () => {
    if (justCalculated) {
      clearAll();
    } else {
      setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await calculatorService.deleteHistoryItem(id);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const buttons = [
    { label: 'C', flex: 2, action: clearAll, type: 'action' },
    { label: '⌫', flex: 1, action: handleBackspace, type: 'action' },
    { label: '/', flex: 1, action: () => handleOperator('/'), type: 'operator' },
    { label: '7', flex: 1, action: () => handleNumber('7'), type: 'number' },
    { label: '8', flex: 1, action: () => handleNumber('8'), type: 'number' },
    { label: '9', flex: 1, action: () => handleNumber('9'), type: 'number' },
    { label: '*', flex: 1, action: () => handleOperator('*'), type: 'operator' },
    { label: '4', flex: 1, action: () => handleNumber('4'), type: 'number' },
    { label: '5', flex: 1, action: () => handleNumber('5'), type: 'number' },
    { label: '6', flex: 1, action: () => handleNumber('6'), type: 'number' },
    { label: '-', flex: 1, action: () => handleOperator('-'), type: 'operator' },
    { label: '1', flex: 1, action: () => handleNumber('1'), type: 'number' },
    { label: '2', flex: 1, action: () => handleNumber('2'), type: 'number' },
    { label: '3', flex: 1, action: () => handleNumber('3'), type: 'number' },
    { label: '+', flex: 1, action: () => handleOperator('+'), type: 'operator' },
    { label: '0', flex: 2, action: () => handleNumber('0'), type: 'number' },
    { label: '.', flex: 1, action: () => handleNumber('.'), type: 'number' },
    { label: '=', flex: 1, action: calculate, type: 'accent' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 font-sans grid grid-cols-1 xl:grid-cols-3 gap-12">
      
      {/* Left Column: The Calculator */}
      <div className="xl:col-span-2 flex flex-col items-center xl:items-start w-full">
        <header className="mb-10 text-center xl:text-left w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 xl:mx-0 mx-auto"
          >
            <CalcIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-magenta-500">Calculator</span>
          </motion.h1>
          <p className="text-zinc-500">Computations stored securely in your permanent archive.</p>
        </header>

        {/* Calculator Body */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] card-premium p-6 rounded-[3rem] bg-zinc-950/40 border border-purple-500/20 shadow-[0_30px_100px_rgba(168,85,247,0.1)] relative overflow-hidden"
        >
          {/* Ambient Purple Light */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

          {/* Screen */}
          <div className="relative z-10 bg-zinc-900 border border-white/5 rounded-3xl p-6 mb-8 flex flex-col items-end shadow-inner h-32 justify-end" style={{ boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)' }}>
            <div className="text-fuchsia-300/80 font-mono text-lg h-6 mb-2 tracking-widest">{equation}</div>
            <div className={`font-mono font-bold tracking-wider overflow-hidden overflow-x-auto whitespace-nowrap scrollbar-hide w-full text-right
                ${display.length > 12 ? 'text-3xl' : 'text-5xl'} 
                ${justCalculated ? 'text-fuchsia-400' : 'text-white'}
              `}
            >
              {display || '0'}
            </div>
          </div>

          {/* Keypad */}
          <div className="relative z-10 grid grid-cols-4 gap-4">
            {buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                className={`
                  h-16 flex items-center justify-center text-xl font-bold rounded-2xl transition-all duration-200 active:scale-95
                  ${btn.flex === 2 ? 'col-span-2' : 'col-span-1'}
                  ${btn.type === 'number' && 'bg-white/5 hover:bg-white/10 text-white'}
                  ${btn.type === 'action' && 'bg-zinc-800 text-purple-400 hover:bg-zinc-700'}
                  ${btn.type === 'operator' && 'bg-purple-500/10 hover:bg-purple-500/20 text-fuchsia-400 shadow-inner'}
                  ${btn.type === 'accent' && 'bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-xl shadow-fuchsia-500/20 text-white border border-fuchsia-400/50 hover:opacity-90'}
                `}
              >
                {/* Visual Icon for Backspace instead of Text */}
                {btn.label === '⌫' ? <Delete size={20} /> : btn.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column: The Tape (History) */}
      <div className="xl:col-span-1 flex flex-col h-full border-t xl:border-t-0 xl:border-l border-white/5 pt-12 xl:pt-0 xl:pl-12">
        <div className="flex items-center gap-3 mb-8 text-zinc-400">
          <History className="text-purple-500" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">The Tape</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <AnimatePresence>
            {loadingHistory ? (
              <motion.div className="text-center py-10 text-purple-500/50 font-bold uppercase tracking-widest text-xs">Loading Archives...</motion.div>
            ) : history.length === 0 ? (
              <motion.div className="text-center py-10 rounded-2xl border border-dashed border-white/5 text-zinc-600 font-medium">
                No calculations recorded yet.
              </motion.div>
            ) : (
              history.map((record) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={record.id}
                  className="group bg-zinc-900 border border-white/5 hover:border-purple-500/30 rounded-2xl p-4 transition-all relative overflow-hidden flex flex-col items-end"
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex w-full justify-between items-start mb-2 relative z-10">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full">
                      {new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button 
                      onClick={() => deleteHistoryItem(record.id)}
                      className="text-zinc-600 hover:text-red-500 bg-black/20 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="text-zinc-400 tracking-wider font-mono text-sm relative z-10">{record.equation}</div>
                  <div className="text-fuchsia-400 font-bold font-mono text-xl relative z-10 mt-1">= {record.result}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
