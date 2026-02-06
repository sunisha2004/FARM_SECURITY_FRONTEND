import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, MapPin, Tractor, Loader2, Camera, ShieldCheck, Edit2, X, CheckCircle, Info } from 'lucide-react';
import ZoneMap from './components/ZoneMap';
// import { useDetection } from '../../context/DetectionContext'; // Optional connection if needed later

const MyFarm = () => {
    const [farm, setFarm] = useState({ farmName: '', location: '', coordinates: null }); // Added coordinates
    const [points, setPoints] = useState([]); // For map points
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [msg, setMsg] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [zoneLocation, setZoneLocation] = useState(null);
    const [hasZone, setHasZone] = useState(false);

    useEffect(() => {
        fetchFarm();
        fetchZoneLocation();
    }, []);

    const fetchZoneLocation = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/farmer/zones/location', config);
            
            if (data.zoneLocationName) {
                setZoneLocation(data.zoneLocationName);
                setHasZone(true);
                // Auto-update farm state to reflect zone location
                setFarm(prev => ({...prev, location: data.zoneLocationName}));
            } else {
                setHasZone(false);
            }
        } catch (error) {
            console.error("Error fetching zone location", error);
        }
    };

    const fetchFarm = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/farmer/farm', config);
            if(data) {
                setFarm(data);
                if(data.coordinates) {
                   setPoints([data.coordinates]);
                }
                setExists(true);
            } else {
                // If simplified backend returns null instead of 404
                setExists(false);
                setIsEditing(true); // Force edit mode if no farm
            }
        } catch (error) {
           setIsEditing(true); // Auto edit if not found
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (exists) {
                await axios.put('http://localhost:5000/api/farmer/farm', farm, config);
                setMsg('Farm details updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/farmer/farm', farm, config);
                setExists(true);
                setMsg('Farm created successfully');
            }
            setIsEditing(false);
        } catch (error) {
             setMsg('Error saving farm details: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
            // Auto hide success msg after 3s
            setTimeout(() => setMsg(null), 3000);
        }
    };

    if(loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="animate-spin text-green-600 mb-2" />
        </div>
    );

    return (
        <div className="relative">
            {/* Hero Cover */}
            <div className="h-48 bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 rounded-2xl shadow-lg relative overflow-hidden group">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/ag-square.png')]"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                    <div className="w-24 h-24 bg-white rounded-xl shadow-2xl flex items-center justify-center border-4 border-green-50 transform translate-y-4">
                        <Tractor className="text-green-600 w-12 h-12" />
                    </div>
                    <div className="text-white pb-2">
                        <h1 className="text-3xl font-bold shadow-black drop-shadow-md tracking-tight">
                            {farm.farmName || 'Unregistered Farm'}
                        </h1>
                        <p className="flex items-center gap-2 text-green-100 opacity-90 text-sm font-medium">
                            <MapPin size={14} /> {farm.location || 'No location set'}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                >
                    {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'Cancel Edit' : 'Edit Details'}
                </button>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto mt-12 px-2">
                
                {msg && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-fade-in ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                        {msg.includes('Error') ? <X size={20} /> : <CheckCircle size={20} />}
                        {msg}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Details */}
                    <div className="md:col-span-2">
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                 <h3 className="font-bold text-gray-800">Farm Information</h3>
                                 {!isEditing && <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>}
                             </div>
                             
                             <div className="p-6">
                                 {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Farm Name</label>
                                            <input 
                                                type="text" 
                                                value={farm.farmName}
                                                onChange={(e) => setFarm({...farm, farmName: e.target.value})}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                                placeholder="e.g. Green Valley Ranch"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Location {hasZone && <span className="text-green-600 font-normal normal-case ml-1">(Synced with Zone)</span>}</label>
                                            <input 
                                                type="text" 
                                                value={hasZone ? zoneLocation : "Please create a zone first"}
                                                readOnly
                                                className={`w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all ${
                                                    hasZone 
                                                        ? 'bg-gray-100 text-gray-700 cursor-not-allowed' 
                                                        : 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed'
                                                }`}
                                            />
                                        </div>

                                        {/* Map Selection */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pin Location on Map</label>
                                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                                <ZoneMap 
                                                    points={points} 
                                                    setPoints={async (pts) => {
                                                        setPoints(pts);
                                                        // Auto-reverse geocode if a point is set
                                                        if (pts.length > 0) {
                                                            try {
                                                                const { lat, lng } = pts[0];
                                                                const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                                                                const address = geoRes.data.address;
                                                                const locationName = [
                                                                    address.village || address.town || address.city || address.suburb,
                                                                    address.state_district,
                                                                    address.state
                                                                ].filter(Boolean).join(', ');
                                                                
                                                                // Update both location text and coordinates in farm state
                                                                setFarm(prev => ({ 
                                                                    ...prev, 
                                                                    location: locationName,
                                                                    coordinates: { lat, lng }
                                                                }));
                                                            } catch (err) {
                                                                console.error("Geocoding error", err);
                                                            }
                                                        }
                                                    }}
                                                    isEditing={true}
                                                    mode="point"
                                                    height="300px"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Info size={12} /> Click on the map to pin your farm's exact location.
                                            </p>
                                        </div>
                                        <div className="pt-2 flex justify-end gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={saving}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-green-600/20 transition flex items-center gap-2"
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                 ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition group">
                                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Owner</label>
                                                <p className="font-semibold text-gray-800 text-lg group-hover:text-green-700 transition">You</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition group">
                                                <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Established</label>
                                                <p className="font-semibold text-gray-800 text-lg group-hover:text-green-700 transition">{new Date(farm.createdAt || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-4">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900">Security Status: Good</h4>
                                                <p className="text-sm text-blue-700/80 mt-1">
                                                    Your farm profile is active. Configure more zones to enhance coverage.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                 )}
                             </div>
                         </div>
                    </div>
                    
                    {/* Side Panel: Cameras or Quick Stats */}
                    {/* <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Camera size={18} className="text-gray-400" /> Connected Feeds
                            </h3>
                            {farm.cameraFeeds && farm.cameraFeeds.length > 0 ? (
                                <ul className="space-y-3">
                                    {farm.cameraFeeds.map((feed, i) => (
                                        <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Camera {i+1}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Camera className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm text-gray-500 font-medium">No cameras connected</p>
                                    <p className="text-xs text-gray-400 mt-1">Add them in Detection Settings</p>
                                </div>
                            )}
                        </div>

                         <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                             <div className="relative z-10">
                                 <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                                 <p className="text-green-100 text-sm mb-4">Check our guide on how to position cameras for maximum coverage.</p>
                                 <button className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-50 transition">View Guide</button>
                             </div>
                             <ShieldCheck className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
                         </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default MyFarm;
