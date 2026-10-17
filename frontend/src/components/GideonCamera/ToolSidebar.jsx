import React from 'react';
import { 
  MousePointer2, 
  PenTool, 
  Type, 
  Crosshair, 
  Trash2, 
  Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ToolSidebar - Beyond Industry Ergo-Dock
 * Features:
 * - Dynamic Scale Logic for proximity focus
 * - Arc Layout Adaptive for mobile
 * - Neural Haptics (Visual)
 */
export function ToolSidebar({ activeTool, onSelectTool, onClear }) {
  const tools = [
    { id: 'pointer', icon: <MousePointer2 size={22} />, label: 'Pointer' },
    { id: 'draw', icon: <PenTool size={22} />, label: 'Draw' },
    { id: 'select', icon: <Crosshair size={22} />, label: 'Precision Select' },
  ];

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="gideon-sidebar"
    >
      <div className="flex flex-col gap-4 items-center w-full">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            data-tool={tool.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelectTool(tool.id)}
            className={`sidebar-tool ${activeTool === tool.id ? 'active' : ''}`}
          >
            {tool.icon}
            <span className="tool-tooltip">{tool.label}</span>
            
            {/* Neural Pulse Background for Active State */}
            {activeTool === tool.id && (
              <motion.div 
                layoutId="active-glow"
                className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="w-8 h-px bg-white/10 my-2" />

      <div className="flex flex-col gap-4 items-center w-full">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={onClear}
          className="sidebar-tool hover:text-rose-400"
          title="Clear Workspace"
        >
          <Trash2 size={20} />
          <span className="tool-tooltip">Clear Canvas</span>
        </motion.button>

        <motion.button
          whileHover={{ rotate: 90 }}
          className="sidebar-tool"
          title="Neural Engine Settings"
        >
          <Settings size={20} />
          <span className="tool-tooltip">Settings</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
