import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Power, Activity, Upload, Play, MoreVertical, Trash2, Video as VideoIcon, Plus, MonitorPlay } from 'lucide-react';
import axios from 'axios';
import { useDetection } from '../context/DetectionContext';

const AnimalDetection = () => {
  const { isActive, startAnalysis, stopAnalysis, activeVideo: contextActiveVideo, toggleAnalysis, setPortalNode } = useDetection();
  
  const [videos, setVideos] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); // Local selection for viewing details/prep
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // For uploading
  const fileInputRef = useRef(null);

  // Sync context active video with local selection if needed? 
  // No, user clicks a video -> sets selectedVideo (local).
  // If they click Run Analysis -> context.startAnalysis(selectedVideo).
  
  // Also, if context is active, we should probably show THAT video as selected? 
  useEffect(() => {
      if(isActive && contextActiveVideo) {
          setSelectedVideo(contextActiveVideo);
      }
  }, [isActive, contextActiveVideo]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) return;

      const [videosRes, zonesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/videos', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/farmer/zones', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setVideos(videosRes.data);
      setZones(zonesRes.data);
      
      if (videosRes.data.length > 0 && !selectedVideo && !isActive) {
         setSelectedVideo(videosRes.data[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedZoneId) {
        alert("Please select a zone before uploading.");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', file.name.split('.')[0]); 
    formData.append('zoneId', selectedZoneId);
    
    // Find zone name
    const zoneObj = zones.find(z => z._id === selectedZoneId);
    if(zoneObj) formData.append('zoneName', zoneObj.zoneName);

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.post('http://localhost:5000/api/videos', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchData(); // Refresh list
    } catch (error) {
      console.error("Upload Error Details:", error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      // Reset input
      if(fileInputRef.current) fileInputRef.current.value = '';
      setSelectedZoneId(""); 
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent selection
    if(!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`http://localhost:5000/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newVideos = videos.filter(v => v._id !== id);
      setVideos(newVideos);
      
      if (selectedVideo?._id === id) {
        setSelectedVideo(newVideos.length > 0 ? newVideos[0] : null);
      }
      
      // Stop analysis if we process the deleted video
      if (contextActiveVideo?._id === id && isActive) {
          stopAnalysis();
      }

    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleSystemToggle = () => {
      if(isActive) {
          stopAnalysis();
      } else {
          if(!selectedVideo) return alert("Select a video first");
          startAnalysis(selectedVideo);
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gray-950 text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 shadow-lg shrink-0">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-500 w-8 h-8" />
                <div>
                     <h1 className="text-xl font-bold font-mono tracking-widest text-green-500">ANIMAL INTELLIGENCE</h1>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded border border-gray-800">
                <Activity className={`w-4 h-4 ${isActive ? 'text-green-500 animate-pulse' : 'text-gray-600'}`} />
                <span className="font-mono text-sm tracking-wider">
                    ANALYSIS: <span className={isActive ? "text-green-500" : "text-gray-500"}>
                        {isActive ? "ACTIVE" : "IDLE"}
                    </span>
                </span>
            </div>

            <button
                onClick={handleSystemToggle}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                    isActive 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20" 
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
                }`}
            >
                <Power size={18} />
                {isActive ? "STOP ANALYSIS" : "RUN ANALYSIS"}
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Main View - Active Video Placeholder or Global Overlay Area */}
         <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 relative">
             {/* 
                Explanation: GlobalSurveillance component in App.jsx renders the actual video.
                If we are On this page, GlobalSurveillance will "appear" to be here because we styled it position:relative (via App logic or Portal).
                Wait, my GlobalSurveillance logic was: if /farmer/detection, show relative. 
                But where is it in the DOM? It is in App.jsx, ABOVE Sidebar/Main content structure?
                No, looking at App.jsx, it's just inside the main div wrapper, ABOVE Sidebar and Main content.
                So it will push Sidebar/Content down if relative?
                Ah, I set it to `position: shouldShow ? 'relative' : 'fixed'`.
                If relative in App.jsx, it pushes everything down. That's bad layout.
                
                Correction: GlobalSurveillance should ideally be INSIDE this component to fit nicely, OR we use a Portal.
                Since I didn't set up a Portal, and "display:none" allows keeping state,
                GlobalSurveillance acts as the "Engine".
                
                For VISUAL FEEDBACK on this page:
                We want to see the video right here in this specific div.
                If GlobalSurveillance is outside, we can't easily see it here without absolute positioning hacks or Portals.
                
                Alternative:
                GlobalSurveillance handles logic but renders DIFFERENTLY.
                Or, cleaner:
                We keep GlobalSurveillance for 'Background mode' (hidden video element).
                When on THIS page, we perform a "Handoff"? No, that resets state.
                
                Let's use a React Portal to mount the video from GlobalSurveillance INTO a DOM node here.
                I will add an ID 'detection-view-container' here.
                GlobalSurveillance will verify if that ID exists (via ref or getElementById) and createPortal into it.
             */}
             <div 
                id="detection-video-portal" 
                ref={(node) => {
                    if (node) setPortalNode(node);
                    // We don't necessarily need to unset it on unmount if we just overwrite it, 
                    // but cleaner might be to clean up in useEffect. 
                    // However, ref callback runs with null on unmount.
                    else setPortalNode(null); 
                }}
                className="w-full max-w-5xl aspect-video bg-black rounded-lg border border-gray-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
                 {!isActive && !selectedVideo && (
                     <div className="text-center text-gray-500">
                         <VideoIcon size={64} className="mx-auto mb-4 opacity-20" />
                         <h3 className="text-xl font-mono">NO VIDEO SELECTED</h3>
                         <p>Select a video from the library to begin analysis</p>
                     </div>
                 )}
                 {!isActive && selectedVideo && (
                     <div className="relative w-full h-full group">
                         {/* Preview Video Player */}
                         <video
                             key={selectedVideo._id}
                             src={selectedVideo.fileUrl?.startsWith('/uploads') ? `http://localhost:5000${selectedVideo.fileUrl}` : selectedVideo.fileUrl}
                             className="w-full h-full object-contain"
                             controls
                             playsInline
                             crossOrigin="anonymous"
                         />
                         <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
                             <span className="text-green-500 font-mono text-sm font-bold">PREVIEW MODE</span>
                         </div>
                         <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 rounded backdrop-blur-sm">
                             <h3 className="text-lg font-bold text-white">{selectedVideo.title}</h3>
                             <p className="text-green-400 text-sm">{selectedVideo.zoneName || 'Unknown Zone'}</p>
                         </div>
                     </div>
                 )}
                 {/* The Portal will fill this when active and on this route */}
             </div>
         </div>

         {/* Sidebar - Video Library */}
         <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-gray-300 flex items-center gap-2">
                     <VideoIcon size={18} /> LIBRARY
                 </h3>
                 <div className="flex items-center gap-2">
                     <select 
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 outline-none focus:border-green-500 w-32"
                     >
                        <option value="">Select Zone</option>
                        {zones.map(z => (
                            <option key={z._id} value={z._id}>{z.zoneName}</option>
                        ))}
                     </select>
                     <button 
                        onClick={() => {
                             if(!selectedZoneId) {
                                 alert("Please select a zone first");
                                 return;
                             }
                             fileInputRef.current?.click();
                        }}
                        disabled={uploading}
                        className={`p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition ${uploading || !selectedZoneId ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                         {uploading ? <Activity className="animate-spin" size={18} /> : <Plus size={18} />}
                     </button>
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleUpload}
                 />
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {loading ? (
                     <div className="text-center py-10 text-gray-600">Loading library...</div>
                 ) : videos.length === 0 ? (
                     <div className="text-center py-10 text-gray-600 text-sm">
                         No videos found.<br />Upload one to start.
                     </div>
                 ) : (
                     videos.map(video => (
                         <div 
                            key={video._id} 
                            onClick={() => {
                                setSelectedVideo(video);
                                // If currently analyzing, switch the active video too
                                if (isActive) {
                                    startAnalysis(video);
                                }
                            }}
                            className={`group last:border-b-0 p-3 rounded-lg cursor-pointer transition-all border border-transparent ${
                                selectedVideo?._id === video._id 
                                ? 'bg-green-900/20 border-green-800' 
                                : 'hover:bg-gray-800 border-gray-800/50'
                            }`}
                         >
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="w-10 h-10 bg-gray-950 rounded flex items-center justify-center shrink-0">
                                         <Play size={16} className={`${selectedVideo?._id === video._id ? 'text-green-500' : 'text-gray-600'}`} />
                                     </div>
                                     <div className="min-w-0">
                                         <h4 className={`text-sm font-medium truncate ${selectedVideo?._id === video._id ? 'text-green-400' : 'text-gray-300'}`}>
                                             {video.title}
                                         </h4>
                                         <p className="text-xs text-gray-500 truncate">
                                             {new Date(video.createdAt).toLocaleDateString()}
                                         </p>
                                     </div>
                                 </div>
                                 
                                 <button 
                                     onClick={(e) => handleDelete(e, video._id)}
                                     className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition opacity-0 group-hover:opacity-100"
                                 >
                                     <Trash2 size={14} />
                                 </button>
                             </div>
                         </div>
                     ))
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default AnimalDetection;
