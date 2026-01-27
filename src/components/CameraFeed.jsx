import React, { useState, useRef, useEffect } from 'react';
import VideoUploader from './VideoUploader';
import { detectAnimals, loadModel } from '../utils/animalDetector';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const CameraFeed = ({ id, videoUrl, globalDetecting, zoneName }) => {
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const isDetectingRef = useRef(false);
  const lastAlertTimeRef = useRef({}); // Track last alert time per animal type

  // Sync internal detection state with global control and video presence
  useEffect(() => {
    if (globalDetecting && videoUrl) {
      startDetection();
    } else {
      stopDetection();
    }
    // Cleanup on unmount
    return () => stopDetection();
  }, [globalDetecting, videoUrl]);

  // If videoUrl changes, ensuring we reload/reset
  useEffect(() => {
     setDetections([]);
     setError(null);
     lastAlertTimeRef.current = {}; // Reset alert throttles
  }, [videoUrl]);
  
  // Removed handleVideoUpload and handleClear as they are controlled by parent now

  const startDetection = async () => {
    if (!videoUrl || !videoRef.current) return;
    
    // If already running, don't restart
    if (isDetectingRef.current) return;

    try {
      if (videoRef.current.paused) {
        // Mute video to allow autoplay policies if needed, though usually user interaction handles it
        videoRef.current.muted = true; 
        await videoRef.current.play();
      }

      // Ensure model is loaded (cached usually)
      await loadModel();
      
      isDetectingRef.current = true;
      detectLoop();
    } catch (err) {
      console.error(`CAM-${id} Error:`, err);
      setError("Detection failed");
      isDetectingRef.current = false;
    }
  };

  const stopDetection = () => {
    isDetectingRef.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const sendAlert = async (animalClass) => {
      const now = Date.now();
      const lastSent = lastAlertTimeRef.current[animalClass] || 0;
      
      // Throttle: Only send alert for same animal every 5 seconds
      if (now - lastSent > 5000) {
          lastAlertTimeRef.current[animalClass] = now;
          
          try {
              const token = JSON.parse(localStorage.getItem('user'))?.token;
              if(!token) return;

              await axios.post('http://localhost:5000/api/alerts/detect', {
                  animalType: animalClass,
                  videoId: id,
                  zoneName: zoneName || 'Unknown Zone'
              }, {
                  headers: { Authorization: `Bearer ${token}` }
              });
              console.log(`Alert sent for ${animalClass}`);
          } catch (err) {
              console.error("Failed to send alert:", err);
          }
      }
  };

  const detectLoop = async () => {
    if (!videoRef.current || !canvasRef.current || !isDetectingRef.current) return;

    if (videoRef.current.readyState >= 2) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Run detection
      const results = await detectAnimals(video);
      setDetections(results);
      drawDetections(results);

      // Process Alerts
      results.forEach(d => {
          if (d.score > 0.6) { // Confidence threshold
              sendAlert(d.class);
          }
      });
    }

    if (isDetectingRef.current) {
      requestRef.current = requestAnimationFrame(detectLoop);
    }
  };

  const drawDetections = (results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // CCTV Style Drawing
    ctx.font = 'bold 18px monospace';
    ctx.textBaseline = 'top';

    results.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      const isDog = prediction.class === 'dog';
      // Green for safe animals, Red for potential threats/alert (dog in this context?) or just differentiate
      const color = '#00FF00'; 

      // Draw brackets instead of full box for sci-fi/CCTV look
      const bracketSize = Math.min(width, height) * 0.2;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath(); ctx.moveTo(x, y + bracketSize); ctx.lineTo(x, y); ctx.lineTo(x + bracketSize, y); ctx.stroke();
      // Top-Right
      ctx.beginPath(); ctx.moveTo(x + width - bracketSize, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + bracketSize); ctx.stroke();
      // Bottom-Right
      ctx.beginPath(); ctx.moveTo(x + width, y + height - bracketSize); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width - bracketSize, y + height); ctx.stroke();
      // Bottom-Left
      ctx.beginPath(); ctx.moveTo(x + bracketSize, y + height); ctx.lineTo(x, y + height); ctx.lineTo(x, y + height - bracketSize); ctx.stroke();

      // Label
      const text = `${prediction.class.toUpperCase()} ${Math.round(prediction.score * 100)}%`;
      ctx.fillStyle = color;
      ctx.fillText(text, x + 5, y + 5);
      
      // Tracking line effect (optional) (dashed line to center)
      // ctx.setLineDash([5, 5]);
      // ctx.beginPath(); ctx.moveTo(x + width/2, y + height/2); ctx.lineTo(canvas.width/2, canvas.height/2); ctx.stroke();
      // ctx.setLineDash([]);
    });
  };

  return (
    <div className="relative bg-black border-2 border-gray-800 rounded-lg overflow-hidden flex flex-col h-full shadow-[0_0_10px_rgba(0,255,0,0.1)] group hover:border-green-900 transition-colors aspect-video">
      {/* CCTV Overlay Header */}
      <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex flex-col">
            <span className="text-green-500 font-mono text-xl font-bold tracking-wider">CAM-{String(id).padStart(2, '0')}</span>
            <span className="text-green-500/70 font-mono text-xs">{new Date().toLocaleTimeString()}</span>
        </div>
        
        {videoUrl && globalDetecting && (
             <div className="flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)]"></div>
                <span className="text-red-600 font-bold font-mono tracking-widest text-sm">REC</span>
            </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative flex-1 bg-gray-900 w-full h-full flex items-center justify-center">
        {videoUrl ? (
            <>
                <video
                    key={videoUrl}
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    loop
                    playsInline
                    muted
                    crossOrigin="anonymous" 
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    width={640} // Default defaults, will likely be resized
                    height={480}
                />
                
                {/* Detected Animals List Overlay */}
                {detections.length > 0 && (
                    <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
                        {detections.map((d, i) => (
                            <span key={i} className="text-green-400 font-mono text-xs bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border-l-2 border-green-500">
                                TARGET: {d.class.toUpperCase()}
                            </span>
                        ))}
                    </div>
                )}
            </>
        ) : (
             <div className="flex flex-col items-center justify-center text-gray-600">
                 <Loader2 className="mb-2 animate-spin opacity-0" /> {/* Hidden but keeps layout consistent just in case */}
                 <p className="text-sm">Video feed ready</p>
             </div>
        )}
      </div>
      
      {/* Scan lines effect */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(0,0,0,0.1)_3px)] z-10 opacity-30"></div>
    </div>
  );
};

export default CameraFeed;
