import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAlerts } from '../../context/AlertContext';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, AlertCircle, ShieldAlert, Map, Settings, Plus, List, ChevronRight } from 'lucide-react';

import StatsCard from './components/StatsCard';
import DashboardAlerts from './components/DashboardAlerts';
import ZoneOverview from './components/ZoneOverview';
import AnimalActivity from './components/AnimalActivity';

const FarmerDashboard = () => {
    const navigate = useNavigate();
    const { alerts, fetchAlerts, markAsRead } = useAlerts();
    const { isDarkMode } = useTheme();
    
    // Local state for stats and zones (alerts come from Context for real-time sync if needed)
    const [stats, setStats] = useState({
        totalAnimalsToday: 0,
        totalActiveAlerts: 0,
        totalDangerousAlerts: 0,
        totalZones: 0,
        mostFrequentAnimal: 'None',
        lastDetected: null
    });
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if (!token) return;

            const [statsRes, zonesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/alerts/stats', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/farmer/zones', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setStats(statsRes.data);
            setZones(zonesRes.data);
            fetchAlerts(); // Ensure alerts context is fresh
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAlert = async (id) => {
        await markAsRead(id);
        fetchDashboardData(); 
    };

    const handleClearAll = async () => {
        if(!window.confirm("Are you sure you want to clear ALL alerts?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.delete('http://localhost:5000/api/alerts', { headers: { Authorization: `Bearer ${token}` } });
            fetchDashboardData();
        } catch (err) {
            console.error(err);
        }
    };

    const themeClasses = {
        header: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-emerald-500/5' : 'bg-white border-gray-100 shadow-sm',
        text: isDarkMode ? 'text-white' : 'text-gray-800',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 pb-12"
        >
             {/* Header & Quick Actions */}
             <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-500 ${themeClasses.header}`}>
                 <div>
                     <h1 className={`text-3xl font-bold tracking-tight mb-1 ${themeClasses.text}`}>Farm Safety Overview</h1>
                     <p className={`text-sm font-medium ${themeClasses.muted}`}>Real-time monitoring and security insights</p>
                 </div>
                 <div className="flex flex-wrap gap-3">
                     <button onClick={() => navigate('/farmer/zones')} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                        <Plus size={18} /> Add Zone
                     </button>
                     <button onClick={() => navigate('/farmer/alerts')} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                        <List size={18} /> View Alerts
                     </button>
                     <button onClick={handleClearAll} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                        <ShieldAlert size={18} /> Clear All
                     </button>
                     <button onClick={() => navigate('/profile')} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        <Settings size={18} /> Settings
                     </button>
                 </div>
             </div>
             
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatsCard 
                    title="Animals Detected Today" 
                    value={stats.totalAnimalsToday} 
                    icon={LayoutDashboard} 
                    color="emerald" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Active Alerts" 
                    value={stats.totalActiveAlerts} 
                    icon={AlertCircle} 
                    color="orange" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Dangerous Alerts" 
                    value={stats.totalDangerousAlerts} 
                    icon={ShieldAlert} 
                    color="red" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Zones Created" 
                    value={stats.totalZones} 
                    icon={Map} 
                    color="blue" 
                    loading={loading}
                 />
             </div>

             {/* Main Content Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Live Alerts - Takes up 2 cols */}
                 <div className="lg:col-span-2">
                     <DashboardAlerts 
                        alerts={alerts.slice(0, 10)} // Show max 10
                        loading={loading} 
                        onClear={handleClearAlert}
                        onClearAll={handleClearAll}
                     />
                 </div>
                 
                 {/* Right Column: Animal Activity */}
                 <div className="lg:col-span-1">
                     <AnimalActivity 
                        mostFrequent={stats.mostFrequentAnimal} 
                        lastDetected={stats.lastDetected} 
                        loading={loading}
                     />
                 </div>
             </div>

             {/* Zones Overview */}
             <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               className="grid grid-cols-1"
             >
                 <ZoneOverview zones={zones} loading={loading} />
             </motion.div>
        </motion.div>
    )
}
export default FarmerDashboard;
