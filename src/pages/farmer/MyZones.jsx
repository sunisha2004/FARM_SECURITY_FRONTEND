import { useState, useEffect } from 'react';
import { Plus, Map, Trash2, Edit2, AlertTriangle, X, Settings2, ShieldCheck, Info, Loader2 } from 'lucide-react';
import axios from 'axios';
import zoneService from '../../services/zoneService';
import ZoneMap from './components/ZoneMap';

const MyZones = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState({
        zoneName: '',
        description: '',
        riskLevel: 'low',
        category: 'other',
        coordinates: [],
        thresholds: {
            animalCount: 1,
            durationMinutes: 5,
            motionIntensity: 50
        },
        securityRules: {
            alertLevel: 'warning',
            notificationType: ['app'],
            allowedAnimals: []
        }
    });
    const [editingId, setEditingId] = useState(null);

    const [farmCoordinates, setFarmCoordinates] = useState(null);

    useEffect(() => {
        fetchZones();
        fetchFarmCoordinates();
    }, []);

    const fetchFarmCoordinates = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            if(!token) return;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/farmer/farm', config);
            if (data && data.coordinates) {
                setFarmCoordinates(data.coordinates);
            }
        } catch (error) {
            console.error("Error fetching farm coordinates", error);
        }
    };

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
        
        if (formData.coordinates.length < 3) {
            alert("Please select at least 3 points on the map to define the zone boundary.");
            setActiveTab('boundary');
            return;
        }

        try {
            // Calculate Center (Centroid)
            const latSum = formData.coordinates.reduce((sum, p) => sum + p.lat, 0);
            const lngSum = formData.coordinates.reduce((sum, p) => sum + p.lng, 0);
            const center = {
                lat: latSum / formData.coordinates.length,
                lng: lngSum / formData.coordinates.length
            };

            // Reverse Geocoding
            let locationName = '';
            try {
                const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
                const address = geoRes.data.address;
                // Construct a readable location string
                locationName = [
                    address.village || address.town || address.city || address.suburb,
                    address.state_district,
                    address.state
                ].filter(Boolean).join(', ');
            } catch (geoError) {
                console.error("Geocoding failed", geoError);
                locationName = "Unknown Location";
            }

            const payload = {
                ...formData,
                center,
                locationName
            };

            if (editingId) {
                await zoneService.updateZone(editingId, payload);
            } else {
                await zoneService.createZone(payload);
            }
            
            // Reset and refresh
            handleCloseForm();
            fetchZones();
        } catch (error) {
            const message = error.response?.data?.message || 'Operation failed. Please try again.';
            alert(message);
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setActiveTab('basic');
        setFormData({
            zoneName: '',
            description: '',
            riskLevel: 'low',
            category: 'other',
            coordinates: [],
            thresholds: { animalCount: 1, durationMinutes: 5, motionIntensity: 50 },
            securityRules: { alertLevel: 'warning', notificationType: ['app'], allowedAnimals: [] }
        });
    };

    const handleEdit = (zone) => {
        setFormData({
            zoneName: zone.zoneName,
            description: zone.description || '',
            riskLevel: zone.riskLevel || 'low',
            category: zone.category || 'other',
            coordinates: zone.coordinates || [],
            thresholds: zone.thresholds || { animalCount: 1, durationMinutes: 5, motionIntensity: 50 },
            securityRules: zone.securityRules || { alertLevel: 'warning', notificationType: ['app'], allowedAnimals: [] }
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
            case 'critical': return 'bg-red-200 text-red-900 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-blue-100 text-blue-700 border-blue-200';
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
                    <p className="text-gray-500 mt-1">Define precise boundaries and monitoring rules for your farm</p>
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
                <div className="mb-8 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden animate-fade-in relative">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Edit Zone Configuration' : 'Create New Monitoring Zone'}
                        </h2>
                        <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row">
                        {/* Tabs Sidebar */}
                        <div className="md:w-64 bg-gray-50 border-r border-gray-100 p-4 space-y-2">
                            <button 
                                onClick={() => setActiveTab('basic')}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'basic' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Info size={18} /> Basic Info
                            </button>
                            <button 
                                onClick={() => setActiveTab('boundary')}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'boundary' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Map size={18} /> Boundaries
                            </button>
                            <button 
                                onClick={() => setActiveTab('thresholds')}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'thresholds' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <Settings2 size={18} /> Thresholds
                            </button>
                            <button 
                                onClick={() => setActiveTab('rules')}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'rules' ? 'bg-white text-green-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <ShieldCheck size={18} /> Security Rules
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-6">
                            <form onSubmit={handleSubmit}>
                                {activeTab === 'basic' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    <option value="crop_area">Crop Area</option>
                                                    <option value="storage_area">Storage Area</option>
                                                    <option value="livestock_area">Livestock Area</option>
                                                    <option value="high_risk_area">High Risk Area</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Security Risk Level</label>
                                                <select
                                                    value={formData.riskLevel}
                                                    onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    <option value="low">Low (Standard Monitoring)</option>
                                                    <option value="medium">Medium (Enhanced Alert)</option>
                                                    <option value="high">High (Restricted Area)</option>
                                                    <option value="critical">Critical (Intrusion Prevention)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                            <textarea 
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                rows="3"
                                                placeholder="Describe the area and security concerns..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'boundary' && (
                                    <div className="space-y-4 animate-in slide-in-from-right-4">
                                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 flex gap-2 items-start">
                                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                                            <p>Click on the map below to define the vertices of your zone. You must provide at least 3 points to form a polygon.</p>
                                        </div>
                                        <ZoneMap 
                                            points={formData.coordinates} 
                                            setPoints={(pts) => setFormData({...formData, coordinates: pts})}
                                            isEditing={true}
                                            existingZones={zones.filter(z => z._id !== editingId)}
                                            center={farmCoordinates} 
                                        />
                                    </div>
                                )}

                                {activeTab === 'thresholds' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Min Animal Count for Alert</label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={formData.thresholds.animalCount}
                                                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, animalCount: parseInt(e.target.value)}})}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Duration Threshold (Minutes)</label>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    value={formData.thresholds.durationMinutes}
                                                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, durationMinutes: parseInt(e.target.value)}})}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Motion Intensity Sensitivity ({formData.thresholds.motionIntensity}%)</label>
                                                <input 
                                                    type="range" 
                                                    min="0"
                                                    max="100"
                                                    value={formData.thresholds.motionIntensity}
                                                    onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, motionIntensity: parseInt(e.target.value)}})}
                                                    className="w-full accent-green-600"
                                                />
                                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                    <span>Low Sensitivity</span>
                                                    <span>High Sensitivity</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'rules' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Level</label>
                                                <select
                                                    value={formData.securityRules.alertLevel}
                                                    onChange={(e) => setFormData({...formData, securityRules: {...formData.securityRules, alertLevel: e.target.value}})}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    <option value="info">Information Only</option>
                                                    <option value="warning">Warning (Yellow Alert)</option>
                                                    <option value="critical">Critical (Immediate Response)</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Methods</label>
                                            <div className="flex gap-4">
                                                {['app', 'email', 'sms'].map(method => (
                                                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox"
                                                            checked={formData.securityRules.notificationType.includes(method)}
                                                            onChange={(e) => {
                                                                const types = e.target.checked 
                                                                    ? [...formData.securityRules.notificationType, method]
                                                                    : formData.securityRules.notificationType.filter(t => t !== method);
                                                                setFormData({...formData, securityRules: {...formData.securityRules, notificationType: types}});
                                                            }}
                                                            className="w-4 h-4 text-green-600 rounded"
                                                        />
                                                        <span className="text-sm capitalize text-gray-600">{method}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <div className="text-xs text-gray-400">
                                        {activeTab !== 'rules' ? 'Navigate through tabs to finish setup' : 'Review all settings before saving'}
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={handleCloseForm}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold shadow-sm"
                                        >
                                            {editingId ? 'Save Changes' : 'Create Zone'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
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
                        <div key={zone._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group flex flex-col">
                            <div className="h-32 bg-gray-100 overflow-hidden relative">
                                <Map size={40} className="absolute inset-0 m-auto text-gray-200" />
                                {/* Small static map preview could go here */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${getRiskColor(zone.riskLevel)}`}>
                                        {zone.riskLevel ? zone.riskLevel.toUpperCase() : 'LOW'}
                                    </span>
                                </div>
                                <div className="absolute bottom-2 left-2">
                                     <span className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-gray-600 capitalize">
                                        {zone.category ? zone.category.replace('_', ' ') : 'Other'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1">
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{zone.zoneName}</h3>
                                <p className="text-gray-500 text-xs h-8 line-clamp-2 mb-4 italic">
                                    {zone.description || 'No description provided.'}
                                </p>
                                
                                <div className="space-y-2 border-t border-gray-50 pt-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400 font-medium">THRESHOLD</span>
                                        <span className="text-gray-600">{zone.thresholds?.animalCount || 1} Animals / {zone.thresholds?.durationMinutes || 5} min</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-400 font-medium">RULES</span>
                                        <span className="text-gray-600 capitalize">{zone.securityRules?.alertLevel || 'Warning'} • {zone.securityRules?.notificationType?.join(', ') || 'App'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400">
                                    {new Date(zone.updatedAt).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleEdit(zone)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit Zone"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(zone._id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete Zone"
                                    >
                                        <Trash2 size={16} />
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
