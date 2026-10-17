import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, QrCode, Download, UploadCloud, Trash2, History, Camera, CheckCircle2, ChevronRight } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import qrService from '../services/qrService';

export default function QRStudioDashboard() {
  const [mode, setMode] = useState('generate'); // generate or scan
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Generator State
  const [genInput, setGenInput] = useState('');
  const [genLabel, setGenLabel] = useState('');
  
  // Scanner State
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
    return () => stopScanner(); // Cleanup
  }, []);

  // --- API ---
  const fetchHistory = async () => {
    try {
      const data = await qrService.getRecords();
      setHistory(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveToArchives = async (action, content, label) => {
    if (!content.trim()) return;
    try {
      const payload = { action, content, label: label || 'Untitled Code' };
      const newRecord = await qrService.saveRecord(payload);
      setHistory([newRecord, ...history]);
      return true;
    } catch (err) {
      console.error("Save error: ", err);
      return false;
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await qrService.deleteRecord(id);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      console.error("Delete error: ", err);
    }
  };

  // --- GENERATOR ---
  const handleDownloadSVG = () => {
    const svg = document.getElementById("qr-generator-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${genLabel || 'Generated'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    handleSaveToArchives('generated', genInput, genLabel);
  };

  const handleDownloadPNG = () => {
    const canvas = document.getElementById("qr-generator-canvas");
    if (!canvas) return;
    
    // Create a temporary link for download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${genLabel || 'Generated'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    handleSaveToArchives('generated', genInput, genLabel);
  };

  // --- SCANNER ---
  const stopScanner = async () => {
    if (scannerRef.current) {
        try {
            await scannerRef.current.stop();
            scannerRef.current.clear();
        } catch (err) {
            console.log("Scanner stop error ignored.");
        }
        scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const startCameraScan = async () => {
      setScanResult(null);
      
      try {
          if (!scannerRef.current) {
             scannerRef.current = new Html5Qrcode("reader");
          }
          
          setIsScanning(true);
          
          await scannerRef.current.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText, decodedResult) => {
                // Success
                stopScanner();
                setScanResult(decodedText);
                handleSaveToArchives('scanned', decodedText, 'Camera Scan');
            },
            (errorMessage) => {
                // Ignore ongoing parsing errors
            }
          );
      } catch (err) {
          console.error("Camera start error:", err);
          setIsScanning(false);
          alert("Could not access camera. Please allow permissions or use Gallery Upload.");
      }
  };

  const handleGalleryUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
         if (!scannerRef.current) scannerRef.current = new Html5Qrcode("reader");
         stopScanner(); // Stop camera if running
         
         const decodedText = await scannerRef.current.scanFile(file, true);
         setScanResult(decodedText);
         handleSaveToArchives('scanned', decodedText, 'Gallery Upload');
      } catch (err) {
         alert("Could not detect a valid QR Code in this image.");
      }
      
      // Reset input
      e.target.value = '';
  };

  // Switch modes safely
  const handleModeSwitch = (newMode) => {
      if (newMode === 'generate') {
          stopScanner();
          setScanResult(null);
      }
      setMode(newMode);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 font-sans text-white grid grid-cols-1 xl:grid-cols-3 gap-12">
      
      {/* LEFT COLUMN: Main Tool */}
      <div className="xl:col-span-2 flex flex-col items-center xl:items-start w-full">
        
        {/* Header */}
        <header className="mb-10 text-center xl:text-left w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-green-500 flex items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20 xl:mx-0 mx-auto"
          >
            <ScanLine className="w-8 h-8 text-black" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            QR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Studio</span>
          </motion.h1>
          <p className="text-zinc-400">High-fidelity matrix barcoding and scanning engine.</p>
        </header>

        {/* Mode Toggle */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-12 border border-white/5 w-full max-w-sm xl:mx-0 mx-auto">
          <button 
            onClick={() => handleModeSwitch('generate')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'generate' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <QrCode size={18} /> Engine
          </button>
          <button 
            onClick={() => handleModeSwitch('scan')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'scan' ? 'bg-zinc-800 text-cyan-400 shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <Camera size={18} /> Scanner
          </button>
        </div>

        {/* GENERATOR WORKSPACE */}
        <AnimatePresence mode="wait">
          {mode === 'generate' && (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="w-full card-premium bg-zinc-950/40 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_100px_rgba(34,211,238,0.05)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-cyan-400 tracking-widest uppercase mb-2">Matrix Content</label>
                    <textarea 
                      value={genInput}
                      onChange={e => setGenInput(e.target.value)}
                      placeholder="https://example.com, WiFi details, or any text..."
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 text-white min-h-[120px] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 tracking-widest uppercase mb-2">Optional Label</label>
                    <input 
                      type="text"
                      value={genLabel}
                      onChange={e => setGenLabel(e.target.value)}
                      placeholder="My Website..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 outline-none focus:border-cyan-500 text-white"
                    />
                  </div>
                </div>

                {/* Display */}
                <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-[2rem] border border-white/5 relative">
                  <div className="bg-white p-4 rounded-3xl shadow-xl shadow-cyan-500/20 mb-8 relative group overflow-hidden">
                     {genInput ? (
                        <>
                          {/* Visible Canvas for PNG export & Sharp Preview */}
                          <QRCodeCanvas 
                            id="qr-generator-canvas"
                            value={genInput} 
                            size={200}
                            level="H" 
                            includeMargin={true}
                            fgColor="#000000"
                            bgColor="#FFFFFF"
                            className="block"
                          />
                          {/* Hidden SVG for Vector export */}
                          <div className="hidden">
                            <QRCodeSVG 
                              id="qr-generator-svg"
                              value={genInput} 
                              size={200}
                              level="H" 
                              includeMargin={true}
                              fgColor="#000000"
                              bgColor="#FFFFFF"
                            />
                          </div>
                          
                          {/* Visual feedback overlay */}
                          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors pointer-events-none rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <QrCode className="text-cyan-500 drop-shadow-lg" size={40} />
                          </div>
                        </>
                     ) : (
                        <div className="w-[200px] h-[200px] flex items-center justify-center border-2 border-dashed border-zinc-300 rounded-xl text-zinc-400">
                           Awaiting Data
                        </div>
                     )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button 
                      onClick={handleDownloadPNG}
                      disabled={!genInput}
                      className="flex-1 btn-premium bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold h-12 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <Download size={18} /> Picture (PNG)
                    </button>
                    <button 
                      onClick={handleDownloadSVG}
                      disabled={!genInput}
                      className="flex-1 btn-premium bg-zinc-800/50 hover:bg-zinc-800 text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 text-sm"
                    >
                      <ScanLine size={16} className="text-cyan-400" /> Vector (SVG)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SCANNER WORKSPACE */}
          {mode === 'scan' && (
            <motion.div 
               key="scan"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0 }}
               className="w-full card-premium bg-zinc-950/40 border border-cyan-500/20 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_100px_rgba(34,211,238,0.1)] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] pointer-events-none rounded-full" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
              
               <div className="text-center w-full max-w-sm mx-auto">
                 
                 {/* The Camera Container */}
                 <div className={`w-full aspect-square bg-black rounded-[2rem] overflow-hidden border-2 mb-8 relative ${isScanning ? 'border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'border-white/10'}`}>
                    <div id="reader" className="w-full h-full" />
                    
                    {/* Visual Overlay when idle or done */}
                    {(!isScanning && !scanResult) && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-10">
                          <ScanLine className="w-16 h-16 text-zinc-600 mb-4" />
                          <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Camera Offline</span>
                       </div>
                    )}
                    
                    {/* Visual Overlay when success */}
                    {scanResult && (
                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/20 backdrop-blur-md z-10 border-[6px] border-green-500 rounded-[2rem]">
                          <CheckCircle2 className="w-20 h-20 text-green-400 shadow-[0_0_30px_#4ade80]" />
                       </div>
                    )}
                 </div>

                 {/* Action Buttons */}
                 {!scanResult ? (
                   <div className="grid grid-cols-2 gap-4">
                     {isScanning ? (
                        <button onClick={stopScanner} className="col-span-2 bg-red-500/10 text-red-500 border border-red-500/30 px-6 py-4 rounded-2xl font-bold hover:bg-red-500/20">
                          Stop Scanner
                        </button>
                     ) : (
                        <>
                           <button onClick={startCameraScan} className="bg-cyan-500 text-black px-6 py-4 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                             <Camera size={24} /> Live View
                           </button>
                           
                           <label className="bg-white/5 text-white border border-white/10 px-6 py-4 rounded-2xl font-bold flex flex-col items-center gap-2 hover:bg-white/10 cursor-pointer">
                             <UploadCloud size={24} className="text-cyan-400" />
                             Upload Image
                             <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                           </label>
                        </>
                     )}
                   </div>
                 ) : (
                   <div className="text-left bg-black/40 border border-green-500/30 p-6 rounded-2xl mt-4">
                      <p className="text-[10px] font-bold text-green-400 tracking-widest uppercase mb-2">Payload Decoded</p>
                      <p className="text-white font-mono break-all">{scanResult}</p>
                      
                      <button 
                         onClick={() => { setScanResult(null); startCameraScan(); }}
                         className="mt-6 w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      >
                         Scan Another Code <ChevronRight size={16} />
                      </button>
                   </div>
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT COLUMN: The Archives */}
      <div className="xl:col-span-1 flex flex-col h-full border-t xl:border-t-0 xl:border-l border-white/5 pt-12 xl:pt-0 xl:pl-12">
        <div className="flex items-center gap-3 mb-8 text-zinc-400">
          <History className="text-cyan-500" size={24} />
          <h2 className="text-2xl font-bold text-white tracking-tight">The Archives</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          <AnimatePresence>
            {loadingHistory ? (
              <motion.div className="text-center py-10 text-cyan-500/50 font-bold uppercase tracking-widest text-xs">Loading Archives...</motion.div>
            ) : history.length === 0 ? (
              <motion.div className="text-center py-10 rounded-2xl border border-dashed border-white/5 text-zinc-600 font-medium">
                No matrix codes indexed yet.
              </motion.div>
            ) : (
              history.map((record) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={record.id}
                  className="group bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 rounded-2xl p-5 transition-all relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-transparent to-cyan-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex w-full justify-between items-start mb-3 relative z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${record.action === 'generated' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-green-500/20 text-green-400'}`}>
                      {record.action}
                    </span>
                    <button 
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-zinc-600 hover:text-red-500 bg-black/40 hover:bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <h4 className="font-bold text-white text-md mb-1 relative z-10">{record.label}</h4>
                  <div className="text-zinc-500 text-xs font-mono break-all line-clamp-3 relative z-10">{record.content}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
