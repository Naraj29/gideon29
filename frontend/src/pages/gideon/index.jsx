import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import Background from './Background';
import InputBar from './InputBar';
import Clock from './Clock';
import CategoryBar from './CategoryBar';

export default function Gideon() {
  const { isDark } = useTheme();

  return (
    <div className={`h-screen w-full relative flex flex-col ${
      isDark ? 'bg-[#0a0a1a]' : 'bg-[#e0e5ff]'
    }`}>
      <Background />
      <Clock />
      <CategoryBar />
      <InputBar />
    </div>
  );
}
