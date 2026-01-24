import { useState, useEffect } from 'react';
import axios from 'axios';

const ManageFarmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

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
         try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.patch(`http://localhost:5000/api/admin/farmers/${id}/status`, { isActive: !currentStatus }, config);
            fetchFarmers(); // Refresh list
        } catch (error) {
            console.error("Error updating status", error);
        }
    }

    if(loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Farmers</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {farmers.map(farmer => (
                             <tr key={farmer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{farmer.name}</td>
                                <td className="px-6 py-4 text-gray-600">{farmer.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${farmer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {farmer.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                     <button 
                                        onClick={() => toggleStatus(farmer._id, farmer.isActive)}
                                        className={`text-sm font-medium ${farmer.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                                     >
                                        {farmer.isActive ? 'Deactivate' : 'Activate'}
                                     </button>
                                </td>
                             </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageFarmers;
