import React from 'react';
import { AlertTriangle, ShieldCheck, Skull } from 'lucide-react';

const DashboardAlerts = ({ alerts, loading, onClear, onClearAll }) => {
  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'DANGEROUS': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: Skull };
      case 'WARNING': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: AlertTriangle };
      case 'SAFE': return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: ShieldCheck };
      default: return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: AlertTriangle };
    }
  };

  if(loading) return <div className="p-4 text-center text-gray-500">Loading alerts...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 text-lg">Live Alerts</h2>
        <div className="flex gap-2">
             <button 
                onClick={onClearAll}
                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 font-medium transition"
             >
                Clear All
             </button>
             <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto space-y-3 max-h-[400px]">
        {alerts.length === 0 ? (
           <div className="text-center py-10 text-gray-400">No active alerts</div>
        ) : (
           alerts.map(alert => {
             const config = getSeverityConfig(alert.severity);
             const Icon = config.icon;
             
             return (
               <div key={alert._id} className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg} ${config.border}`}>
                 <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                      <h4 className={`font-bold text-sm ${config.color} uppercase`}>{alert.animalType} DETECTED</h4>
                      <span className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                   </div>
                   <p className="text-sm text-gray-700 mt-1">
                      Detected in <span className="font-semibold">{alert.zoneName}</span> zone. Risk: <span className={`font-bold ${config.color}`}>{alert.severity}</span>
                   </p>
                 </div>
                 <button 
                    onClick={() => onClear(alert._id)}
                    className="text-gray-400 hover:text-gray-600 px-2"
                 >
                    &times;
                 </button>
               </div>
             )
           })
        )}
      </div>
    </div>
  );
};

export default DashboardAlerts;
