import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, MapPin, Tractor, Loader2 } from 'lucide-react';

const MyFarm = () => {
    const [farm, setFarm] = useState({ farmName: '', location: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exists, setExists] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchFarm();
    }, []);

    const fetchFarm = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:5000/api/farmer/farm', config);
            if(data) {
                setFarm(data);
                setExists(true);
            }
        } catch (error) {
           // If 404, it means no farm created yet
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const token = JSON.parse(localStorage.getItem('user')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (exists) {
                await axios.put('http://localhost:5000/api/farmer/farm', farm, config);
                setMsg('Farm details updated successfully');
            } else {
                await axios.post('http://localhost:5000/api/farmer/farm', farm, config);
                setExists(true);
                setMsg('Farm created successfully');
            }
        } catch (error) {
             setMsg('Error saving farm details: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    if(loading) return <div className="p-10">Loading farm details...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Farm Details</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                {msg && <div className={`p-4 mb-6 rounded-lg ${msg.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Farm Name</label>
                        <div className="relative">
                            <Tractor className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                value={farm.farmName}
                                onChange={(e) => setFarm({...farm, farmName: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="e.g. Green Valley Ranch"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                value={farm.location}
                                onChange={(e) => setFarm({...farm, location: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                placeholder="e.g. 123 Rural Rd, Springfield"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition shadow flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {exists ? 'Update Details' : 'Create Farm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyFarm;
