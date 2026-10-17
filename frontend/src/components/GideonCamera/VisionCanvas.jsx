import React, { useRef, useEffect } from 'react';
import { useCamera } from './CameraProvider';

// --- NEURAL OCR UTILS (Orientation Locked Engine) ---
const NUM_POINTS = 64;
const SQUARE_SIZE = 250.0;
const DIAGONAL = Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);
const HALF_DIAGONAL = 0.5 * DIAGONAL;
const ANGLE_RANGE = 25.0; // Allowed hand tilt (+/- degrees)
const PHI = 0.5 * (-1.0 + Math.sqrt(5.0));

const resample = (points, n) => {
    const dLen = pathLength(points) / (n - 1);
    let D = 0.0;
    const newPoints = [points[0]];
    const pts = [...points];
    for (let i = 1; i < pts.length; i++) {
        const d = distance(pts[i - 1], pts[i]);
        if ((D + d) >= dLen) {
            const q = { x: pts[i - 1].x + ((dLen - D) / d) * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + ((dLen - D) / d) * (pts[i].y - pts[i - 1].y) };
            newPoints.push(q); pts.splice(i, 0, q); D = 0.0;
        } else D += d;
    }
    if (newPoints.length === n - 1) newPoints.push(pts[pts.length - 1]);
    return newPoints;
};

const scaleToSquare = (points, size) => {
    const B = boundingBox(points);
    return points.map(p => ({ x: p.x * (size / B.width), y: p.y * (size / B.height) }));
};

const translateToOrigin = (points) => {
    const c = centroid(points);
    return points.map(p => ({ x: p.x - c.x, y: p.y - c.y }));
};

const pathDistance = (pts1, pts2) => {
    let d = 0.0;
    for (let i = 0; i < pts1.length; i++) d += distance(pts1[i], pts2[i]);
    return d / pts1.length;
};

const pathLength = (points) => {
    let d = 0.0;
    for (let i = 1; i < points.length; i++) d += distance(points[i - 1], points[i]);
    return d;
};

const distance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const centroid = (points) => {
    let x = 0.0, y = 0.0;
    for (const p of points) { x += p.x; y += p.y; }
    return { x: x / points.length, y: y / points.length };
};

const rotateBy = (points, theta) => {
    const c = centroid(points);
    const cos = Math.cos(theta), sin = Math.sin(theta);
    return points.map(p => ({
        x: (p.x - c.x) * cos - (p.y - c.y) * sin + c.x,
        y: (p.x - c.x) * sin + (p.y - c.y) * cos + c.y
    }));
};

const distanceAtBestAngle = (points, T, a, b, threshold) => {
    let x1 = PHI * a + (1.0 - PHI) * b; let f1 = distanceAtAngle(points, T, x1);
    let x2 = (1.0 - PHI) * a + PHI * b; let f2 = distanceAtAngle(points, T, x2);
    while (Math.abs(b - a) > threshold) {
        if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = PHI * a + (1.0 - PHI) * b; f1 = distanceAtAngle(points, T, x1); }
        else { a = x1; x1 = x2; f1 = f2; x2 = (1.0 - PHI) * a + PHI * b; f2 = distanceAtAngle(points, T, x2); }
    }
    return Math.min(f1, f2);
};

const distanceAtAngle = (points, T, theta) => pathDistance(rotateBy(points, theta), T.points);

const boundingBox = (points) => {
    const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y)), maxY = Math.max(...points.map(p => p.y));
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

