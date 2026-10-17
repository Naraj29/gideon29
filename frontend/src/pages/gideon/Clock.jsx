import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Clock() {
  const { isDark } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return (
    <div className={`fixed top-20 right-6 xl:right-[350px] z-[100] px-4 py-2 rounded-xl backdrop-blur-xl border shadow-lg ${
      isDark 
        ? 'bg-black/30 border-white/10 text-white' 
        : 'bg-white/30 border-black/10 text-black'
    }`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-light tracking-wider">{formattedTime}</span>
        <span className="text-sm font-medium opacity-60">{formattedSeconds}</span>
      </div>
    </div>
  );
}
