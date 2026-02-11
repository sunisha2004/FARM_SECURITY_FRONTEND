import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, Building, Map, Bell, Shield, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminDashboard = () => {
    const { isDarkMode } = useTheme();
    const [stats, setStats] = useState({ farmers: 0, farms: 0, zones: 0, alerts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const token = JSON.parse(userStr).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/admin/stats', config);
                setStats(data);
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100',
        text: isDarkMode ? 'text-white' : 'text-gray-800',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    };

    const StatCard = ({ title, value, icon: Icon, color, delay }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl border transition-all duration-500 ${themeClasses.card} flex items-center gap-5`}
        >
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.muted}`}>{title}</p>
                <h3 className={`text-2xl font-black mt-1 ${themeClasses.text}`}>{loading ? '...' : value}</h3> 
            </div>
        </motion.div>
    );
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div>
                <h1 className={`text-3xl font-black tracking-tight ${themeClasses.text}`}>Cerebrum Central</h1>
                <p className={`text-sm font-medium ${themeClasses.muted}`}>High-level command and control overview of the AgriGuard ecosystem</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Farmers" 
                    value={stats.farmers} 
                    icon={Users} 
                    color={isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"} 
                    delay={0.1}
                />
                <StatCard 
                    title="Managed Estates" 
                    value={stats.farms} 
                    icon={Building} 
                    color={isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}
                    delay={0.2}
                />
                <StatCard 
                    title="Security Zones" 
                    value={stats.zones} 
                    icon={Map} 
                    color={isDarkMode ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}
                    delay={0.3}
                />
                <StatCard 
                    title="System Alerts" 
                    value={stats.alerts} 
                    icon={Bell} 
                    color={isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"}
                    delay={0.4}
                />
            </div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className={`relative overflow-hidden p-8 rounded-[2.5rem] border flex items-center justify-between transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-emerald-500/20' : 'bg-emerald-900 border-none'}`}
            >
                 <div className="relative z-10 max-w-lg">
                    <h3 className="text-2xl font-black text-white mb-3">Operational Command Active</h3>
                    <p className="text-emerald-50/70 text-sm leading-relaxed mb-6 italic">Secure administrative interface for farm oversight and farmer management. Real-time telemetry monitoring is active across all linked sectors.</p>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95">
                        Audit System Logs <ArrowRight size={16} />
                    </button>
                 </div>
                 
                 <div className="absolute right-0 top-0 h-full opacity-10 flex items-center">
                    <Shield className="text-white" size={300} strokeWidth={0.5} />
                 </div>
                 
                 <div className="hidden lg:block relative z-10">
                    <div className="w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl absolute inset-0 animate-pulse"></div>
                    <Shield className="text-emerald-400" size={120} strokeWidth={1} />
                 </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;
