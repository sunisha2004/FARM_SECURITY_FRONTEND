import React, { createContext, useState, useContext, useRef } from 'react';

const DetectionContext = createContext();

export const useDetection = () => useContext(DetectionContext);

export const DetectionProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [portalNode, setPortalNode] = useState(null);
  
  // Toggle Analysis
  const toggleAnalysis = (video) => {
      if (isActive) {
          stopAnalysis();
      } else {
          if(video) startAnalysis(video);
      }
  };

  const startAnalysis = (video) => {
      setActiveVideo(video);
      setIsActive(true);
  };

  const stopAnalysis = () => {
      setIsActive(false);
      // activeVideo remains set to allow "Resume" if needed, or can clear it.
      // Keeping it allows GlobalSurveillance to know what to render if paused or just kept in memory.
  };

  return (
    <DetectionContext.Provider value={{ isActive, activeVideo, toggleAnalysis, startAnalysis, stopAnalysis, portalNode, setPortalNode }}>
      {children}
    </DetectionContext.Provider>
  );
};
