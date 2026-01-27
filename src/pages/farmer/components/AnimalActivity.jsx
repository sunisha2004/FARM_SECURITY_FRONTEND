import React from 'react';
import { Activity, Clock } from 'lucide-react';

const AnimalActivity = ({ mostFrequent, lastDetected, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full">
         <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">Animal Activity</h2>
         </div>
         <div className="p-6 space-y-6">
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <Activity size={24} />
                 </div>
                 <div>
                     <p className="text-gray-500 text-sm">Most Frequent</p>
                     <h3 className="text-xl font-bold text-gray-800 capitalize">{loading ? '...' : mostFrequent || 'None'}</h3>
                     <p className="text-xs text-gray-400">Detected today</p>
                 </div>
             </div>
             
             <div className="h-px bg-gray-100"></div>

             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600">
                     <Clock size={24} />
                 </div>
                 <div>
                     <p className="text-gray-500 text-sm">Last Detection</p>
                     {loading ? (
                         <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                     ) : lastDetected ? (
                        <>
                             <h3 className="text-lg font-bold text-gray-800 capitalize">{lastDetected.animal}</h3>
                             <p className="text-xs text-gray-500">
                                 in <span className="font-semibold">{lastDetected.zone}</span> at {new Date(lastDetected.time).toLocaleTimeString()}
                             </p>
                        </>
                     ) : (
                         <p className="text-gray-400 font-bold">No detections</p>
                     )}
                 </div>
             </div>
         </div>
    </div>
  );
};

export default AnimalActivity;
