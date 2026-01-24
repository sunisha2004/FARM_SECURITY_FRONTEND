import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Building, Map } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ farmers: 0, farms: 0, zones: 0 });
    
    // In a real app, I'd fetch these stats from the backend. 
    // For now, I'll mock or leave blank/fetching logic placegolders.
    // I can reuse the list endpoints and count length.
    
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Farmers</p>
                        <h3 className="text-2xl font-bold">--</h3> 
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <Building size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Farms</p>
                        <h3 className="text-2xl font-bold">--</h3> 
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Map size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Zones</p>
                        <h3 className="text-2xl font-bold">--</h3> 
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
                 <h3 className="text-lg font-bold text-blue-900 mb-2">Welcome Admin</h3>
                 <p className="text-blue-700">Use the sidebar to manage farmers and inspect farm details.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
