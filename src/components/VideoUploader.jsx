import React from 'react';
import { Upload } from 'lucide-react';

const VideoUploader = ({ onVideoUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      onVideoUpload(videoUrl, file); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors bg-white shadow-sm">
      <input
        type="file"
        accept="video/mp4, video/webm, video/ogg"
        onChange={handleFileChange}
        className="hidden"
        id="video-upload"
      />
      <label
        htmlFor="video-upload"
        className="cursor-pointer flex flex-col items-center gap-2"
      >
        <Upload className="w-10 h-10 text-gray-500 hover:text-green-500 transition-colors" />
        <span className="text-gray-600 font-medium">Click to upload a video</span>
        <span className="text-sm text-gray-400">(MP4, WebM)</span>
      </label>
    </div>
  );
};

export default VideoUploader;