const TEMPLATE_LIB = [
    { name: 'A', points: [[158,249],[223,62],[285,249],[180,186],[259,186]] },
    { name: 'B', points: [[132,60],[132,240],[132,60],[220,60],[240,105],[220,150],[132,150],[220,150],[240,195],[220,240],[132,240]] },
    { name: 'C', points: [[270,90],[210,60],[150,90],[130,150],[150,210],[210,240],[270,210]] },
    { name: 'D', points: [[140,60],[140,240],[140,60],[210,60],[250,110],[250,190],[210,240],[140,240]] },
    { name: 'E', points: [[250,60],[140,60],[140,150],[230,150],[140,150],[140,240],[250,240]] },
    { name: 'F', points: [[250,60],[140,60],[140,150],[230,150],[140,150],[140,240]] },
    { name: 'G', points: [[270,100],[210,60],[130,150],[210,240],[270,210],[270,160],[220,160]] },
    { name: 'H', points: [[140,60],[140,240],[140,150],[250,150],[250,60],[250,240]] },
    { name: 'I', points: [[150,60],[250,60],[200,60],[200,240],[150,240],[250,240]] },
    { name: 'J', points: [[250,60],[250,200],[210,240],[150,220]] },
    { name: 'K', points: [[140,60],[140,240],[140,150],[250,60],[140,150],[250,240]] },
    { name: 'L', points: [[150,60],[150,240],[250,240]] },
    { name: 'M', points: [[130,240],[130,60],[200,150],[270,60],[270,240]] },
    { name: 'N', points: [[140,240],[140,60],[250,240],[250,60]] },
    { name: 'O', points: [[200,60],[140,110],[140,190],[200,240],[260,190],[260,110],[200,60]] },
    { name: 'P', points: [[140,240],[140,60],[230,60],[250,110],[230,160],[140,160]] },
    { name: 'Q', points: [[200,60],[140,110],[140,190],[200,240],[260,190],[260,110],[200,60],[230,210],[270,250]] },
    { name: 'R', points: [[140,240],[140,60],[230,60],[250,110],[230,160],[140,160],[250,240]] },
    { name: 'S', points: [[260,80],[200,60],[140,100],[200,150],[260,200],[200,240],[140,220]] },
    { name: 'T', points: [[140,60],[260,60],[200,60],[200,240]] },
    { name: 'U', points: [[140,60],[140,200],[200,240],[260,200],[260,60]] },
    { name: 'V', points: [[140,60],[200,240],[260,60]] },
    { name: 'W', points: [[130,60],[150,240],[200,150],[250,240],[270,60]] },
    { name: 'X', points: [[140,60],[260,240],[200,150],[260,60],[140,240]] },
    { name: 'Y', points: [[140,60],[200,150],[260,60],[200,150],[200,240]] },
    { name: 'Z', points: [[140,60],[260,60],[140,240],[260,240]] },
    { name: '1', points: [[170,80],[200,60],[200,240]] },
    { name: '2', points: [[150,90],[200,60],[250,90],[150,240],[250,240]] },
    { name: '3', points: [[150,60],[250,60],[150,150],[250,150],[150,240]] },
    { name: '4', points: [[200,240],[200,60],[140,160],[260,160]] },
    { name: '5', points: [[260,60],[140,60],[140,150],[260,150],[260,240],[140,240]] },
    { name: '6', points: [[260,60],[140,150],[140,240],[260,240],[260,150],[140,150]] },
    { name: '7', points: [[140,60],[260,60],[180,240]] },
    { name: '8', points: [[200,150],[140,100],[200,60],[260,100],[200,150],[140,200],[200,240],[260,200],[200,150]] },
    { name: '9', points: [[260,150],[140,150],[140,60],[260,60],[260,240]] },
    { name: '0', points: [[200,60],[140,110],[140,190],[200,240],[260,190],[260,110],[200,60]] },
].map(T => ({ name: T.name, points: resample(translateToOrigin(scaleToSquare(T.points.map(p => ({ x: p[0], y: p[1] })), SQUARE_SIZE)), NUM_POINTS) }));

