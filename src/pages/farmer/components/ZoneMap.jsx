import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Undo2, Search, X, Loader2, MapPin, Target, Trash2, ChevronRight } from 'lucide-react';
import L from 'leaflet';
import axios from 'axios';
import { useTheme } from '../../../context/ThemeContext';

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

const MapController = ({ points, searchResult, center }) => {
    const map = useMap();
    
    useEffect(() => {
        if (searchResult) {
            map.flyTo([searchResult.lat, searchResult.lon], 16, { animate: true, duration: 1.5 });
        }
    }, [searchResult, map]);

    useEffect(() => {
        if (center && center.lat && center.lng && !searchResult) {
             map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.5 });
        }
    }, [center, map, searchResult]);

    useEffect(() => {
        if (points.length > 0 && !searchResult) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [points, map]);
    
    return null;
};

const ZoneMap = ({ 
    points = [], 
    setPoints, 
    isEditing = false, 
    existingZones = [], 
    height = "400px",
    mode = "polygon", // 'polygon' or 'point'
    center = null 
}) => {
    const { isDarkMode } = useTheme();
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
                alert('Location not found.');
            }
        } catch (error) {
            console.error('Search error:', error);
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

    const handlePointRemove = (index) => {
        if (!isEditing) return;
        const newPoints = [...points];
        newPoints.splice(index, 1);
        setPoints(newPoints);
    };

    const themeClasses = {
        input: isDarkMode ? 'bg-gray-900 border-gray-800 text-white focus:ring-emerald-500 placeholder-gray-600' : 'bg-white border-gray-200 text-gray-900 focus:ring-green-500 placeholder-gray-400',
        btn: isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
        status: isDarkMode ? 'bg-gray-900/80 border-gray-800 text-gray-400' : 'bg-gray-50/80 border-gray-200 text-gray-600',
    };

    // Use standard colored tiles for both modes
    const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    return (
        <div className="flex flex-col gap-4">
            {isEditing && (
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="GEO_SEARCH: ENTER SECTOR COORDINATES OR ALIAS..."
                            className={`w-full pl-12 pr-14 py-4 rounded-2xl border outline-none font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${themeClasses.input}`}
                        />
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-gray-700 group-focus-within:text-emerald-500' : 'text-gray-300 group-focus-within:text-green-600'}`} size={18} />
                        <button 
                            type="button" 
                            onClick={performSearch}
                            disabled={isSearching}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-green-600 text-white hover:bg-green-700'} disabled:opacity-50`}
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={18} />}
                        </button>
                    </div>

                    <button 
                        type="button"
                        onClick={handleUndo}
                        disabled={points.length === 0}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 ${themeClasses.btn}`}
                    >
                        <Undo2 size={16} />
                        STEP_BACK
                    </button>
                </div>
            )}

            <div className={`relative overflow-hidden border-2 rounded-[2rem] shadow-2xl ${isDarkMode ? 'border-gray-800 shadow-emerald-950/20' : 'border-gray-100 shadow-gray-200/50'}`} style={{ height }}>
                <MapContainer 
                    center={defaultCenter} 
                    zoom={13} 
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', zIndex: 10 }}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url={tileUrl}
                    />
                    
                    {existingZones.map((zone) => (
                        <Polygon 
                            key={zone._id}
                            positions={zone.coordinates}
                            pathOptions={{ 
                                color: zone.riskLevel === 'critical' ? '#ef4444' : zone.riskLevel === 'high' ? '#f97316' : zone.riskLevel === 'medium' ? '#3b82f6' : '#10b981',
                                fillColor: zone.riskLevel === 'critical' ? '#ef4444' : zone.riskLevel === 'high' ? '#f97316' : zone.riskLevel === 'medium' ? '#3b82f6' : '#10b981',
                                fillOpacity: 0.1,
                                weight: 2
                            }}
                        />
                    ))}

                    {points.length > 0 && (
                        <>
                            {mode === 'polygon' && (
                                <Polygon 
                                    positions={points} 
                                    pathOptions={{ 
                                        color: isDarkMode ? '#10b981' : '#16a34a', 
                                        dashArray: '8, 8',
                                        weight: 2,
                                        fillOpacity: 0.2
                                    }} 
                                />
                            )}
                            
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
                    <MapController points={points} searchResult={searchResult} center={center} />
                </MapContainer>
                
                {isEditing && (
                    <div className={`absolute bottom-6 left-6 right-6 z-[1000] p-5 rounded-2xl border-2 backdrop-blur-md flex justify-between items-center transition-all ${themeClasses.status} shadow-2xl`}>
                        <div className="flex items-center gap-4">
                             <div className={`w-3 h-3 rounded-full animate-pulse ${isDarkMode ? 'bg-emerald-500' : 'bg-green-600'}`}></div>
                             <span className="font-black text-[10px] uppercase tracking-widest">
                                {mode === 'point' 
                                    ? 'AWAITING_COORDINATE_INPUT...' 
                                    : `${points.length} VECTORS ARRESTED [MIN 3 REQUIRED]`}
                             </span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                setPoints([]);
                                setSearchResult(null);
                                setSearchQuery('');
                            }}
                            className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={14} />
                            RESET_LATTICE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZoneMap;

