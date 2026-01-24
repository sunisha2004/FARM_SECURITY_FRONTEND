import { useState, useEffect } from 'react';
import { Plus, Map, Trash2, Edit2, AlertTriangle, X } from 'lucide-react';
import zoneService from '../../services/zoneService';

const MyZones = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        zoneName: '',
        description: '',
        riskLevel: 'low'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const data = await zoneService.getZones();
            if (Array.isArray(data)) {
                setZones(data);
            } else {
                setZones([]);
            }
        } catch (error) {
            console.error("Error fetching zones", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await zoneService.updateZone(editingId, formData);
            } else {
                await zoneService.createZone(formData);
            }
            
            // Reset and refresh
            setFormData({ zoneName: '', description: '', riskLevel: 'low' });
            setIsFormOpen(false);
            setEditingId(null);
            fetchZones();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed. Please try again.';
            alert(message);
        }
    };

    const handleEdit = (zone) => {
        setFormData({
            zoneName: zone.zoneName,
            description: zone.description || '',
            riskLevel: zone.riskLevel
        });
        setEditingId(zone._id);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this zone?')) {
            try {
                await zoneService.deleteZone(id);
                fetchZones();
            } catch (error) {
                alert('Failed to delete zone');
            }
        }
    };

    const getRiskColor = (level) => {
        switch(level) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-green-100 text-green-700 border-green-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Zone Management</h1>
                    <p className="text-gray-500 mt-1">Define and monitor security zones in your farm</p>
                </div>
                {!isFormOpen && (
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                    >
                        <Plus size={20} />
                        Add New Zone
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {isFormOpen && (
                <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in relative">
                     <button 
                        onClick={() => {
                            setIsFormOpen(false);
                            setEditingId(null);
                            setFormData({ zoneName: '', description: '', riskLevel: 'low' });
                        }}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                    
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        {editingId ? 'Edit Zone' : 'Create New Zone'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                            <input 
                                type="text" 
                                value={formData.zoneName}
                                onChange={(e) => setFormData({...formData, zoneName: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="e.g., North Barn Entrance"
                                required
                            />
                        </div>

                        <div className="col-span-1">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Security Risk Level</label>
                             <select
                                value={formData.riskLevel}
                                onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                             >
                                 <option value="low">Low (Standard Monitoring)</option>
                                 <option value="medium">Medium (Enhanced Alert)</option>
                                 <option value="high">High (Restricted Area)</option>
                             </select>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                             <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                             <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                rows="3"
                                placeholder="Describe the area and security concerns..."
                             />
                        </div>

                        <div className="col-span-1 md:col-span-2 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                                {editingId ? 'Update Zone' : 'Create Zone'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Zones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones.length === 0 && !loading ? (
                    <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <Map size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500">No zones defined yet</h3>
                        <p className="text-gray-400">Create your first security zone to start monitoring.</p>
                    </div>
                ) : (
                    zones.map(zone => (
                        <div key={zone._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Map size={24} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(zone.riskLevel)}`}>
                                        {zone.riskLevel.toUpperCase()}
                                    </span>
                                </div>
                                
                                <h3 className="font-bold text-gray-800 text-lg mb-2">{zone.zoneName}</h3>
                                <p className="text-gray-500 text-sm h-10 line-clamp-2">
                                    {zone.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    Updated: {new Date(zone.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleEdit(zone)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit Zone"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(zone._id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Zone"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyZones;