export function VisionCanvas({ results, mode = 'pointer', isMirrored = true }) {
  const feedCanvasRef = useRef(null);
  const strokeCanvasRef = useRef(null); 
  const interactionCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const { videoRef } = useCamera();
  const animationFrameRef = useRef(null);
  
  const currentResults = useRef(null);
  const activeStroke = useRef([]);
  const pendingStrokeGroup = useRef([]);
  const gestureHistory = useRef([]); // PERSISTENT DATA
  const emaPos = useRef({ x: 0, y: 0 });

  const lastState = useRef({
    isPinching: false, lastPinchTime: 0, lastEndPoint: null,
    fusionTimeout: 600, bridgeTimeout: 400, bridgeRadius: 60,
    pinchEnter: 0.038, pinchExit: 0.056,
  });

  useEffect(() => { currentResults.current = results; }, [results]);

  useEffect(() => {
    const handleResize = () => {
      if (feedCanvasRef.current && strokeCanvasRef.current && interactionCanvasRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        [feedCanvasRef, strokeCanvasRef, interactionCanvasRef].forEach(ref => { ref.current.width = width; ref.current.height = height; });
      }
    };
    handleResize(); window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mapToViewport = (pt, width, height) => {
    const vAR = 1280/720; const sAR = width/height;
    let tx = isMirrored ? 1 - pt.x : pt.x;
    if (sAR > vAR) { const vH = width/vAR; return { x: tx*width, y: pt.y*vH + (height-vH)/2 }; }
    else { const vW = height*vAR; return { x: tx*vW + (width-vW)/2, y: pt.y*height }; }
  };

  const drawSmoothedPath = (ctx, points, color, width, shadow = true) => {
    if (points.length < 2) return;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (shadow) { ctx.shadowBlur = width * 2; ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'; }
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 2; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2; const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    if (points.length > 2) ctx.quadraticCurveTo(points[points.length-2].x, points[points.length-2].y, points[points.length-1].x, points[points.length-1].y);
    else ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
    ctx.stroke(); ctx.shadowBlur = 0;
  };

  const recognizeGesture = (strokes) => {
    if (strokes.length === 0) return;
    const combined = strokes.flat(); if (combined.length < 10) return;
    const cand = resample(translateToOrigin(scaleToSquare(combined, SQUARE_SIZE)), NUM_POINTS);
    let bestDist = Infinity, bestMatch = null;
    for (const template of TEMPLATE_LIB) {
      const d = distanceAtBestAngle(cand, template, -ANGLE_RANGE * (Math.PI/180), ANGLE_RANGE * (Math.PI/180), 0.03);
      if (d < bestDist) { bestDist = d; bestMatch = template; }
    }
    const score = 1.0 - (bestDist / HALF_DIAGONAL);
    const B = boundingBox(combined);
    if (score > 0.72) {
      gestureHistory.current.push({ type: 'char', value: bestMatch.name, x: B.x + B.width/2, y: B.y + B.height/2, size: Math.max(48, B.height) });
    } else {
      // --- NEURAL FALLBACK ---
      // If not a clear character, commit as a permanent path instead of discarding
      gestureHistory.current.push({ type: 'path', strokes: [...strokes] });
    }
  };

  useEffect(() => {
    const render = () => {
      if (!feedCanvasRef.current || !interactionCanvasRef.current || !videoRef.current) {
        animationFrameRef.current = requestAnimationFrame(render); return;
      }
      const fCtx = feedCanvasRef.current.getContext('2d'), sCtx = strokeCanvasRef.current.getContext('2d'), iCtx = interactionCanvasRef.current.getContext('2d');
      const { width, height } = feedCanvasRef.current, video = videoRef.current;
      
      // 1. LAYER: FEED
      fCtx.clearRect(0, 0, width, height);
      if (video.readyState >= 2) {
        const vAR = video.videoWidth/video.videoHeight; const sAR = width/height;
        let sW, sH, sx, sy;
        if (sAR > vAR) { sW = video.videoWidth; sH = video.videoWidth/sAR; sx = 0; sy = (video.videoHeight-sH)/2; }
        else { sH = video.videoHeight; sW = video.videoHeight*sAR; sx = (video.videoWidth-sW)/2; sy = 0; }
        fCtx.save(); if (isMirrored) { fCtx.scale(-1, 1); fCtx.translate(-width, 0); }
        fCtx.drawImage(video, sx, sy, sW, sH, 0, 0, width, height); fCtx.restore();
      }

      // 2. LAYER: STROKES (TOTAL PERSISTENCE)
      sCtx.clearRect(0, 0, width, height);
      gestureHistory.current.forEach(item => {
        if (item.type === 'char') {
          sCtx.fillStyle = '#3b82f6'; sCtx.font = `bold ${item.size}px 'Inter', monospace`; sCtx.textAlign = 'center'; sCtx.textBaseline = 'middle';
          sCtx.shadowBlur = 25; sCtx.shadowColor = 'rgba(59, 130, 246, 0.6)'; sCtx.fillText(item.value, item.x, item.y); sCtx.shadowBlur = 0;
        } else if (item.type === 'path') {
          item.strokes.forEach(s => drawSmoothedPath(sCtx, s, 'rgba(59, 130, 246, 0.7)', 6, true));
        }
      });

      // 3. LAYER: INTERACTION
      iCtx.clearRect(0, 0, width, height);
      const hand = currentResults.current?.multiHandLandmarks?.[0];

      if (hand) {
        const { x: rx, y: ry } = mapToViewport(hand[8], width, height);
        emaPos.current.x = emaPos.current.x * 0.7 + rx * 0.3; emaPos.current.y = emaPos.current.y * 0.7 + ry * 0.3;
        const { x, y } = emaPos.current;
        const dist = Math.sqrt(Math.pow(hand[4].x-hand[8].x,2)+Math.pow(hand[4].y-hand[8].y,2)+Math.pow(hand[4].z-hand[8].z,2));
        const now = Date.now();
        let currentPinch = lastState.current.isPinching ? dist < lastState.current.pinchExit : dist < lastState.current.pinchEnter;

        if (currentPinch && !lastState.current.isPinching) {
            if (mode === 'draw' && lastState.current.lastEndPoint) {
                if (now - lastState.current.lastPinchTime < lastState.current.bridgeTimeout && Math.hypot(x - lastState.current.lastEndPoint.x, y - lastState.current.lastEndPoint.y) < lastState.current.bridgeRadius) {
                    const lastStorke = pendingStrokeGroup.current.pop(); if (lastStorke) activeStroke.current = lastStorke;
                }
            }
        }

        if (mode === 'draw') {
          if (currentPinch) {
            const last = activeStroke.current[activeStroke.current.length-1];
            if (!last || Math.hypot(last.x-x, last.y-y) > 2) activeStroke.current.push({ x, y });
          } else if (activeStroke.current.length > 0) {
            lastState.current.lastEndPoint = { x, y };
            pendingStrokeGroup.current.push([...activeStroke.current]); activeStroke.current = [];
          }
          // --- UNIFIED CONTINUOUS DRAWING ---
          pendingStrokeGroup.current.forEach(s => drawSmoothedPath(iCtx, s, 'rgba(59, 130, 246, 0.6)', 6, true));
          if (activeStroke.current.length > 0) drawSmoothedPath(iCtx, activeStroke.current, 'rgba(59, 130, 246, 0.9)', 6, true);
        }

        if (pendingStrokeGroup.current.length > 0 && !currentPinch) {
            if (now - lastState.current.lastPinchTime > lastState.current.fusionTimeout) {
                recognizeGesture(pendingStrokeGroup.current); pendingStrokeGroup.current = []; lastState.current.lastEndPoint = null;
            }
        }

        if (currentPinch) lastState.current.lastPinchTime = now;
        lastState.current.isPinching = currentPinch;

        const cCol = currentPinch ? '#3b82f6' : 'white'; const pulse = currentPinch ? Math.sin(now/150)*5 + 25 : 15;
        iCtx.shadowBlur = pulse; iCtx.shadowColor = currentPinch ? 'rgba(59,130,246,1)' : 'rgba(255,255,255,0.3)';
        iCtx.strokeStyle = cCol; iCtx.lineWidth = currentPinch ? 5 : 2.5;
        iCtx.beginPath(); iCtx.arc(x, y, currentPinch ? 7 : 14, 0, Math.PI*2); iCtx.stroke();
        iCtx.fillStyle = cCol; iCtx.beginPath(); iCtx.arc(x, y, 3, 0, Math.PI*2); iCtx.fill();
        iCtx.shadowBlur = 0;
      } else {
        if (pendingStrokeGroup.current.length > 0 && (Date.now() - lastState.current.lastPinchTime > lastState.current.fusionTimeout)) {
             recognizeGesture(pendingStrokeGroup.current); pendingStrokeGroup.current = [];
        }
        if (mode === 'draw') pendingStrokeGroup.current.forEach(s => drawSmoothedPath(iCtx, s, 'rgba(59, 130, 246, 0.6)', 6, true));
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };
    render(); return () => cancelAnimationFrame(animationFrameRef.current);
  }, [mode, isMirrored, videoRef]);

  useEffect(() => {
    const handleClear = () => { gestureHistory.current = []; pendingStrokeGroup.current = []; };
    window.addEventListener('clear-vision-canvas', handleClear);
    return () => window.removeEventListener('clear-vision-canvas', handleClear);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none">
      <canvas ref={feedCanvasRef} className="absolute inset-0" />
      <canvas ref={strokeCanvasRef} className="absolute inset-0" />
      <canvas ref={interactionCanvasRef} className="absolute inset-0" />
    </div>
  );
}
