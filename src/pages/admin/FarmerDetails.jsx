import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Mail, Phone, Calendar, Shield, MapPin, 
    ArrowLeft, Layout, Video, Bell, AlertTriangle, 
    CheckCircle, Activity, Loader2, Info
} from 'lucide-react';

const FarmerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Loading farmer details...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-3">
            <AlertTriangle size={24} />
            <p className="font-medium">{error}</p>
        </div>
    );

    const { farmer, farms, stats } = data;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/admin/farmers')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition font-medium"
                >
                    <ArrowLeft size={20} />
                    Back to Farmers
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${farmer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {farmer.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Layout className="text-blue-500" />} 
                    label="Farms Owned" 
                    value={stats.farmCount} 
                    bgColor="bg-blue-50" 
                />
                <StatCard 
                    icon={<Shield className="text-purple-500" />} 
                    label="Active Zones" 
                    value={stats.zoneCount} 
                    bgColor="bg-purple-50" 
                />
                <StatCard 
                    icon={<Video className="text-amber-500" />} 
                    label="Videos Processed" 
                    value={stats.videoCount} 
                    bgColor="bg-amber-50" 
                />
                <StatCard 
                    icon={<Bell className="text-rose-500" />} 
                    label="Total Alerts" 
                    value={stats.alertCount} 
                    bgColor="bg-rose-50" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Farmer Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Info className="text-green-600" size={20} />
                            Personal Information
                        </h3>
                        <div className="space-y-4">
                            <InfoItem icon={<User size={18} />} label="Name" value={farmer.name} />
                            <InfoItem icon={<Mail size={18} />} label="Email" value={farmer.email} />
                            <InfoItem icon={<Phone size={18} />} label="Phone" value={farmer.phoneNumber} />
                            <InfoItem icon={<Calendar size={18} />} label="Joined" value={new Date(farmer.createdAt).toLocaleDateString()} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Activity className="text-green-600" size={20} />
                            Activity Summary
                        </h3>
                        <div className="space-y-4">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Last Activity</span>
                                <span className="font-semibold text-gray-900">
                                    {stats.lastActivity ? new Date(stats.lastActivity).toLocaleDateString() : 'Never'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                                <div 
                                    className="bg-red-500 h-2 rounded-full" 
                                    style={{ width: `${(stats.dangerousAlerts / stats.alertCount) * 100 || 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                <span className="text-red-500">Dangerous ({stats.dangerousAlerts})</span>
                                <span className="text-green-500">Safe ({stats.safeAlerts})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Farm & Animal Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                             <MapPin className="text-green-600" size={20} />
                             Farm Locations
                        </h3>
                        <div className="divide-y divide-gray-50">
                            {farms.length > 0 ? farms.map(farm => (
                                <div key={farm._id} className="py-4 first:pt-0 last:pb-0">
                                    <p className="font-bold text-gray-900">{farm.farmName}</p>
                                    <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                                        <MapPin size={14} />
                                        {farm.location}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-gray-400 py-4 italic">No farms registered yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                             <AlertTriangle className="text-amber-500" size={20} />
                             Detected Animals
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(stats.animalSummary).length > 0 ? Object.entries(stats.animalSummary).map(([animal, count]) => (
                                <div key={animal} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <span className="text-2xl font-black text-green-600">{count}</span>
                                    <span className="text-xs font-bold text-gray-500 uppercase mt-1">{animal}</span>
                                </div>
                            )) : (
                                <p className="text-gray-400 col-span-full py-4 italic">No animal detections recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, bgColor }) => (
    <div className={`p-6 rounded-2xl ${bgColor} border-2 border-white shadow-sm hover:shadow-md transition`}>
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
                {icon}
            </div>
            <span className="text-3xl font-black text-gray-800">{value}</span>
        </div>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</p>
    </div>
);

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 group">
        <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-green-600 group-hover:bg-green-50 transition">
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
            <p className="font-medium text-gray-900">{value}</p>
        </div>
    </div>
);

export default FarmerDetails;
