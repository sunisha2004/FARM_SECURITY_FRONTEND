import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, Power, Activity, Upload, Play, MoreVertical, 
    Trash2, Video as VideoIcon, Plus, MonitorPlay, Zap, 
    Target, Cpu, Database, AlertCircle, ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useDetection } from '../context/DetectionContext';
import { useTheme } from '../context/ThemeContext';

const AnimalDetection = () => {
  const { isDarkMode } = useTheme();
  const { isActive, startAnalysis, stopAnalysis, activeVideo: contextActiveVideo, toggleAnalysis, setPortalNode } = useDetection();
  
  const [videos, setVideos] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); 
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef(null);

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
      await fetchData(); 
    } catch (error) {
      console.error("Upload Error Details:", error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
      setSelectedZoneId(""); 
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
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

  const themeClasses = {
      bg: isDarkMode ? 'bg-gray-950' : 'bg-gray-50',
      panel: isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-gray-100',
      card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
      text: isDarkMode ? 'text-white' : 'text-gray-900',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      highlight: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-50 text-green-600',
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex flex-col h-[calc(100vh-theme(spacing.16))] overflow-hidden transition-colors duration-500 ${themeClasses.bg}`}
    >
      {/* AI Intelligence Header */}
      <div className={`flex items-center justify-between px-8 py-5 border-b shadow-xl shrink-0 transition-all duration-500 z-10 ${themeClasses.panel}`}>
        <div className="flex items-center gap-6">
            <motion.div 
                animate={{ rotate: isActive ? 360 : 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600'}`}
            >
                <Cpu size={28} />
            </motion.div>
            <div>
                 <h1 className={`text-2xl font-black tracking-tighter ${themeClasses.text}`}>AI TELEMETRY SUITE</h1>
                 <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${isActive ? 'text-emerald-500' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        Neural Engine: {isActive ? 'Operational' : 'Standby'}
                    </span>
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-8">
            <div className={`hidden lg:flex items-center gap-6 px-6 py-2 rounded-2xl border transition-colors duration-500 ${isDarkMode ? 'bg-black/20 border-gray-800' : 'bg-gray-100/50 border-gray-200'}`}>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Selected Unit</span>
                    <span className={`text-xs font-bold truncate max-w-[120px] ${themeClasses.text}`}>
                        {selectedVideo?.title || 'None'}
                    </span>
                </div>
                <div className="w-px h-8 bg-gray-800/20"></div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Zone</span>
                    <span className={`text-xs font-bold ${themeClasses.text}`}>
                        {selectedVideo?.zoneName || 'Global'}
                    </span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSystemToggle}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                    isActive 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                }`}
            >
                {isActive ? <Zap size={18} className="animate-pulse" /> : <Power size={18} />}
                {isActive ? "INITIATE SHUTDOWN" : "EXECUTE ANALYSIS"}
            </motion.button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Main Tactical View */}
         <div className="flex-1 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-transparent to-black/5">
             <div 
                id="detection-video-portal" 
                ref={(node) => {
                    if (node) setPortalNode(node);
                    else setPortalNode(null); 
                }}
                className={`w-full max-w-5xl aspect-video rounded-[2.5rem] border-4 transition-all duration-700 relative overflow-hidden flex items-center justify-center shadow-2xl ${
                    isActive 
                    ? (isDarkMode ? 'border-emerald-500/30 bg-black' : 'border-emerald-500/10 bg-black') 
                    : (isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-200 shadow-inner')
                }`}>
                 
                 <AnimatePresence mode="wait">
                    {!isActive && !selectedVideo && (
                        <motion.div 
                            key="no-video"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="text-center"
                        >
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white shadow-lg'}`}>
                                <VideoIcon size={40} className="text-gray-400 opacity-20" />
                            </div>
                            <h3 className={`text-xl font-black tracking-tight mb-2 ${themeClasses.text}`}>TACTICAL FEED OFFLINE</h3>
                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Link data packet from laboratory to initiate stream</p>
                        </motion.div>
                    )}

                    {!isActive && selectedVideo && (
                        <motion.div 
                            key={`preview-${selectedVideo._id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full h-full group"
                        >
                            <video
                                key={selectedVideo._id}
                                src={selectedVideo.fileUrl?.startsWith('/uploads') ? `http://localhost:5000${selectedVideo.fileUrl}` : selectedVideo.fileUrl}
                                className="w-full h-full object-contain"
                                controls
                                playsInline
                                crossOrigin="anonymous"
                            />
                            
                            <div className="absolute top-6 left-6 flex items-center gap-3">
                                <div className="bg-emerald-500/90 text-white px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2">
                                    <Target size={14} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Preview Protocol</span>
                                </div>
                                <div className="bg-black/40 text-white px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedVideo.zoneName || 'Sector Unknown'}</span>
                                </div>
                            </div>

                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">{selectedVideo.title}</h3>
                                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">{new Date(selectedVideo.createdAt).toLocaleTimeString()} Operational Log</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/10"></div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                 </AnimatePresence>
             </div>
             
             {/* Tactical Metrics Overlay (Visual Only) */}
             {isActive && (
                <div className="absolute top-12 left-12 right-12 bottom-12 pointer-events-none opacity-20 border border-emerald-500/20 rounded-[3rem]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-2xl"></div>
                </div>
             )}
         </div>

         {/* Right Sidebar - Analytics Archive */}
         <div className={`w-[360px] border-l flex flex-col transition-all duration-500 shadow-2xl z-10 ${themeClasses.panel}`}>
             <div className="p-8 border-b border-gray-800/10">
                 <div className="flex items-center justify-between mb-8">
                     <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2.5 ${themeClasses.muted}`}>
                        <Database size={16} /> DATA ARCHIVE
                     </h3>
                     <div className={`px-3 py-1 rounded-lg text-[9px] font-black ${isDarkMode ? 'bg-gray-800 text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                        {videos.length} UNITS
                     </div>
                 </div>

                 <div className="flex gap-4">
                     <select 
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className={`flex-1 text-[10px] font-black uppercase tracking-widest p-3 px-4 rounded-2xl border outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-emerald-500'}`}
                     >
                        <option value="">Filter Sector</option>
                        {zones.map(z => (
                            <option key={z._id} value={z._id}>{z.zoneName}</option>
                        ))}
                     </select>
                     
                     <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                             if(!selectedZoneId) {
                                 alert("Please select a sector identifier first");
                                 return;
                             }
                             fileInputRef.current?.click();
                        }}
                        disabled={uploading}
                        className={`p-3 px-4 rounded-2xl transition-all shadow-lg ${uploading || !selectedZoneId ? 'opacity-30 grayscale cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'}`}
                     >
                         {uploading ? <Activity className="animate-spin" size={18} /> : <Upload size={18} />}
                     </motion.button>
                 </div>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleUpload}
                 />
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                 {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}></div>
                    ))
                 ) : videos.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                         <div className={`p-6 rounded-3xl border border-dashed mb-4 opacity-20 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                            <VideoIcon size={32} className={themeClasses.muted} />
                         </div>
                         <h4 className={`text-sm font-black uppercase tracking-widest mb-2 ${themeClasses.text}`}>Vault Offline</h4>
                         <p className={`text-[10px] font-bold leading-relaxed ${themeClasses.muted}`}>Upload tactical recordings to populate the biometric repository</p>
                     </div>
                 ) : (
                    <div className="space-y-4 pb-10">
                        {videos.map((video, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={video._id} 
                                onClick={() => {
                                    setSelectedVideo(video);
                                    if (isActive) startAnalysis(video);
                                }}
                                className={`group p-4 rounded-2xl cursor-pointer transition-all border shadow-sm ${
                                    selectedVideo?._id === video._id 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                                    : `hover:shadow-lg ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800' : 'bg-white border-gray-100 hover:border-emerald-200'}`
                                }`}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedVideo?._id === video._id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-950/20 text-gray-400'}`}>
                                        <Play size={20} fill={selectedVideo?._id === video._id ? "currentColor" : "none"} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className={`text-sm font-black truncate tracking-tight ${selectedVideo?._id === video._id ? 'text-emerald-500' : themeClasses.text}`}>
                                            {video.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest truncate ${themeClasses.muted}`}>
                                                {video.zoneName || 'Global'}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-gray-500/30"></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted}`}>
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={(e) => handleDelete(e, video._id)}
                                        className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                 )}
             </div>
         </div>
      </div>
    </motion.div>
  );
};

export default AnimalDetection;