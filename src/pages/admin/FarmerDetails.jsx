import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, Calendar, Shield, MapPin, 
    ArrowLeft, Layout, Video, Bell, AlertTriangle, 
    CheckCircle, Activity, Loader2, Info, ChevronRight,
    Zap, Target, Skull
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const FarmerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return navigate('/login');
                const token = JSON.parse(userStr).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const { data } = await axios.get(`http://localhost:5000/api/admin/farmers/${id}/details`, config);
                setData(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load details");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, navigate]);

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        label: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-16 h-16 rounded-3xl border-4 border-emerald-500 border-t-transparent animate-spin mb-6"></div>
            <p className={`font-black uppercase tracking-widest text-xs ${themeClasses.muted}`}>Decrypting Farmer Profile...</p>
        </div>
    );

    if (error) return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
        >
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <AlertTriangle size={32} />
            </div>
            <div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">Access Protocol Failed</h3>
                <p className="font-bold opacity-80">{error}</p>
            </div>
        </motion.div>
    );

    const { farmer, farms, stats } = data;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-20"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button 
                    onClick={() => navigate('/admin/farmers')}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <ArrowLeft size={16} />
                    Directory Return
                </button>
                <div className="flex items-center gap-4">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg ${farmer.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5'}`}>
                        {farmer.isActive ? 'Account Active' : 'Account Suspended'}
                    </span>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${farmer.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
            </div>

            {/* Entity Title */}
            <div>
                <h1 className={`text-4xl font-black tracking-tight mb-2 ${themeClasses.text}`}>{farmer.name}</h1>
                <p className={`text-sm font-medium ${themeClasses.muted}`}>Unique System Identifier: <span className="font-mono text-emerald-500">#{farmer._id.slice(-8).toUpperCase()}</span></p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={Layout} 
                    label="Operations" 
                    value={stats.farmCount} 
                    color={isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"} 
                    delay={0.1}
                />
                <StatCard 
                    icon={Shield} 
                    label="Security Perimeters" 
                    value={stats.zoneCount} 
                    color={isDarkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"} 
                    delay={0.2}
                />
                <StatCard 
                    icon={Video} 
                    label="Stream Cycles" 
                    value={stats.videoCount} 
                    color={isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"} 
                    delay={0.3}
                />
                <StatCard 
                    icon={Bell} 
                    label="Detections" 
                    value={stats.alertCount} 
                    color={isDarkMode ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"} 
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Farmer Info */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-1 space-y-8"
                >
                    <div className={`p-8 rounded-[2.5rem] border transition-colors duration-500 ${themeClasses.card}`}>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${themeClasses.muted}`}>
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Core Credentials
                        </h3>
                        <div className="space-y-6">
                            <InfoItem icon={User} label="Entity Name" value={farmer.name} />
                            <InfoItem icon={Mail} label="Secure Channel" value={farmer.email} />
                            <InfoItem icon={Phone} label="Contact Link" value={farmer.phoneNumber} />
                            <InfoItem icon={Calendar} label="Induction Date" value={new Date(farmer.createdAt).toLocaleDateString()} />
                        </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border transition-colors duration-500 ${themeClasses.card}`}>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${themeClasses.muted}`}>
                             <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                             Operational Integrity
                        </h3>
                        <div className="space-y-6">
                             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className={themeClasses.muted}>Last Interaction</span>
                                <span className={themeClasses.text}>
                                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Baseline'}
                                </span>
                            </div>
                            <div className={`w-full overflow-hidden rounded-full h-3 flex ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.dangerousAlerts / stats.alertCount) * 100 || 0}%` }}
                                    className="bg-red-500 h-full shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                                ></motion.div>
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.15em]">
                                <span className="text-red-500 flex items-center gap-1.5"><Skull size={10} /> Critical ({stats.dangerousAlerts})</span>
                                <span className="text-emerald-500 flex items-center gap-1.5"><Shield size={10} /> Neutral ({stats.safeAlerts})</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Farm & Animal Details */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 space-y-8"
                >
                    <div className={`p-8 rounded-[2.5rem] border transition-colors duration-500 ${themeClasses.card}`}>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${themeClasses.muted}`}>
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             Geographic Assets
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {farms.length > 0 ? farms.map((farm, idx) => (
                                <motion.div 
                                    whileHover={{ y: -5 }}
                                    key={farm._id} 
                                    className={`p-6 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            <Target size={20} />
                                        </div>
                                    </div>
                                    <h4 className={`font-black tracking-tight mb-1 ${themeClasses.text}`}>{farm.farmName}</h4>
                                    <p className={`text-xs font-semibold flex items-center gap-1.5 ${themeClasses.muted}`}>
                                        <MapPin size={12} className="text-emerald-500" />
                                        {farm.location}
                                    </p>
                                </motion.div>
                            )) : (
                                <div className={`col-span-full py-12 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                                    <MapPin size={32} className="text-gray-300 mb-2" />
                                    <p className={`text-xs font-black uppercase tracking-widest ${themeClasses.muted}`}>No geographic data linked</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border transition-colors duration-500 ${themeClasses.card}`}>
                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 ${themeClasses.muted}`}>
                             <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                             Biometric Log
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Object.keys(stats.animalSummary).length > 0 ? Object.entries(stats.animalSummary).map(([animal, count], idx) => (
                                <motion.div 
                                    whileHover={{ scale: 1.05 }}
                                    key={animal} 
                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-gray-800/30 border-gray-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'bg-gray-50 border-gray-100 hover:border-emerald-200 hover:bg-white hover:shadow-lg'}`}
                                >
                                    <span className={`text-3xl font-black mb-1 p-2 rounded-xl ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {count}
                                    </span>
                                    <span className={`text-[9px] font-black text-center uppercase tracking-[0.2em] whitespace-nowrap ${themeClasses.muted}`}>{animal}</span>
                                </motion.div>
                            )) : (
                                <p className={`text-xs font-black uppercase tracking-widest text-center col-span-full py-8 italic ${themeClasses.muted}`}>Biometric vault empty</p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
    const { isDarkMode } = useTheme();
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
            className={`p-8 rounded-[2rem] border transition-all duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm'} group flex flex-col items-center text-center`}
        >
            <div className={`p-4 rounded-2xl mb-5 shadow-lg transition-transform duration-500 group-hover:scale-110 ${color}`}>
                <Icon size={24} />
            </div>
            <h3 className={`text-3xl font-black mb-1 transition-colors duration-500 ${isDarkMode ? 'text-white group-hover:text-emerald-400' : 'text-gray-900'}`}>{value}</h3> 
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        </motion.div>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => {
    const { isDarkMode } = useTheme();
    return (
        <div className="flex items-center gap-5 group">
            <div className={`p-3.5 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 shadow-inner' : 'bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 border border-transparent group-hover:border-emerald-100'}`}>
                <Icon size={18} />
            </div>
            <div className="min-w-0">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 transition-colors group-hover:text-emerald-500 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                <p className={`font-bold truncate transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            </div>
        </div>
    );
};

export default FarmerDetails;
