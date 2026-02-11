import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Map, Trash2, Edit2, AlertTriangle, X, 
    Settings2, ShieldCheck, Info, Loader2, MapPin, 
    Activity, Shield, Target, Navigation, Layers, 
    ArrowRight, ChevronRight, Zap
} from 'lucide-react';
import axios from 'axios';
import zoneService from '../../services/zoneService';
import ZoneMap from './components/ZoneMap';
import { useTheme } from '../../context/ThemeContext';

const MyZones = () => {
    const { isDarkMode } = useTheme();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab ] = useState('basic');
    const [formData, setFormData] = useState({
        zoneName: '',
        description: '',
        riskLevel: 'low',
        category: 'other',
        coordinates: [],
        thresholds: {
            animalCount: 1,
            durationMinutes: 5,
            motionIntensity: 50
        },
        securityRules: {
            alertLevel: 'warning',
            notificationType: ['app'],
            allowedAnimals: []
        }
    });
    const [editingId, setEditingId] = useState(null);
    const [farmCoordinates, setFarmCoordinates] = useState(null);

    useEffect(() => {
        fetchZones();
        fetchFarmCoordinates();
    }, []);

    const fetchFarmCoordinates = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/farmer/farm', config);
            if (data && data.coordinates) {
                setFarmCoordinates(data.coordinates);
            }
        } catch (error) {
            console.error("Error fetching farm coordinates", error);
        }
    };

    const fetchZones = async () => {
        try {
            const data = await zoneService.getZones();
            if (Array.isArray(data)) {
                setZones(data);
            } else {
                setZones([]);
            }
        } catch (error) {
            console.error("Error fetching zones", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.coordinates.length < 3) {
            alert("Please select at least 3 points on the map to define the zone boundary.");
            setActiveTab('boundary');
            return;
        }

        try {
            const latSum = formData.coordinates.reduce((sum, p) => sum + p.lat, 0);
            const lngSum = formData.coordinates.reduce((sum, p) => sum + p.lng, 0);
            const center = {
                lat: latSum / formData.coordinates.length,
                lng: lngSum / formData.coordinates.length
            };

            let locationName = '';
            try {
                const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
                const address = geoRes.data.address;
                locationName = [
                    address.village || address.town || address.city || address.suburb,
                    address.state_district,
                    address.state
                ].filter(Boolean).join(', ');
            } catch (geoError) {
                console.error("Geocoding failed", geoError);
                locationName = "Unknown Location";
            }

            const payload = {
                ...formData,
                center,
                locationName
            };

            if (editingId) {
                await zoneService.updateZone(editingId, payload);
            } else {
                await zoneService.createZone(payload);
            }
            
            handleCloseForm();
            fetchZones();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed. Please try again.';
            alert(message);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setActiveTab('basic');
        setFormData({
            zoneName: '',
            description: '',
            riskLevel: 'low',
            category: 'other',
            coordinates: [],
            thresholds: { animalCount: 1, durationMinutes: 5, motionIntensity: 50 },
            securityRules: { alertLevel: 'warning', notificationType: ['app'], allowedAnimals: [] }
        });
    };

    const handleEdit = (zone) => {
        setFormData({
            zoneName: zone.zoneName,
            description: zone.description || '',
            riskLevel: zone.riskLevel || 'low',
            category: zone.category || 'other',
            coordinates: zone.coordinates || [],
            thresholds: zone.thresholds || { animalCount: 1, durationMinutes: 5, motionIntensity: 50 },
            securityRules: zone.securityRules || { alertLevel: 'warning', notificationType: ['app'], allowedAnimals: [] }
        });
        setEditingId(zone._id);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to terminate this operational sector?')) {
            try {
                await zoneService.deleteZone(id);
                fetchZones();
            } catch (error) {
                alert('Failed to delete zone');
            }
        }
    };

    const getRiskStyles = (level) => {
        switch(level) {
            case 'critical': return isDarkMode ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-red-50 text-red-700 border-red-100';
            case 'high': return isDarkMode ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-orange-50 text-orange-700 border-orange-100';
            case 'medium': return isDarkMode ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-100';
            default: return isDarkMode ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-green-50 text-green-700 border-green-100';
        }
    };

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm',
        panel: isDarkMode ? 'bg-gray-950/40 border-gray-800' : 'bg-gray-50 border-gray-100',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        input: isDarkMode ? 'bg-gray-950 border-gray-800 text-white focus:ring-emerald-500' : 'bg-white border-gray-200 text-gray-900 focus:ring-green-500',
        btnSecondary: isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-[2rem] border-4 border-emerald-500 border-t-transparent animate-spin mb-6"></div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeClasses.muted}`}>Initializing Sector Grid...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className={`text-4xl font-black tracking-tighter flex items-center gap-4 ${themeClasses.text}`}>
                        <Target className="text-emerald-500" size={40} />
                        ZONE ARCHITECTURE
                    </h1>
                    <p className={`text-sm font-medium mt-2 max-w-lg ${themeClasses.muted}`}>Define and configure tactical boundaries for autonomous surveillance and threat neutralization protocols.</p>
                </div>
                {!isFormOpen && (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
                    >
                        <Plus size={18} />
                        ESTABLISH NEW SECTOR
                    </motion.button>
                )}
            </div>

            {/* Create/Edit Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`mb-12 rounded-[3rem] border-2 shadow-2xl overflow-hidden relative ${themeClasses.card} ${isDarkMode ? 'border-emerald-500/20 shadow-emerald-900/10' : 'border-emerald-500/10'}`}
                    >
                        <div className={`p-10 border-b flex justify-between items-center ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
                            <div>
                                <h2 className={`text-xl font-black uppercase tracking-tighter ${themeClasses.text}`}>
                                    {editingId ? 'PROTOCOL_MODIFICATION' : 'SECTOR_INITIALIZATION'}
                                </h2>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${themeClasses.muted}`}>
                                    Configure core parameters for tactical surveillance.
                                </p>
                            </div>
                            <button onClick={handleCloseForm} className={`${themeClasses.muted} hover:text-red-500 transition-colors`}>
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row">
                            {/* Tabs Sidebar */}
                            <div className={`lg:w-80 p-8 space-y-3 ${isDarkMode ? 'bg-gray-950/50 border-r border-gray-800' : 'bg-gray-50/30 border-r border-gray-100'}`}>
                                {[
                                    { id: 'basic', label: 'BASIC_INTELLIGENCE', icon: Info },
                                    { id: 'boundary', label: 'GEO_BOUNDARIES', icon: Map },
                                    { id: 'thresholds', label: 'THREAT_THRESHOLDS', icon: Activity },
                                    { id: 'rules', label: 'SECURITY_LOGIC', icon: ShieldCheck }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : `${themeClasses.muted} hover:bg-emerald-500/10 hover:text-emerald-500`}`}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                        {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 p-10">
                                <form onSubmit={handleSubmit}>
                                    <div className="min-h-[400px]">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'basic' && (
                                                <motion.div 
                                                    key="basic"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-8"
                                                >
                                                    <div>
                                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>SECTOR_DESIGNATION</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.zoneName}
                                                            onChange={(e) => setFormData({...formData, zoneName: e.target.value})}
                                                            className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold text-sm ${themeClasses.input}`}
                                                            placeholder="e.g. ALPHA_GATE_01"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div>
                                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>CLASSIFICATION</label>
                                                            <select
                                                                value={formData.category}
                                                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                                className={`w-full px-6 py-4 rounded-2xl border outline-none font-black text-[10px] uppercase tracking-widest appearance-none ${themeClasses.input}`}
                                                            >
                                                                <option value="crop_area">BIO_CULTIVATION</option>
                                                                <option value="storage_area">ASSET_STAGING</option>
                                                                <option value="livestock_area">FAUNA_ENCLOSURE</option>
                                                                <option value="high_risk_area">HIGH_THREAT_SECTOR</option>
                                                                <option value="other">GENERAL_UTILITY</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>THREAT_PRIORITY</label>
                                                            <select
                                                                value={formData.riskLevel}
                                                                onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                                                                className={`w-full px-6 py-4 rounded-2xl border outline-none font-black text-[10px] uppercase tracking-widest appearance-none ${themeClasses.input}`}
                                                            >
                                                                <option value="low">PRIORITY_04 (NOMINAL)</option>
                                                                <option value="medium">PRIORITY_03 (ENHANCED)</option>
                                                                <option value="high">PRIORITY_02 (RESTRICTED)</option>
                                                                <option value="critical">PRIORITY_01 (CRITICAL)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>OPERATIONAL_DESCRIPTION</label>
                                                        <textarea 
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                            className={`w-full px-6 py-4 rounded-2xl border outline-none font-medium text-sm ${themeClasses.input}`}
                                                            rows="4"
                                                            placeholder="Define strategic relevance and concerns..."
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'boundary' && (
                                                <motion.div 
                                                    key="boundary"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-6"
                                                >
                                                    <div className={`p-6 rounded-[2rem] border-2 flex gap-4 items-start ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                                        <Navigation size={20} className="mt-1 shrink-0" />
                                                        <p className="text-xs font-bold leading-relaxed">
                                                            GEO_MAPPING: Anchor at least 3 orbital tags to establish a valid sector lattice. Points must enclose a logical perimeter.
                                                        </p>
                                                    </div>
                                                    <div className={`rounded-[2rem] overflow-hidden border-4 p-2 ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'}`}>
                                                        <div className="rounded-2xl overflow-hidden border border-emerald-500/30">
                                                            <ZoneMap 
                                                                points={formData.coordinates} 
                                                                setPoints={(pts) => setFormData({...formData, coordinates: pts})}
                                                                isEditing={true}
                                                                existingZones={zones.filter(z => z._id !== editingId)}
                                                                center={farmCoordinates} 
                                                                height="400px"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'thresholds' && (
                                                <motion.div 
                                                    key="thresholds"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-10"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div>
                                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>MIN_ENTITY_DETECTION</label>
                                                            <div className="relative group">
                                                                <input 
                                                                    type="number" 
                                                                    min="1"
                                                                    value={formData.thresholds.animalCount}
                                                                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, animalCount: parseInt(e.target.value)}})}
                                                                    className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold text-sm text-center ${themeClasses.input}`}
                                                                />
                                                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${themeClasses.muted}`}>PERSISTENCE_LIMIT (MIN)</label>
                                                            <div className="relative group">
                                                                <input 
                                                                    type="number" 
                                                                    min="1"
                                                                    value={formData.thresholds.durationMinutes}
                                                                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, durationMinutes: parseInt(e.target.value)}})}
                                                                    className={`w-full px-6 py-4 rounded-2xl border outline-none font-bold text-sm text-center ${themeClasses.input}`}
                                                                />
                                                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <div className="flex justify-between items-center mb-6">
                                                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>SENSOR_SENSITIVITY</label>
                                                                <span className="text-emerald-500 font-black text-xl tracking-tighter">{formData.thresholds.motionIntensity}%</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="0"
                                                                max="100"
                                                                value={formData.thresholds.motionIntensity}
                                                                onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, motionIntensity: parseInt(e.target.value)}})}
                                                                className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                            />
                                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest mt-4 opacity-50">
                                                                <span>MIN_RESPONSE</span>
                                                                <span>MAX_RESPONSE</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {activeTab === 'rules' && (
                                                <motion.div 
                                                    key="rules"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="space-y-10"
                                                >
                                                    <div>
                                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${themeClasses.muted}`}>ALERT_ESCALATION</label>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { id: 'info', label: 'TICKET_INFO', color: 'text-blue-500' },
                                                                { id: 'warning', label: 'WARNING_STATE', color: 'text-yellow-500' },
                                                                { id: 'critical', label: 'CRITICAL_ALERT', color: 'text-red-500' }
                                                            ].map(level => (
                                                                <button
                                                                    key={level.id}
                                                                    type="button"
                                                                    onClick={() => setFormData({...formData, securityRules: {...formData.securityRules, alertLevel: level.id}})}
                                                                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${formData.securityRules.alertLevel === level.id ? `border-emerald-500 bg-emerald-500/10 ${level.color}` : `border-transparent ${themeClasses.panel} ${themeClasses.muted}`}`}
                                                                >
                                                                    <Zap size={24} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">{level.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${themeClasses.muted}`}>DISPATCH_CHANNELS</label>
                                                        <div className="flex flex-wrap gap-6">
                                                            {['app', 'email', 'sms'].map(method => (
                                                                <label key={method} className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl border-2 transition-all group ${formData.securityRules.notificationType.includes(method) ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-transparent bg-gray-500/5'}`}>
                                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${formData.securityRules.notificationType.includes(method) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500/30'}`}>
                                                                        {formData.securityRules.notificationType.includes(method) && <X size={14} className="text-white rotate-45" />}
                                                                    </div>
                                                                    <input 
                                                                        type="checkbox"
                                                                        className="hidden"
                                                                        checked={formData.securityRules.notificationType.includes(method)}
                                                                        onChange={(e) => {
                                                                            const types = e.target.checked 
                                                                                ? [...formData.securityRules.notificationType, method]
                                                                                : formData.securityRules.notificationType.filter(t => t !== method);
                                                                            setFormData({...formData, securityRules: {...formData.securityRules, notificationType: types}});
                                                                        }}
                                                                    />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.securityRules.notificationType.includes(method) ? 'text-emerald-500' : themeClasses.muted}`}>{method}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="mt-12 pt-8 border-t flex justify-between items-center">
                                        <div className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted} flex items-center gap-3`}>
                                            <Shield size={14} className="text-emerald-500" />
                                            {activeTab !== 'rules' ? 'VALIDATE_CORE_SYNC_TO_PROGRESS' : 'REVIEW_ALL_PROTOCOL_VECTORS'}
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                type="button"
                                                onClick={handleCloseForm}
                                                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${themeClasses.btnSecondary}`}
                                            >
                                                TERMINATE
                                            </button>
                                            <motion.button 
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="submit"
                                                className="px-10 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                            >
                                                {editingId ? 'COMMIT_UPDATE' : 'INITIALIZE_SECTOR'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {zones.length === 0 && !loading ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`col-span-full text-center py-20 rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-xl'}`}>
                            <Map size={48} className="text-gray-400" />
                        </div>
                        <h3 className={`text-2xl font-black tracking-tighter uppercase mb-4 ${themeClasses.text}`}>NO_SECTORS_DEFINED</h3>
                        <p className={`text-sm font-medium max-w-sm mx-auto ${themeClasses.muted}`}>Initial operational grid is currently devoid of partitions. Establish tactical zones to enable autonomous surveillance.</p>
                    </motion.div>
                ) : (
                    <AnimatePresence>
                        {zones.map((zone, idx) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={zone._id} 
                                className={`rounded-[2.5rem] border overflow-hidden transition-all duration-500 group flex flex-col hover:border-emerald-500/50 hover:shadow-2xl ${themeClasses.card}`}
                            >
                                <div className={`h-40 relative flex items-center justify-center overflow-hidden ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                                    <Map size={64} className="text-emerald-500/10 scale-150 transition-transform duration-700 group-hover:scale-110" />
                                    
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-widest shadow-xl backdrop-blur-md ${getRiskStyles(zone.riskLevel)}`}>
                                            {zone.riskLevel ? zone.riskLevel : 'LOW_RISK'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                         <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${isDarkMode ? 'bg-black/60 text-emerald-500 border-white/10' : 'bg-white/80 text-green-700 border-green-100'}`}>
                                            {zone.category ? zone.category.replace('_', ' ') : 'GENERAL'}
                                        </span>
                                    </div>
                                    
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity duration-500"></div>
                                </div>
                                
                                <div className="p-8 flex-1">
                                    <h3 className={`font-black text-2xl tracking-tighter uppercase mb-2 ${themeClasses.text}`}>{zone.zoneName}</h3>
                                    <p className={`text-[10px] font-bold h-12 line-clamp-2 mb-6 leading-relaxed opacity-60 ${themeClasses.muted}`}>
                                        {zone.description || 'STRATEGIC_DESCRIPTION_NOT_PROVIDED.'}
                                    </p>
                                    
                                    <div className={`space-y-4 pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted}`}>THRESHOLD</span>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase">{zone.thresholds?.animalCount || 1} ENTITIES / {zone.thresholds?.durationMinutes || 5} MIN</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted}`}>LOGIC</span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{zone.securityRules?.alertLevel || 'WARNING'} • {zone.securityRules?.notificationType?.join(', ') || 'APP'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-8 py-5 flex justify-between items-center ${isDarkMode ? 'bg-gray-950/50' : 'bg-gray-50/50'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted}`}>
                                            {new Date(zone.updatedAt).toLocaleDateString(undefined, { dateStyle: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                         <button 
                                            onClick={() => handleEdit(zone)}
                                            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                            title="Modify Parameter"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(zone._id)}
                                            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                            title="Terminate Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};

export default MyZones;
