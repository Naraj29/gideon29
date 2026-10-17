import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Background() {
  const { isDark } = useTheme();

  return (
    <div 
      className="absolute inset-0 bg-cover bg-no-repeat"
      style={{ 
        backgroundImage: 'url(/gideon-background.webp)', 
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className={`absolute inset-0 ${
        isDark ? 'bg-black/40' : 'bg-black/20'
      }`} />
    </div>
  );
}
