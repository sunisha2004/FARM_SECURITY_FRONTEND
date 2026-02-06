import React, { useEffect } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { AlertCircle, CheckCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AlertList = () => {
    const { alerts, fetchAlerts, markAsRead } = useAlerts();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if(!window.confirm("Delete this alert?")) return;
        
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.delete(`http://localhost:5000/api/alerts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlerts(); // Refresh
        } catch(err) {
            console.error("Delete failed", err);
            alert("Failed to delete alert");
        }
    };

    const handleClearAll = async () => {
        if(!window.confirm("Are you sure you want to delete ALL alerts? This cannot be undone.")) return;
        
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await axios.delete('http://localhost:5000/api/alerts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAlerts(); 
        } catch(err) {
            console.error(err);
            alert("Failed to clear all alerts");
        }
    };

    return (
        <div className="container mx-auto max-w-4xl p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <ShieldAlert className="text-red-600" size={32} />
                    Security Alerts
                </h1>
                {alerts.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 border border-red-200"
                    >
                        <Trash2 size={18} />
                        Clear All History
                    </button>
                )}
            </div>
            
            <div className="grid gap-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900">No Security Alerts</h3>
                        <p className="text-gray-500">Your farm is currently safe.</p>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div 
                            key={alert._id} 
                            onClick={() => {
                                if(!alert.isRead) markAsRead(alert._id);
                                navigate(`/farmer/alerts/${alert._id}`);
                            }}
                            className={`relative p-5 rounded-lg border-l-4 shadow-sm transition-all cursor-pointer group ${
                                alert.severity === 'HIGH' 
                                ? 'bg-red-50 border-red-500 hover:bg-red-100' 
                                : 'bg-white border-green-500 hover:bg-gray-50'
                            } ${!alert.isRead ? 'ring-2 ring-blue-500 ring-offset-2' : 'opacity-80'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className={`p-2 rounded-full h-fit ${
                                        alert.severity === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                alert.severity === 'HIGH' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                                            }`}>
                                                {alert.severity} PRIORITY
                                            </span>
                                            {!alert.isRead && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-lg text-gray-900 mb-1">
                                            {alert.message}
                                        </h4>
                                        <p className="text-sm text-gray-600 font-mono">
                                            Time: {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                     {alert.isRead && (
                                        <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">
                                            Read
                                        </span>
                                    )}
                                    <button 
                                        onClick={(e) => handleDelete(e, alert._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors z-10"
                                        title="Delete Alert"
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

export default AlertList;
