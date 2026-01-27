import React from 'react';
import { MapPin } from 'lucide-react';

const ZoneOverview = ({ zones, loading }) => {
  if (loading) return <div>Loading zones...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
       <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 text-lg">Zone Overview</h2>
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">Manage Zones</button>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {zones.map(zone => (
              <div key={zone._id} className="p-4 border border-gray-200 rounded-lg md:flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                          <MapPin size={20} />
                      </div>
                      <div>
                          <h4 className="font-bold text-gray-800">{zone.zoneName}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                              zone.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 
                              zone.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                          }`}>
                              {zone.riskLevel ? zone.riskLevel.toUpperCase() : 'SAFE'}
                          </span>
                      </div>
                  </div>
                  <div className="mt-3 md:mt-0 text-right">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="font-medium text-green-600">Active</p>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default ZoneOverview;
