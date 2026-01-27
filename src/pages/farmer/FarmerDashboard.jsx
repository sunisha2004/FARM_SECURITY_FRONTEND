import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAlerts } from '../../context/AlertContext';
import { LayoutDashboard, AlertCircle, ShieldAlert, Map, Activity, Settings, Plus, List } from 'lucide-react';

import StatsCard from './components/StatsCard';
import DashboardAlerts from './components/DashboardAlerts';
import ZoneOverview from './components/ZoneOverview';
import AnimalActivity from './components/AnimalActivity';

const FarmerDashboard = () => {
    const navigate = useNavigate();
    const { alerts, fetchAlerts, markAsRead } = useAlerts();
    
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

    return (
        <div className="space-y-6">
             {/* Header & Quick Actions */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                     <h1 className="text-2xl font-bold text-gray-800">Farm Safety Overview</h1>
                     <p className="text-gray-500 text-sm">Real-time monitoring and security insights</p>
                 </div>
                 <div className="flex flex-wrap gap-2">
                     <button onClick={() => navigate('/farmer/zones')} className="btn-quick-action bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Plus size={16} /> Add Zone
                     </button>
                     <button onClick={() => navigate('/farmer/alerts')} className="btn-quick-action bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <List size={16} /> View Alerts
                     </button>
                     <button onClick={handleClearAll} className="btn-quick-action bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <ShieldAlert size={16} /> Clear All
                     </button>
                     <button onClick={() => navigate('/profile')} className="btn-quick-action bg-gray-50 text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Settings size={16} /> Settings
                     </button>
                 </div>
             </div>
             
             {/* Stats Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatsCard 
                    title="Animals Detected Today" 
                    value={stats.totalAnimalsToday} 
                    icon={LayoutDashboard} 
                    color="bg-blue-500" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Active Alerts" 
                    value={stats.totalActiveAlerts} 
                    icon={AlertCircle} 
                    color="bg-orange-500" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Dangerous Alerts" 
                    value={stats.totalDangerousAlerts} 
                    icon={ShieldAlert} 
                    color="bg-red-600" 
                    loading={loading}
                 />
                 <StatsCard 
                    title="Zones Created" 
                    value={stats.totalZones} 
                    icon={Map} 
                    color="bg-green-600" 
                    loading={loading}
                 />
             </div>

             {/* Main Content Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                 {/* Live Alerts - Takes up 2 cols */}
                 <div className="lg:col-span-2 h-full">
                     <DashboardAlerts 
                        alerts={alerts.slice(0, 10)} // Show max 10
                        loading={loading} 
                        onClear={handleClearAlert}
                     />
                 </div>
                 
                 {/* Right Column: Animal Activity */}
                 <div className="lg:col-span-1 h-full">
                     <AnimalActivity 
                        mostFrequent={stats.mostFrequentAnimal} 
                        lastDetected={stats.lastDetected} 
                        loading={loading}
                     />
                 </div>
             </div>

             {/* Zones Overview */}
             <div className="grid grid-cols-1">
                 <ZoneOverview zones={zones} loading={loading} />
             </div>
        </div>
    )
}
export default FarmerDashboard;
