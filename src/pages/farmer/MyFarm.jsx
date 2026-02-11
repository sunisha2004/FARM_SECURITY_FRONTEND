import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, MapPin, Tractor, Loader2, Camera, ShieldCheck, 
    Edit2, X, CheckCircle, Info, Map as MapIcon, 
    Navigation, Activity, Shield, Hash, Calendar, ArrowRight
} from 'lucide-react';
import ZoneMap from './components/ZoneMap';
import { useTheme } from '../../context/ThemeContext';

const MyFarm = () => {
    const { isDarkMode } = useTheme();
    const [farm, setFarm] = useState({ farmName: '', location: '', coordinates: null });
    const [points, setPoints] = useState([]);
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
                setExists(false);
                setIsEditing(true);
            }
        } catch (error) {
           setIsEditing(true);
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
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm',
        panel: isDarkMode ? 'bg-gray-950/40 border-gray-800' : 'bg-gray-50 border-gray-100',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        input: isDarkMode ? 'bg-gray-900 border-gray-800 text-white focus:ring-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:ring-green-500',
    };

    if(loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-6"></div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeClasses.muted}`}>Syncing Agricultural Ledger...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-24"
        >
            {/* Hero Cover */}
            <div className={`h-64 rounded-[3rem] shadow-2xl relative overflow-hidden group mb-12 border ${isDarkMode ? 'border-emerald-500/20 shadow-emerald-900/10' : 'border-green-100'}`}>
                {/* Dynamic Background */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${isDarkMode ? 'opacity-40' : 'opacity-100'}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-700 ${isDarkMode ? 'from-emerald-900 via-gray-900 to-black' : 'from-green-600 via-emerald-500 to-teal-400'}`}></div>
                </div>
                
                {/* Graphical Overlays */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                
                <div className="absolute bottom-8 left-10 flex items-center gap-8">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className={`w-32 h-32 rounded-[2.5rem] shadow-2xl flex items-center justify-center border-8 transform ${isDarkMode ? 'bg-gray-900 border-gray-800 text-emerald-500 shadow-black' : 'bg-white border-white text-green-600 shadow-green-950/10'}`}
                    >
                        <Tractor size={48} className="drop-shadow-lg" />
                    </motion.div>
                    <div className="text-white">
                        <motion.h1 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl font-black shadow-black drop-shadow-2xl tracking-tighter uppercase"
                        >
                            {farm.farmName || 'UNIDENTIFIED_SECTOR'}
                        </motion.h1>
                        <motion.p 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-2 mt-2 text-white/80 text-xs font-black uppercase tracking-[0.2em]"
                        >
                            <MapPin size={14} className="text-emerald-300" /> {farm.location || 'GLOBAL_COORDINATES_UNDEFINED'}
                        </motion.p>
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute top-8 right-8 bg-black/40 hover:bg-black/60 backdrop-blur-2xl border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl"
                >
                    {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                    {isEditing ? 'TERMINATE_PROTOCOL' : 'MODIFY_CORE_DATA'}
                </motion.button>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4">
                
                <AnimatePresence>
                    {msg && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className={`mb-10 p-6 rounded-[2rem] border-2 shadow-2xl flex items-center justify-between gap-4 ${msg.includes('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${msg.includes('Error') ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                                    {msg.includes('Error') ? <X size={20} /> : <CheckCircle size={20} />}
                                </div>
                                <p className="text-sm font-black uppercase tracking-wider">{msg}</p>
                            </div>
                            <button onClick={() => setMsg(null)} className="opacity-50 hover:opacity-100 transition-opacity">
                                <X size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Profiler */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-8"
                    >
                         <div className={`rounded-[2.5rem] border shadow-xl overflow-hidden ${themeClasses.card}`}>
                             <div className={`px-10 py-6 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
                                 <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 ${themeClasses.text}`}>
                                    <Activity className="text-emerald-500" size={18} />
                                    STRATEGIC DATA_SET
                                 </h3>
                                 {!isEditing && <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-widest">ENCRYPTED_ONLINE</span>}
                             </div>
                             
                             <div className="p-10">
                                 {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>ASSET_IDENTIFIER</label>
                                                <input 
                                                    type="text" 
                                                    value={farm.farmName}
                                                    onChange={(e) => setFarm({...farm, farmName: e.target.value})}
                                                    className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${themeClasses.input}`}
                                                    placeholder="Enter strategic name..."
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>
                                                    GEOSPATIAL_VECTOR {hasZone && <span className="text-emerald-500 normal-case">(SYNCED)</span>}
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={hasZone ? zoneLocation : "AWAITING_ZONE_INITIALIZATION"}
                                                    readOnly
                                                    className={`w-full px-6 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                                                        hasZone 
                                                            ? isDarkMode ? 'bg-gray-800/50 border-gray-800 text-gray-400 opacity-60' : 'bg-gray-100 text-gray-700' 
                                                            : 'bg-red-500/5 text-red-500 border-red-500/20 cursor-not-allowed italic'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Map Integration */}
                                        <div>
                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>TACTICAL_POINT_DEFINITION</label>
                                            <div className={`rounded-[2rem] overflow-hidden border-2 p-2 ${isDarkMode ? 'border-gray-800 bg-gray-950/50' : 'border-gray-100 bg-gray-50'}`}>
                                                <div className="rounded-2xl overflow-hidden border border-emerald-500/20 relative">
                                                    <ZoneMap 
                                                        points={points} 
                                                        setPoints={async (pts) => {
                                                            setPoints(pts);
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
                                                        height="350px"
                                                    />
                                                </div>
                                            </div>
                                            <p className={`text-[9px] font-black uppercase tracking-widest mt-4 flex items-center gap-2 ${themeClasses.muted}`}>
                                                <Navigation size={12} className="text-emerald-500" /> 
                                                Interact with coordinates to redefine terminal anchor point.
                                            </p>
                                        </div>

                                        <div className="pt-6 flex justify-end gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                ABORT
                                            </button>
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit" 
                                                disabled={saving}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest"
                                            >
                                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                                COMMIT_CHANGES
                                            </motion.button>
                                        </div>
                                    </form>
                                 ) : (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className={`p-8 rounded-[2rem] border transition-all duration-500 group ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/30' : 'bg-gray-50 border-gray-100 hover:border-green-200'}`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                                        <Hash size={20} />
                                                    </div>
                                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>AUTHORITY</label>
                                                </div>
                                                <p className={`font-black text-2xl tracking-tighter ${themeClasses.text}`}>PRIMARY_USER</p>
                                            </div>
                                            <div className={`p-8 rounded-[2rem] border transition-all duration-500 group ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/30' : 'bg-gray-50 border-gray-100 hover:border-green-200'}`}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>ORIGIN_DATE</label>
                                                </div>
                                                <p className={`font-black text-2xl tracking-tighter ${themeClasses.text}`}>
                                                    {new Date(farm.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className={`p-10 rounded-[2.5rem] border flex items-start gap-8 relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-green-50/50 border-green-100'}`}>
                                            <div className={`p-5 rounded-3xl shadow-2xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600'}`}>
                                                <ShieldCheck size={32} />
                                            </div>
                                            <div className="relative z-10 flex-1">
                                                <h4 className={`text-xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-emerald-400' : 'text-green-900'}`}>INTEGRITY_PROTOCOL: SECURE</h4>
                                                <p className={`mt-2 text-sm font-medium leading-relaxed ${isDarkMode ? 'text-emerald-300/60' : 'text-green-700/70'}`}>
                                                    The agricultural profile is currently active and fully operational. Security parameters are within nominal ranges. 
                                                    Recommendation: Verify zone definitions regularly to maintain maximum coverage efficiency.
                                                </p>
                                                <button className="mt-6 flex items-center gap-2 group text-xs font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                                                    ACCESS INFRASTRUCTURE MANUAL <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                                </button>
                                            </div>
                                            <Shield className="absolute -bottom-10 -right-10 text-emerald-500/5 w-64 h-64 -rotate-12" />
                                        </div>
                                    </div>
                                 )}
                             </div>
                         </div>
                    </motion.div>

                    {/* Side Intelligence */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-10"
                    >
                        <div className={`rounded-[2.5rem] border shadow-xl p-10 ${themeClasses.card}`}>
                             <div className="flex items-center gap-4 mb-8">
                                <MapIcon className="text-emerald-500" size={24} />
                                <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${themeClasses.text}`}>OPERATIONAL_MAP</h3>
                             </div>
                             
                             <div className={`p-6 rounded-[2rem] border-2 shadow-2xl text-center flex flex-col items-center gap-4 transition-all duration-500 ${isDarkMode ? 'bg-gray-900/50 border-gray-800 hover:border-emerald-500/20' : 'bg-gray-50 border-gray-100'}`}>
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                                    <MapPin className="text-emerald-500" size={32} />
                                </div>
                                <h4 className={`text-sm font-black uppercase tracking-wider ${themeClasses.text}`}>{farm.location || 'PENDING_GEO_LOC'}</h4>
                                <p className={`text-[10px] font-medium leading-relaxed ${themeClasses.muted}`}>
                                    Coordinates are automatically derived from strategic zone initialization.
                                </p>
                             </div>

                             <div className="mt-8 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.muted}`}>SECTOR_ALPHA</span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">ACTIVE</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.muted}`}>SECTOR_BETA</span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">ACTIVE</span>
                                </div>
                             </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-600 to-green-800 rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
                             <div className="relative z-10">
                                 <h3 className="font-black text-2xl tracking-tighter uppercase mb-2">SYSTEM_SUPPORT</h3>
                                 <p className="text-white/70 text-sm font-medium mb-8 leading-relaxed">Access the tactical guide for optimizing camera positioning and surveillance efficiency.</p>
                                 <motion.button 
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-3 bg-white text-emerald-700 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-black/20"
                                >
                                    INITIALIZE_GUIDE <ArrowRight size={16} />
                                </motion.button>
                             </div>
                             <ShieldCheck className="absolute -bottom-10 -right-10 text-white/5 w-48 h-48 rotate-12 transition-transform duration-700 group-hover:scale-110" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default MyFarm;
