import React, { useEffect } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, ShieldAlert, Trash2, Bell, Shield, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const AlertList = () => {
    const { isDarkMode } = useTheme();
    const { alerts, fetchAlerts, markAsRead } = useAlerts();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if(!window.confirm("Delete this security log?")) return;
        
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.delete(`http://localhost:5000/api/alerts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlerts(); 
        } catch(err) {
            console.error("Delete failed", err);
        }
    };

    const handleClearAll = async () => {
        if(!window.confirm("Are you sure you want to purge ALL security logs? This action is irreversible.")) return;
        
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.delete('http://localhost:5000/api/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlerts(); 
        } catch(err) {
            console.error(err);
        }
    };

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-100 shadow-sm',
        text: isDarkMode ? 'text-white' : 'text-gray-900',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        hover: isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto max-w-4xl p-6 pb-24"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${themeClasses.text}`}>
                        <ShieldAlert className="text-emerald-500" size={32} />
                        Security Intelligence
                    </h1>
                    <p className={`text-sm font-medium mt-1 ${themeClasses.muted}`}>Real-time logs of detected anomalies and security events</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {alerts.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'}`}
                        >
                            <Trash2 size={16} />
                            Purge Records
                        </button>
                    )}
                </div>
            </div>
            
            <div className="grid gap-4">
                <AnimatePresence mode='popLayout'>
                    {alerts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-center justify-center py-32 rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-600'}`}>
                                <CheckCircle size={40} />
                            </div>
                            <h3 className={`text-xl font-black tracking-tight mb-2 ${themeClasses.text}`}>Vault Empty</h3>
                            <p className={`text-xs font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>No active security threats detected in current cycle</p>
                        </motion.div>
                    ) : (
                        alerts.map((alert, idx) => (
                            <motion.div 
                                layout
                                key={alert._id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                    if(!alert.isRead) markAsRead(alert._id);
                                    navigate(`/farmer/alerts/${alert._id}`);
                                }}
                                className={`relative group p-6 rounded-3xl border transition-all cursor-pointer ${themeClasses.card} ${themeClasses.hover} ${!alert.isRead ? (isDarkMode ? 'ring-1 ring-emerald-500/50' : 'ring-2 ring-emerald-500/20') : 'opacity-80'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-6 items-center">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                                            alert.severity === 'HIGH' 
                                            ? (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') 
                                            : (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-600')
                                        }`}>
                                            <AlertCircle size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                                    alert.severity === 'HIGH' 
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/20' 
                                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                                }`}>
                                                    {alert.severity} PRIORITY
                                                </span>
                                                {!alert.isRead && (
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                                )}
                                            </div>
                                            <h4 className={`font-black text-lg tracking-tight mb-1 ${themeClasses.text}`}>
                                                {alert.message}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${themeClasses.muted}`}>IDENTIFIED IN:</span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{alert.zoneName || 'Sector Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden md:block">
                                            <p className={`text-[10px] font-black uppercase tracking-[0.1em] ${themeClasses.muted}`}>Time Recorded</p>
                                            <p className={`text-xs font-bold ${themeClasses.text}`}>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(e, alert._id)}
                                            className={`p-3 rounded-2xl transition-all opacity-0 group-hover:opacity-100 ${isDarkMode ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                            title="Purge Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <ChevronRight className={`text-gray-400 transition-transform group-hover:translate-x-1 ${themeClasses.muted}`} size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AlertList;
