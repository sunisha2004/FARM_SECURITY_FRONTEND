import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDetection } from '../context/DetectionContext';
import CameraFeed from './CameraFeed';
import { useLocation } from 'react-router-dom';

const GlobalSurveillance = () => {
    const { isActive, activeVideo, portalNode } = useDetection();
    const location = useLocation();

    // If no video is active, nothing to render
    if (!activeVideo) return null;

    const isDetectionPage = location.pathname === '/farmer/detection';
    
    // Construct URL
    const getFullUrl = (url) => url?.startsWith('/uploads') ? `http://localhost:5000${url}` : url;

    const renderContent = () => (
         <CameraFeed 
            key={activeVideo._id}
            id={activeVideo._id}
            videoUrl={getFullUrl(activeVideo.fileUrl)}
            globalDetecting={isActive}
            zoneName={activeVideo.zoneName}
         />
    );

    // If on detection page and portal node provided, Portal it.
    if (isDetectionPage && portalNode) {
        return createPortal(renderContent(), portalNode);
    }

    // Otherwise, render hidden in the background (Main App Flow)
    return (
        <div 
            style={{ 
                position: 'fixed',
                left: '-9999px', // Move off-screen
                visibility: isActive ? 'visible' : 'hidden' // Keep logic running if active
            }}
        >
             {renderContent()}
        </div>
    );
};

export default GlobalSurveillance;
