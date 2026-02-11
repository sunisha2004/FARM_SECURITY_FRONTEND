import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { ArrowLeft, AlertTriangle, CheckCircle, MapPin, Calendar, Video, ShieldAlert, Target, Clock, Shield } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';

const AlertDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { markAsRead } = useAlerts(); 
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const { data } = await axios.get(`http://localhost:5000/api/alerts`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                const found = data.find(a => a._id === id);
                setAlert(found);
                
                if(found && !found.isRead) {
                    markAsRead(id);
                }
            } catch (err) {
                console.error("Failed to load alert", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlert();
    }, [id]);

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
        panel: isDarkMode ? 'bg-gray-950/40 border-gray-800' : 'bg-gray-50 border-gray-100',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    };

    if(loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl border-4 border-emerald-500 border-t-transparent animate-spin mb-6"></div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Decrypting Event Data...</p>
        </div>
    );

    if(!alert) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
            <AlertCircle className="text-gray-500 mb-4" size={48} />
            <h3 className={`text-xl font-black mb-2 ${themeClasses.text}`}>Event Record Not Found</h3>
            <button onClick={() => navigate('/farmer/alerts')} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest mt-4">Return to Fleet</button>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto max-w-2xl p-6 pb-24"
        >
            <button 
                onClick={() => navigate(-1)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 mb-10 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
                <ArrowLeft size={16} /> Directory Return
            </button>

            <div className={`rounded-[2.5rem] border-t-[10px] overflow-hidden shadow-2xl transition-all duration-500 ${themeClasses.card} ${
                alert.severity === 'HIGH' ? 'border-red-500' : 'border-emerald-500'
            }`}>
                <div className={`p-10 border-b ${alert.severity === 'HIGH' ? (isDarkMode ? 'bg-red-500/5' : 'bg-red-50') : (isDarkMode ? 'bg-emerald-500/5' : 'bg-green-50')}`}>
                    <div className="flex items-center gap-8 mb-6">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg ${
                                alert.severity === 'HIGH' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                            }`}
                        >
                            {alert.severity === 'HIGH' ? (
                                <ShieldAlert size={40} />
                            ) : (
                                <CheckCircle size={40} />
                            )}
                        </motion.div>
                        <div>
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${
                                alert.severity === 'HIGH' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                                {alert.severity} PRIORITY EVENT
                            </span>
                            <h1 className={`text-3xl font-black tracking-tighter mt-4 leading-tight ${themeClasses.text}`}>{alert.message}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`p-6 rounded-3xl border ${themeClasses.panel}`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${themeClasses.muted}`}>
                                <Target size={14} className="text-emerald-500" /> Biometric Signature
                            </p>
                            <p className={`text-xl font-black tracking-tight capitalize ${themeClasses.text}`}>
                                {alert.animalType}
                            </p>
                        </motion.div>
                         <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`p-6 rounded-3xl border ${themeClasses.panel}`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${themeClasses.muted}`}>
                                <MapPin size={14} className="text-emerald-500" /> Operational Sector
                            </p>
                            <p className={`text-xl font-black tracking-tight ${themeClasses.text}`}>
                                {alert.zoneName || 'Global Grid'}
                            </p>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${themeClasses.panel}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white shadow-sm text-gray-400'}`}>
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Time Resolution</p>
                                <p className={`text-sm font-bold mt-1 ${themeClasses.text}`}>
                                    {new Date(alert.createdAt).toLocaleString(undefined, {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Precise Marker</p>
                             <p className={`text-xl font-black font-mono text-emerald-500`}>
                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                             </p>
                        </div>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`p-6 rounded-[2rem] border border-dashed text-center flex flex-col items-center justify-center ${isDarkMode ? 'border-gray-800 bg-gray-950/20' : 'border-gray-200 bg-gray-50'}`}
                    >
                         <Shield size={24} className="text-emerald-500/30 mb-3" />
                         <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-xs ${themeClasses.muted}`}>This event has been archived in the secure AgriGuard ledger for future compliance and audit protocols.</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default AlertDetails;
