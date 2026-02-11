import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, UserX, UserCheck, Search, Filter, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ManageFarmers = () => {
    const { isDarkMode } = useTheme();
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFarmers();
    }, []);

    const fetchFarmers = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/farmers', config);
            setFarmers(data);
        } catch (error) {
            console.error("Error fetching farmers", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        if (currentStatus) {
            // If active, show confirmation modal to deactivate
            setSelectedFarmer(farmers.find(f => f._id === id));
            setShowConfirmModal(true);
        } else {
            // If inactive, activate directly
            await performStatusToggle(id, currentStatus);
        }
    }

    const performStatusToggle = async (id, currentStatus) => {
         try {
            const tokenArr = JSON.parse(localStorage.getItem('user'));
            const token = tokenArr?.token;
            if (!token) throw new Error("No authentication token found");
            
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const newStatus = !currentStatus;
            
            console.log(`Toggling status for ${id} to ${newStatus}`);
            const response = await axios.patch(`http://localhost:5000/api/admin/farmers/${id}/status`, { isActive: newStatus }, config);
            
            if (response.data) {
                // Update local state immediately for better responsiveness
                setFarmers(prev => prev.map(f => f._id === id ? { ...f, isActive: newStatus } : f));
                setShowConfirmModal(false);
                setSelectedFarmer(null);
                
                // Still refresh from server to be sure
                await fetchFarmers(); 
                // alert(`Account ${newStatus ? 'activated' : 'deactivated'} successfully.`);
            }
        } catch (error) {
            console.error("Error updating status", error);
            const message = error.response?.data?.message || error.message || "Failed to update status";
            alert(`Error: ${message}`);
        }
    }

    const filteredFarmers = farmers.filter(farmer => 
        farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const themeClasses = {
        card: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-sm',
        header: isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50/50 border-gray-100',
        text: isDarkMode ? 'text-white' : 'text-gray-800',
        muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
        hover: isDarkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50',
    };

    if(loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
            <p className={`font-bold tracking-tight ${themeClasses.muted}`}>Syncing Farmer Database...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight ${themeClasses.text}`}>Farmer Management</h1>
                    <p className={`text-sm font-medium ${themeClasses.muted}`}>Oversee registered agricultural partners and their operational status</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all w-full md:w-64 ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white focus:border-emerald-500/50' : 'bg-white border-gray-200 focus:border-emerald-500'}`}
                        />
                    </div>
                </div>
            </div>

            <div className={`rounded-[2rem] border overflow-hidden transition-colors duration-500 ${themeClasses.card}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`border-b transition-colors duration-500 ${themeClasses.header}`}>
                            <tr>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Farmer Entity</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Contact Channel</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Joining Date</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Operational Status</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${themeClasses.muted}`}>Administration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/10 transition-colors duration-500">
                            {filteredFarmers.map((farmer, idx) => (
                                 <motion.tr 
                                    key={farmer._id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`transition-colors active:scale-[0.99] origin-left ${themeClasses.hover} ${!farmer.isActive ? 'opacity-70 bg-gray-500/5' : ''}`}
                                 >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg font-black text-xs ${!farmer.isActive ? 'bg-gray-500 text-white opacity-50' : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700')}`}>
                                                {farmer.name.split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <span className={`font-black tracking-tight ${themeClasses.text} ${!farmer.isActive ? 'text-gray-500 line-through' : ''}`}>{farmer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-0.5 text-red-500">
                                            <span className={`text-sm font-medium ${!farmer.isActive ? 'text-gray-500' : themeClasses.text}`}>{farmer.email}</span>
                                            <span className={`text-[10px] font-black ${themeClasses.muted}`}>{farmer.phoneNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-sm font-bold ${themeClasses.muted}`}>{new Date(farmer.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${farmer.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                            {farmer.isActive ? 'Active' : 'Deactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                             <button 
                                                onClick={() => navigate(`/admin/farmers/${farmer._id}`)}
                                                className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-gray-800 text-emerald-400 hover:bg-emerald-500/20' : 'bg-gray-50 text-emerald-600 hover:bg-emerald-50'}`}
                                                title="Visual Audit"
                                             >
                                                <Eye size={18} />
                                             </button>
                                             <button 
                                                onClick={() => toggleStatus(farmer._id, farmer.isActive)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all active:scale-90 shadow-lg ${farmer.isActive 
                                                    ? (isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100') 
                                                    : (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-emerald-500/20' : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 shadow-green-500/20')}`}
                                                title={farmer.isActive ? 'Deactivate Access' : 'Restore Access'}
                                             >
                                                {farmer.isActive ? (
                                                    <>
                                                        <UserX size={16} />
                                                        <span>Deactivate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck size={16} />
                                                        <span>Back to Active</span>
                                                    </>
                                                )}
                                             </button>
                                        </div>
                                    </td>
                                 </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deactivation Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`rounded-[2.5rem] shadow-2xl p-8 max-w-md w-full border ${isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-800'}`}
                        >
                            <div className="flex items-center gap-6 mb-6">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                                    <UserX className="text-red-500" size={32} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black tracking-tight leading-tight mb-1">Deactivate Farmer</h3>
                                    <p className={`text-xs font-black uppercase tracking-widest ${themeClasses.muted}`}>Safety confirmation</p>
                                </div>
                            </div>
                            
                            <p className={`mb-8 text-sm font-medium leading-relaxed ${themeClasses.muted}`}>
                                You are about to deactivate access for <span className={`font-black ${themeClasses.text}`}>{selectedFarmer?.name}</span>. This will prevent them from accessing their dashboard and receiving real-time alerts.
                            </p>
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setSelectedFarmer(null);
                                    }}
                                    className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => performStatusToggle(selectedFarmer._id, selectedFarmer.isActive)}
                                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Deactivate Now
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManageFarmers;
