import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Zap, Shield } from 'lucide-react';
import { useGideonVision } from './hooks/useGideonVision';
import { CameraProvider } from './CameraProvider';
import { VisionCanvas } from './VisionCanvas';
import { ToolSidebar } from './ToolSidebar';
import './GideonCamera.css';

/**
 * Gideon Camera - Final "Perfect" Alignment
 * Features:
 * - Hardcoded True-View Navigation
 * - Top-Right Industrial Toolkit
 * - Zero Cursor Drift Calibration
 * - Gesture-Only Interfacing
 */
export default function GideonCamera({ onClose }) {
  const [activeTool, setActiveTool] = useState('pointer'); 
  const videoRef = useRef(null);


  // Neural Hand Engine
  const { results, status, sendFrame } = useGideonVision(videoRef);

  // Gesture Dispatcher
  const handleGestureClick = useCallback((toolId) => {
    setActiveTool(toolId);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="gideon-camera-container"
    >
      <CameraProvider onFrame={sendFrame}>
        
        {/* Layer 1: Zero-Drift Neural Mapping */}
        <VisionCanvas 
          results={results} 
          mode={activeTool} 
          isMirrored={true} /* Flipped to match scaleX(-1) in CSS for True-View */
          onGestureClick={handleGestureClick}
        />

        {/* Layer 2: Head-Up Display (HUD) */}
        <div className="camera-ui-layer">
          
          {/* Top HUD Area */}
          <header className="vision-header">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="engine-status-pill"
            >
              <div className={`status-dot ${status === 'READY' ? 'active' : ''} ${status === 'ERROR' ? 'bg-rose-500' : 'bg-blue-500 animate-pulse'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                Vision Core: {status}
              </span>
              {results && (
                 <div className="flex items-center gap-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] rounded font-bold uppercase tracking-widest border border-blue-500/20">
                   <Shield size={10} /> Neural Sync
                 </div>
              )}
            </motion.div>

            <button 
              onClick={onClose}
              className="close-button-p"
              title="Terminate Session"
            >
              <X size={28} />
            </button>
          </header>

          {/* Top-Right Industrial Toolkit */}
          <ToolSidebar 
            activeTool={activeTool} 
            onSelectTool={setActiveTool}
            onClear={() => window.dispatchEvent(new CustomEvent('clear-vision-canvas'))} 
          />

          {/* Bottom Precision HUD */}
          <footer className="vision-footer">
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="footer-pill-p"
             >
                <div className="flex items-center gap-3">
                   <Zap size={14} className="text-blue-500" />
                   <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">True-View Calibration: Active</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="text-[8px] text-zinc-600 font-bold uppercase">
                  Iteration: 8.42 / Core v2
                </div>
             </motion.div>
          </footer>
        </div>

        {/* Cinematic VFX */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_140%)]" />
      </CameraProvider>
    </motion.div>
  );
}
