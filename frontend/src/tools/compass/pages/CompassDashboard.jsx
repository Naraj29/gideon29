import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Trash2, 
  Plus, 
  AlertCircle,
  Navigation,
  Loader2,
  Crosshair
} from 'lucide-react';
import compassService from '../services/compassService';

export default function CompassDashboard() {
  const [heading, setHeading] = useState(0);
  const [accurate, setAccurate] = useState(false);
  const [location, setLocation] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  // New waypoint input
  const [isAdding, setIsAdding] = useState(false);
  const [newWaypointName, setNewWaypointName] = useState('');

  // Smooth rotation ref
  const lastHeading = useRef(0);

  useEffect(() => {
    fetchWaypoints();
    checkPermissionsAutomatically();

    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            alt: pos.coords.altitude || 0,
            acc: pos.coords.accuracy
          });
        },
        (err) => {
          console.warn("Geolocation Error:", err);
          setErrorMsg("Cannot access GPS location.");
        },
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
    };
  }, []);

  const fetchWaypoints = async () => {
    try {
      const data = await compassService.getWaypoints();
      setWaypoints(data.results || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionsAutomatically = () => {
    // If it's not iOS 13+, deviceorientation might just work or not exist.
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
      startSensors();
    }
  };

  const requestAccess = async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          startSensors();
        } else {
          setErrorMsg("Compass permission denied.");
        }
      } else {
        startSensors();
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Device doesn't support orientation sensors or requires HTTPS.");
    }
  };

  const startSensors = () => {
    setPermissionGranted(true);
    setErrorMsg('');
    
    // Modern devices often support an absolute event
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  const handleOrientation = (event) => {
    let alpha = event.alpha;
    let webkitAlpha = event.webkitCompassHeading;
    
    if (webkitAlpha) {
      // iOS
      alpha = webkitAlpha;
      setAccurate(true);
    } else if (event.absolute && alpha !== null) {
      // Android / absolute
      alpha = 360 - alpha;
      setAccurate(true);
    } else if (alpha !== null) {
      // Fallback
      alpha = 360 - alpha;
    }

    if (alpha !== null) {
      // Calculate safest path for rotation to prevent 360 -> 0 spinning violently
      let delta = alpha - lastHeading.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      
      const newHeading = lastHeading.current + delta;
      setHeading(newHeading);
      lastHeading.current = newHeading;
    }
  };

  const handleSaveWaypoint = async (e) => {
    e.preventDefault();
    if (!newWaypointName.trim() || !location) return;
    
    try {
      const payload = {
        name: newWaypointName,
        latitude: location.lat,
        longitude: location.lng,
        heading: ((heading % 360) + 360) % 360 // Normalize 0-360
      };
      await compassService.createWaypoint(payload);
      setNewWaypointName('');
      setIsAdding(false);
      fetchWaypoints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWaypoint = async (id) => {
    try {
      await compassService.deleteWaypoint(id);
      fetchWaypoints();
    } catch (err) {
      console.error(err);
    }
  };

  const displayHeading = ((heading % 360) + 360) % 360;
  
  const getCardinal = (angle) => {
    const val = Math.floor((angle / 22.5) + 0.5);
    const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 px-6 font-sans">
      {/* Tool Header */}
      <header className="mb-12 text-center pt-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white"
        >
          The <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Navigator</span>
        </motion.h1>
      </header>

      {/* Permission Fallback */}
      {!permissionGranted && (
        <div className="mb-10 p-6 glass border border-blue-500/20 rounded-3xl text-center bg-blue-900/10 backdrop-blur-md">
          <Navigation className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Sensor Calibration</h3>
          <p className="text-zinc-400 mb-6 text-sm">To utilize the active compass dial, sensor access is required.</p>
          <button 
            onClick={requestAccess}
            className="btn-premium bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-blue-500/20"
          >
            Calibrate Sensors
          </button>
        </div>
      )}

      {/* The Dial Section */}
      <div className="relative flex flex-col items-center justify-center py-10 mb-16">
        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Readings Overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-4 z-10 pointer-events-none">
          <div className="text-center">
            <span className="block text-[10px] uppercase font-bold tracking-[0.2em] text-blue-500/60">Heading</span>
            <span className="text-2xl font-mono text-white font-bold">{Math.round(displayHeading)}°</span>
          </div>
          <div className="text-center">
            <span className="block text-[10px] uppercase font-bold tracking-[0.2em] text-blue-500/60">Bearing</span>
            <span className="text-2xl font-mono text-blue-400 font-bold">{getCardinal(displayHeading)}</span>
          </div>
        </div>

        {/* The Outer Rim */}
        <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] relative rounded-full border-4 border-[#1c1c22] bg-[#09090b] shadow-[0_0_80px_rgba(59,130,246,0.15)] flex items-center justify-center overflow-hidden">
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-full z-20 pointer-events-none" />
          
          {/* Fixed center target */}
          <div className="absolute z-20 flex items-center justify-center">
            <Crosshair className="w-8 h-8 text-blue-500 opacity-60" />
          </div>

          {/* Rotating Compass Face */}
          <motion.div 
            className="w-full h-full relative"
            animate={{ rotate: -heading }}
            transition={{ type: "spring", stiffness: 60, damping: 20 }}
          >
            {/* Markers */}
            {[...Array(72)].map((_, i) => {
              const deg = i * 5;
              const isMajor = i % 18 === 0; // 90 degree increments
              const isMedium = i % 6 === 0; // 30 degree increments
              
              return (
                <div 
                  key={i} 
                  className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom pb-[150px] md:pb-[200px]"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className={`
                    w-[2px] rounded-full mx-auto
                    ${isMajor ? 'h-5 bg-white' : isMedium ? 'h-3 bg-zinc-500' : 'h-1.5 bg-zinc-700/50'}
                    ${deg === 0 ? '!bg-red-500 !h-6 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}
                  `} />
                </div>
              );
            })}

            {/* Labels */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-red-500 font-bold text-2xl tracking-widest origin-center">N</div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-bold text-xl tracking-widest origin-center rotate-180">S</div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white font-bold text-xl tracking-widest origin-center rotate-90">E</div>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white font-bold text-xl tracking-widest origin-center -rotate-90">W</div>
            
            {/* North Arrow Pointer internal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-[80px] h-[80px] rotate-45 border-t-[8px] border-l-[8px] border-red-500/80 -translate-x-2 -translate-y-2 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* GPS Info Panel */}
        <div className="mt-12 glass px-8 py-4 rounded-3xl border border-white/5 flex gap-12 text-center divide-x divide-white/10">
          <div>
            <span className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Latitude</span>
            <span className="text-white font-mono">{location ? location.lat.toFixed(5) : '---.---'}</span>
          </div>
          <div className="pl-12">
            <span className="block text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1">Longitude</span>
            <span className="text-white font-mono">{location ? location.lng.toFixed(5) : '---.---'}</span>
          </div>
          {accurate && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-green-500 uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              True North Active
            </div>
          )}
        </div>
      </div>

      {/* Waypoints Section */}
      <section className="bg-zinc-950/40 border border-white/5 rounded-[2rem] p-6 lg:p-10 card-premium">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="text-blue-500"/> Waypoint Log</h2>
            <p className="text-zinc-500 text-sm mt-1">Capture your exact physical coordinates.</p>
          </div>
          
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className={`p-3 rounded-2xl transition-all ${isAdding ? 'bg-white/10 text-white rotate-45' : 'bg-blue-500 text-black shadow-lg shadow-blue-500/20'}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSaveWaypoint}
              className="mb-8 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-4 p-1">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Name this location... (e.g. Campsite Alpha)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-white"
                  value={newWaypointName}
                  onChange={e => setNewWaypointName(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!location}
                  className="bg-zinc-100 text-black px-6 py-3 rounded-xl font-bold hover:bg-white disabled:opacity-50 whitespace-nowrap"
                >
                  Drop Pin Here
                </button>
              </div>
              {!location && <p className="text-red-400 text-xs mt-2 px-2 flex items-center gap-1"><AlertCircle size={12}/> Waiting for GPS location lock...</p>}
            </motion.form>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
          ) : waypoints.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl text-zinc-600 font-medium">
              No waypoints stored.
            </div>
          ) : (
            waypoints.map(wp => (
              <motion.div 
                key={wp.id} 
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-2xl transition-all group"
              >
                <div>
                  <h4 className="font-bold text-white text-lg">{wp.name}</h4>
                  <div className="flex items-center gap-3 mt-1 font-mono text-xs text-blue-400 opacity-80">
                    <span>{wp.latitude?.toFixed(4)}, {wp.longitude?.toFixed(4)}</span>
                    {wp.heading && <span>• H: {Math.round(wp.heading)}°</span>}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleDeleteWaypoint(wp.id)}
                  className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
