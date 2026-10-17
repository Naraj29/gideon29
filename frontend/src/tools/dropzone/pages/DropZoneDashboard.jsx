import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Wifi, UploadCloud, DownloadCloud, X, CheckCircle2, AlertTriangle, File } from 'lucide-react';
import dropzoneApi from '../services/dropzoneApi';

const CHUNK_SIZE = 16384; // 16KB WebRTC generic safe limit for DataChannels
const STUN_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function DropZoneDashboard() {
  const [mode, setMode] = useState('idle'); // 'idle', 'host' (sender), 'peer' (receiver)
  const [status, setStatus] = useState('offline'); // offline, waiting, connecting, connected, transferring, complete, error
  const [pin, setPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [file, setFile] = useState(null);
  
  // Transfer metrics
  const [progress, setProgress] = useState(0);
  const [incomingFileName, setIncomingFileName] = useState('');
  const [incomingFileSize, setIncomingFileSize] = useState(0);

  // WebRTC Refs
  const pc = useRef(null);
  const dc = useRef(null);
  const pollInterval = useRef(null);
  const incomingChunks = useRef([]);
  const bytesReceived = useRef(0);

  // --- CLEANUP ---
  useEffect(() => {
    return () => resetConnection();
  }, []);

  const resetConnection = async () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (dc.current) dc.current.close();
    if (pc.current) pc.current.close();
    
    // Only host normally ends session, but good measure
    if (pin && mode === 'host') {
       dropzoneApi.endSession(pin).catch(()=>console.log("Cleanup silent fail"));
    }

    pc.current = null;
    dc.current = null;
    setMode('idle');
    setStatus('offline');
    setPin('');
    setPinInput('');
    setFile(null);
    setProgress(0);
    incomingChunks.current = [];
    bytesReceived.current = 0;
  };

  // --- WEBRTC CORE SETUP ---
  const initializePeerConnection = (isHost) => {
    pc.current = new RTCPeerConnection(STUN_CONFIG);
    
    // 1. ICE Candidate Handler -> send locally discovered IP paths to the backend
    pc.current.onicecandidate = async (e) => {
      if (e.candidate && pin) {
        await dropzoneApi.sendMessage(pin, isHost ? 'host' : 'peer', 'candidate', e.candidate);
      }
    };

    if (isHost) {
      // Host creates the Data Channel
      dc.current = pc.current.createDataChannel('dropzone-file', {
        ordered: true
      });
      setupDataChannel();
    } else {
      // Peer listens for the Data Channel
      pc.current.ondatachannel = (e) => {
        dc.current = e.channel;
        setupDataChannel();
      };
    }
  };

  const setupDataChannel = () => {
    if (!dc.current) return;
    
    dc.current.binaryType = 'arraybuffer';
    
    dc.current.onopen = () => {
      setStatus('connected');
      if (pollInterval.current) clearInterval(pollInterval.current); 
      // Ready to send!
      if (mode === 'host' && file) {
        sendFileOverChannel();
      }
    };

    dc.current.onclose = () => {
       if(status !== 'complete') setStatus('offline');
    };

    dc.current.onerror = (err) => {
      console.error(err);
      setStatus('error');
    };

    let metadataReceived = false;

    dc.current.onmessage = (e) => {
      // If string, it is metadata
      if (typeof e.data === 'string') {
         if (e.data === 'DONE') {
            assembleAndDownloadFile();
            return;
         }
         const meta = JSON.parse(e.data);
         setIncomingFileName(meta.name);
         setIncomingFileSize(meta.size);
         metadataReceived = true;
         setStatus('transferring');
         return;
      }
      
      // Binary chunk
      if (metadataReceived) {
         incomingChunks.current.push(e.data);
         bytesReceived.current += e.data.byteLength;
         
         // Only update progress UI occasionally to not block main thread
         if (incomingChunks.current.length % 50 === 0) {
            setProgress((bytesReceived.current / incomingFileSize) * 100);
         }
      }
    };
  };

  // --- SENDER / HOST FLOW ---
  const handleHostStart = async () => {
    if (!file) return;
    try {
      setStatus('waiting');
      setMode('host');
      
      const session = await dropzoneApi.createSession();
      const newPin = session.pin;
      setPin(newPin);

      initializePeerConnection(true);

      // Create Offer
      const offer = await pc.current.createOffer();
      await pc.current.setLocalDescription(offer);
      
      // Send Offer to Backend
      await dropzoneApi.sendMessage(newPin, 'host', 'offer', offer);

      // Begin Polling for Peer Answer & Candidates
      startPolling(newPin, 'peer');

    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  // --- RECEIVER / PEER FLOW ---
  const handlePeerJoin = async (e) => {
    e.preventDefault();
    if (pinInput.length !== 6) return;
    
    try {
      setStatus('connecting');
      setMode('peer');
      setPin(pinInput);

      // Validate session exists
      await dropzoneApi.joinSession(pinInput);
      
      initializePeerConnection(false);

      // Start Polling for Host Offer & Candidates
      startPolling(pinInput, 'host');

    } catch (err) {
      console.error("Join error:", err);
      setStatus('error');
    }
  };

  // --- SIGNALING POLLER ---
  const startPolling = (currentPin, targetSender) => {
    pollInterval.current = setInterval(async () => {
      try {
        const msgs = await dropzoneApi.pollMessages(currentPin, targetSender);
        for (const msg of msgs) {
          const payload = JSON.parse(msg.payload);
          
          if (msg.type === 'offer' && mode === 'peer') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            await dropzoneApi.sendMessage(currentPin, 'peer', 'answer', answer);
          } 
          else if (msg.type === 'answer' && mode === 'host') {
            await pc.current.setRemoteDescription(new RTCSessionDescription(payload));
          } 
          else if (msg.type === 'candidate') {
            await pc.current.addIceCandidate(new RTCIceCandidate(payload));
          }

          // Consume the message so it doesn't process again
          await dropzoneApi.dropMessage(msg.id);
        }
      } catch (e) {
         console.error("Polling error: ", e);
      }
    }, 2000); // Check every 2 secs
  };

  // --- FILE TRANSFER LOGIC (HOST) ---
  const sendFileOverChannel = () => {
    setStatus('transferring');
    const { name, size, type } = file;
    
    // Send Metadata First
    dc.current.send(JSON.stringify({ name, size, type }));

    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onerror = error => console.error('Error reading file:', error);
    fileReader.onabort = () => console.log('File reading aborted.');
    
    fileReader.onload = e => {
      // Need to wait if buffer gets full so we don't crash the channel
      if (dc.current.bufferedAmount > 10 * 1024 * 1024) { 
        setTimeout(() => {
          dc.current.send(e.target.result);
          offset += e.target.result.byteLength;
          setProgress((offset / size) * 100);
          readSlice(offset);
        }, 100); 
      } else {
        dc.current.send(e.target.result);
        offset += e.target.result.byteLength;
        setProgress((offset / size) * 100);
        
        if (offset < size) {
          readSlice(offset);
        } else {
           // File complete
           setTimeout(() => {
              dc.current.send('DONE');
              setStatus('complete');
              setProgress(100);
           }, 500); // Give grace buffer time
        }
      }
    };

    const readSlice = o => {
      const slice = file.slice(offset, o + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    };

    // Start
    readSlice(0);
  };

  // --- FILE REASSEMBLY (PEER) ---
  const assembleAndDownloadFile = () => {
     setProgress(100);
     setStatus('complete');
     
     const blob = new Blob(incomingChunks.current);
     const url = URL.createObjectURL(blob);
     
     const a = document.createElement('a');
     a.href = url;
     a.download = incomingFileName || 'dropzone-file';
     document.body.appendChild(a);
     a.click();
     
     setTimeout(() => {
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
     }, 1000);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-10 pb-24 font-sans text-white">
      
      {/* Header */}
      <header className="mb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#0a0a0c] to-[#1c1c1e] border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-blue-500/20 rounded-[2rem] opacity-50 blur-xl"></div>
          <Share2 className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-500 absolute" style={{ stroke: 'url(#grad1)' }} />
          <svg width="0" height="0">
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop stopColor="#f472b6" offset="0%" />
              <stop stopColor="#3b82f6" offset="100%" />
            </linearGradient>
          </svg>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold tracking-tight mb-4"
        >
          Drop<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-blue-500">Zone</span>
        </motion.h1>
        <p className="text-zinc-400 text-lg">P2P Encrypted Local Network Transfer.</p>
      </header>

      {/* Main Container */}
      <div className="card-premium max-w-2xl mx-auto p-1 bg-zinc-950/40 border border-white/5 shadow-[0_30px_100px_rgba(236,72,153,0.05)] rounded-[3rem] overflow-hidden min-h-[400px] relative">
        
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <AnimatePresence mode="wait">
          
          {/* OFFLINE MODE (SELECTION) */}
          {status === 'offline' && mode === 'idle' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-10 md:p-16 h-full flex flex-col items-center justify-center text-center relative z-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md mx-auto">
                <button 
                  onClick={() => setMode('host')}
                  className="bg-gradient-to-br from-pink-600 to-rose-500 p-8 rounded-[2rem] hover:scale-105 transition-transform flex flex-col items-center justify-center group shadow-xl shadow-pink-500/10"
                >
                  <UploadCloud className="w-10 h-10 mb-4 text-white group-hover:-translate-y-1 transition-transform" />
                  <span className="font-bold text-xl tracking-tight">Send File</span>
                </button>
                <button 
                  onClick={() => setMode('peer')}
                  className="bg-gradient-to-br from-blue-600 to-indigo-500 p-8 rounded-[2rem] hover:scale-105 transition-transform flex flex-col items-center justify-center group shadow-xl shadow-blue-500/10"
                >
                  <DownloadCloud className="w-10 h-10 mb-4 text-white group-hover:translate-y-1 transition-transform" />
                  <span className="font-bold text-xl tracking-tight">Receive File</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* SENDER MODE (FILE SELECT & WAIT) */}
          {(status === 'offline' && mode === 'host') && (
            <motion.div 
               key="host-prepare"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="p-10 md:p-16 relative z-10"
            >
               <button onClick={resetConnection} className="absolute top-6 left-6 text-zinc-500 hover:text-white p-2"><X /></button>
               <div className="text-center mb-10">
                 <UploadCloud className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                 <h2 className="text-3xl font-bold tracking-tight mb-2">Select to Send</h2>
                 <p className="text-zinc-500">Pick a secure file to blast over local WiFi.</p>
               </div>
               
               <input type="file" onChange={handleFileChange} id="fileInput" className="hidden" />
               <label htmlFor="fileInput" className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-pink-500/50 bg-white/5 rounded-[2rem] p-12 cursor-pointer transition-colors mb-6 group">
                 <File className="w-10 h-10 text-zinc-600 group-hover:text-pink-400 mb-3 transition-colors" />
                 <span className="font-bold text-lg">{file ? file.name : 'Click to Browse Local System'}</span>
                 {file && <span className="text-sm font-mono text-pink-400 mt-2">{(file.size / 1024 /  1024).toFixed(2)} MB Selected</span>}
               </label>
               
               <button 
                 disabled={!file}
                 onClick={handleHostStart}
                 className="w-full bg-white text-black font-bold h-14 rounded-2xl flex items-center justify-center disabled:opacity-50 hover:bg-zinc-200 transition-colors"
               >
                 Generate Connection Radar
               </button>
            </motion.div>
          )}

          {/* PEER MODE (ENTER PIN) */}
          {(status === 'offline' && mode === 'peer') && (
            <motion.div 
               key="peer-prepare"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="p-10 md:p-16 relative z-10 flex flex-col items-center text-center"
            >
               <button onClick={resetConnection} className="absolute top-6 left-6 text-zinc-500 hover:text-white p-2"><X /></button>
               <DownloadCloud className="w-12 h-12 text-blue-500 mx-auto mb-6" />
               <h2 className="text-3xl font-bold tracking-tight mb-2">Connect to Sender</h2>
               <p className="text-zinc-500 max-w-xs mb-10">Enter the 6-digit PIN displayed on the sender's radar screen.</p>
               
               <form onSubmit={handlePeerJoin} className="w-full max-w-sm">
                 <input 
                   autoFocus
                   type="text" 
                   maxLength={6}
                   className="w-full bg-black/50 border-2 border-blue-500/30 text-white font-mono text-center text-5xl tracking-[0.3em] rounded-2xl p-6 outline-none focus:border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.1)] mb-6 transition-all"
                   placeholder="------"
                   value={pinInput}
                   onChange={e => setPinInput(e.target.value.replace(/[^0-9]/g, ''))} // only numbers
                 />
                 <button 
                   type="submit"
                   disabled={pinInput.length !== 6}
                   className="w-full bg-blue-600 text-white font-bold h-14 rounded-2xl disabled:opacity-50 hover:bg-blue-500 transition-colors shadow-xl shadow-blue-500/10"
                 >
                   Establish Secure Link
                 </button>
               </form>
            </motion.div>
          )}

          {/* RADAR & WAITING / CONNECTING MODE */}
          {(status === 'waiting' || status === 'connecting') && (
            <motion.div 
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-10 h-full flex flex-col items-center justify-center text-center relative z-10 min-h-[400px]"
            >
               <button onClick={resetConnection} className="absolute top-6 right-6 font-bold text-xs tracking-widest uppercase text-rose-500 hover:text-white p-2">Cancel Link</button>
               
               {/* Radar Animation */}
               <div className="relative w-48 h-48 flex items-center justify-center mb-10">
                 <motion.div 
                   animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                   className={`absolute w-full h-full rounded-full border-2 ${mode === 'host' ? 'border-pink-500' : 'border-blue-500'}`} 
                 />
                 <motion.div 
                   animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                   className={`absolute w-full h-full rounded-full border border-[${mode === 'host' ? '#f472b6' : '#3b82f6'}]`} 
                 />
                 <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 z-10 flex items-center justify-center shadow-xl">
                   <Wifi className={`${mode === 'host' ? 'text-pink-500' : 'text-blue-500'} animate-pulse`} size={32} />
                 </div>
               </div>

               {mode === 'host' && (
                  <>
                     <p className="text-zinc-500 uppercase font-bold text-xs tracking-[0.2em] mb-3">Your Secure Connection PIN</p>
                     <div className="text-6xl font-mono text-white font-bold tracking-[0.2em] mb-4 bg-white/5 border border-white/10 py-4 px-8 rounded-3xl inline-block shadow-inner">{pin}</div>
                     <p className="text-pink-400 text-sm font-medium animate-pulse">Scanning local subnet for receiver...</p>
                  </>
               )}

               {mode === 'peer' && (
                  <>
                     <h3 className="text-3xl font-bold mb-3">Syncing Systems</h3>
                     <p className="text-blue-400 text-sm font-medium animate-pulse mb-2">Exchanging ICE Candidates & Establishing P2P Link...</p>
                     <p className="text-zinc-500 text-xs font-mono">PIN: {pinInput}</p>
                  </>
               )}
            </motion.div>
          )}

          {/* TRANSFERRING STATE */}
          {status === 'transferring' && (
             <motion.div 
               key="transferring"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0 }}
               className="p-10 md:p-16 h-full flex flex-col items-center justify-center text-center relative z-10"
             >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(56,189,248,0.3)] shrink-0">
                  <div className="text-white font-bold text-xl">{Math.floor(progress)}%</div>
                </div>

                <h3 className="text-3xl font-bold mb-2 tracking-tight">Direct Feed Active</h3>
                <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
                  {mode === 'host' ? `Beaming ${file?.name} to destination.` : `Receiving ${incomingFileName}...`}
                </p>

                {/* Cyber Progress Bar */}
                <div className="w-full bg-white/5 h-4 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
                   <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)] z-10 pointer-events-none" />
                   <motion.div 
                     className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                     initial={{ width: '0%' }}
                     animate={{ width: `${progress}%` }}
                   />
                </div>
                
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold mt-8">Do not close window • Speed: Local WiFi LAN Max</p>
             </motion.div>
          )}

          {/* COMPLETE STATE */}
          {status === 'complete' && (
            <motion.div 
               key="complete"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="p-10 md:p-20 h-full flex flex-col items-center justify-center text-center relative z-10"
            >
               <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 border border-emerald-500/30">
                 <CheckCircle2 className="w-12 h-12 text-emerald-400" />
               </div>
               <h3 className="text-4xl font-bold tracking-tight mb-4">Transmission Perfect</h3>
               <p className="text-zinc-400 mb-10 max-w-sm mx-auto">
                 {mode === 'host' ? 'The file has successfully landed on the target device.' : 'The file has been saved to your downloads locally.'}
               </p>
               <button 
                 onClick={resetConnection}
                 className="bg-white text-black font-bold h-12 px-8 rounded-2xl hover:bg-zinc-200 transition-colors"
               >
                 Close Link
               </button>
            </motion.div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <motion.div 
               key="error"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="p-10 h-full flex flex-col items-center justify-center text-center relative z-10"
            >
               <AlertTriangle className="w-16 h-16 text-rose-500 mb-6" />
               <h3 className="text-2xl font-bold mb-3">Connection Severed</h3>
               <p className="text-zinc-400 max-w-sm mx-auto mb-8">
                  The P2P link failed to mount, or the recipient cleanly disconnected from the radar subnet.
               </p>
               <button 
                 onClick={resetConnection}
                 className="btn-premium btn-secondary font-bold h-12 px-8 rounded-2xl"
               >
                 Acknowledge & Return
               </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
