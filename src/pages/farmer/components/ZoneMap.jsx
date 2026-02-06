import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Undo2, Search, X, Loader2 } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});


const LocationMarker = ({ points, setPoints, isEditing, mode }) => {
    useMapEvents({
        click(e) {
            if (isEditing) {
                if (mode === 'point') {
                    setPoints([e.latlng]);
                } else {
                    setPoints([...points, e.latlng]);
                }
            }
        },
    });

    return null;
};

const MapController = ({ points, searchResult }) => {
    const map = useMap();
    
    useEffect(() => {
        if (searchResult) {
            map.flyTo([searchResult.lat, searchResult.lon], 16, { animate: true, duration: 1.5 });
        }
    }, [searchResult, map]);

    useEffect(() => {
        if (points.length > 0 && !searchResult) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [points, map]); // Removed searchResult from dependency to prevent fighting flyTo
    
    return null;
};

const ZoneMap = ({ 
    points = [], 
    setPoints, 
    isEditing = false, 
    existingZones = [], 
    height = "400px",
    mode = "polygon" // 'polygon' or 'point'
}) => {
    const defaultCenter = [13.0827, 80.2707]; // Chennai
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState(null);

    const handleUndo = useCallback(() => {
        if (points.length > 0) {
            setPoints(points.slice(0, -1));
        }
    }, [points, setPoints]);

    const performSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                setSearchResult({
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon)
                });
            } else {
                alert('Location not found. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching for location. Please check your connection.');
        } finally {
            setIsSearching(false);
        }
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            performSearch();
        }
    };

    const handleSearchClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        performSearch();
    };

    const handlePointRemove = (index) => {
        if (!isEditing) return;
        const newPoints = [...points];
        newPoints.splice(index, 1);
        setPoints(newPoints);
    };

    return (
        <div className="flex flex-col gap-3">
            {isEditing && (
                <div className="flex flex-col md:flex-row gap-2">
                    {/* Search Bar - Replaced <form> with <div> to prevent nesting issues */}
                    <div className="flex-1 relative">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search place, village or city..."
                            className="w-full pl-10 pr-12 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm shadow-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <button 
                            type="button" 
                            onClick={handleSearchClick}
                            disabled={isSearching}
                            className="absolute right-2 top-1.5 bg-green-600 text-white p-1 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center min-w-[32px]"
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </button>
                    </div>

                    {/* Undo Button */}
                    <button 
                        type="button"
                        onClick={handleUndo}
                        disabled={points.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed shadow-sm transition"
                    >
                        <Undo2 size={18} />
                        Undo Last Point
                    </button>
                </div>
            )}

            <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <MapContainer 
                    center={defaultCenter} 
                    zoom={13} 
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Existing Zones */}
                    {existingZones.map((zone) => (
                        <Polygon 
                            key={zone._id}
                            positions={zone.coordinates}
                            pathOptions={{ 
                                color: zone.riskLevel === 'critical' ? '#dc2626' : zone.riskLevel === 'high' ? '#ea580c' : zone.riskLevel === 'medium' ? '#2563eb' : '#16a34a',
                                fillOpacity: 0.2
                            }}
                        />
                    ))}

                    {/* Current Selection */}
                    {points.length > 0 && (
                        <>
                            {mode === 'polygon' && (
                                <Polygon 
                                    positions={points} 
                                    pathOptions={{ color: '#2563eb', dashArray: '5, 10' }} 
                                />
                            )}
                            
                            {/* Render markers for polygon vertices OR the single point */}
                            {points.map((point, index) => (
                                <Marker 
                                    key={index} 
                                    position={point}
                                    eventHandlers={{
                                        click: () => handlePointRemove(index),
                                    }}
                                />
                            ))}
                        </>
                    )}

                    <LocationMarker points={points} setPoints={setPoints} isEditing={isEditing} mode={mode} />
                    <MapController points={points} searchResult={searchResult} />
                </MapContainer>
                
                {isEditing && (
                    <div className="bg-gray-50 p-2 text-[10px] text-gray-500 flex justify-between items-center border-t border-gray-200">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                             <span>
                                {mode === 'point' 
                                    ? 'Click map to set location.' 
                                    : `${points.length} points selected. Minimum 3 required.`}
                             </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                setPoints([]);
                                setSearchResult(null);
                                setSearchQuery('');
                            }}
                            className="text-red-500 font-bold hover:underline ml-4"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZoneMap;