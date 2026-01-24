import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, AlertTriangle, CheckCircle, MapPin, Calendar, Video, ShieldAlert } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

const AlertDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { markAsRead } = useAlerts(); // If we want to ensure it's marked read on view
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlert = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const { data } = await axios.get(`http://localhost:5000/api/alerts`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                
                // Since we don't have a direct "get single alert" endpoint in controller yet (only get all),
                // we find it locally or we could add specific endpoint.
                // Given the tasks, adding a specific endpoint wasn't strictly asked if we can find it here.
                // However, fetching ALL to find ONE is inefficient.
                // But for now, let's use the list for simplicity unless user complaints.
                // Wait, I can probably filter the list from context if I had access to all.
                
                // BETTER: Just filter the response data.
                const found = data.find(a => a._id === id);
                setAlert(found);
                
                if(found && !found.isRead) {
                    markAsRead(id);
                }
            } catch (err) {
                console.error("Failed to load alert", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlert();
    }, [id]);

    if(loading) return <div className="p-10 text-center">Loading details...</div>;
    if(!alert) return <div className="p-10 text-center">Alert not found.</div>;

    return (
        <div className="container mx-auto max-w-2xl p-6">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 mb-6 hover:text-green-600 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Alerts
            </button>

            <div className={`bg-white rounded-xl shadow-lg border-t-8 overflow-hidden ${
                alert.severity === 'HIGH' ? 'border-red-500' : 'border-green-500'
            }`}>
                <div className={`p-6 ${alert.severity === 'HIGH' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        {alert.severity === 'HIGH' ? (
                            <ShieldAlert className="text-red-600 w-12 h-12" />
                        ) : (
                            <CheckCircle className="text-green-600 w-12 h-12" />
                        )}
                        <div>
                            <span className={`text-xs font-bold px-2 py-1 rounded infinite tracking-wider ${
                                alert.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                            }`}>
                                {alert.severity} PRIORITY
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 mt-2">{alert.message}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <AlertTriangle size={12} /> Detected Animal
                            </p>
                            <p className="text-lg font-mono font-bold text-gray-800 capitalize">
                                {alert.animalType}
                            </p>
                        </div>
                         <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <MapPin size={12} /> Zone
                            </p>
                            <p className="text-lg font-mono font-bold text-gray-800">
                                {alert.zoneName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg">
                        <Calendar className="text-gray-400" />
                        <div>
                            <p className="text-xs text-gray-500">Timestamp</p>
                            <p className="font-medium text-gray-900">
                                {new Date(alert.createdAt).toLocaleString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    
                    {/* Link to video source? If we had videoId stored in alert, we could link back. 
                        I added zoneId, but did I add videoId to Alert Model?
                        Controller saves it?
                        Let's check controller. 
                        Controller receives videoId but schema might NOT have it.
                        Wait, schema check needed.
                    */}
                </div>
            </div>
        </div>
    );
};

export default AlertDetails;
