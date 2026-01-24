import React, { useState, useEffect, useRef } from 'react';
import CameraFeed from '../components/CameraFeed';
import { ShieldCheck, Power, Activity, Upload, Play, MoreVertical, Trash2, Video as VideoIcon, Plus } from 'lucide-react';
import axios from 'axios';

const AnimalDetection = () => {
  const [globalSystemActive, setGlobalSystemActive] = useState(false);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // For uploading
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) return;

      const { data } = await axios.get('http://localhost:5000/api/videos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(data);
      
      // Select the first video by default if available and none selected
      if (data.length > 0 && !selectedVideo) {
         setSelectedVideo(data[0]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', file.name.split('.')[0]); // Default title

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.post('http://localhost:5000/api/videos', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchVideos(); // Refresh list
    } catch (error) {
      console.error("Upload Error Details:", error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      // Reset input
      if(fileInputRef.current) fileInputRef.current.value = '';
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
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleSystemToggle = () => {
    setGlobalSystemActive(prev => !prev);
  };

  // Construct full URL
  const getFullUrl = (url) => url?.startsWith('/uploads') ? `http://localhost:5000${url}` : url;

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
                <Activity className={`w-4 h-4 ${globalSystemActive ? 'text-green-500 animate-pulse' : 'text-gray-600'}`} />
                <span className="font-mono text-sm tracking-wider">
                    ANALYSIS: <span className={globalSystemActive ? "text-green-500" : "text-gray-500"}>
                        {globalSystemActive ? "ACTIVE" : "IDLE"}
                    </span>
                </span>
            </div>

            <button
                onClick={handleSystemToggle}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
                    globalSystemActive 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20" 
                    : "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20"
                }`}
            >
                <Power size={18} />
                {globalSystemActive ? "STOP ANALYSIS" : "RUN ANALYSIS"}
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Main View - Active Video */}
         <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 relative">
             {selectedVideo ? (
                 <div className="w-full max-w-5xl aspect-video bg-black rounded-lg border border-gray-800 shadow-2xl relative overflow-hidden">
                      {/* Pass the fully constructed URL to CameraFeed. 
                          CameraFeed will handle the detection logic using this URL as src.
                      */}
                      <CameraFeed 
                          id={selectedVideo._id} 
                          videoUrl={getFullUrl(selectedVideo.fileUrl)}
                          globalDetecting={globalSystemActive} 
                      />
                 </div>
             ) : (
                 <div className="text-center text-gray-500">
                     <VideoIcon size={64} className="mx-auto mb-4 opacity-20" />
                     <h3 className="text-xl font-mono">NO VIDEO SELECTED</h3>
                     <p>Select a video from the library to begin analysis</p>
                 </div>
             )}
         </div>

         {/* Sidebar - Video Library */}
         <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
             <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                 <h3 className="font-bold text-gray-300 flex items-center gap-2">
                     <VideoIcon size={18} /> LIBRARY
                 </h3>
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                 >
                     {uploading ? <Activity className="animate-spin" size={18} /> : <Plus size={18} />}
                 </button>
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
                            onClick={() => setSelectedVideo(video)}
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
