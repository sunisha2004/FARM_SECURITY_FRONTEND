import React from 'react';
import { MapPin, Map as MapIcon, Shield } from 'lucide-react';
import ZoneMap from './ZoneMap';

const ZoneOverview = ({ zones, loading }) => {
  if (loading) return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
            <MapIcon className="text-green-600" size={20} />
            <h2 className="font-bold text-gray-800 text-lg">Farmland Zone Overview</h2>
        </div>
        <div className="flex gap-2">
             <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Shield size={12} /> {zones.length} Active Zones
             </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Map Section */}
          <div className="lg:col-span-2 p-4">
              <ZoneMap 
                existingZones={zones} 
                isEditing={false} 
                height="400px" 
              />
          </div>

          {/* List Section */}
          <div className="p-4 border-l border-gray-100 space-y-3 overflow-y-auto max-h-[400px]">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Zone Details</h3>
              {zones.length === 0 ? (
                  <div className="text-center py-12">
                      <MapPin size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">No zones defined</p>
                  </div>
              ) : (
                  zones.map(zone => (
                      <div key={zone._id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                          <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      zone.riskLevel === 'critical' ? 'bg-red-50 text-red-600' :
                                      zone.riskLevel === 'high' ? 'bg-orange-50 text-orange-600' : 
                                      zone.riskLevel === 'medium' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                  }`}>
                                      <MapPin size={16} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-800 text-sm group-hover:text-green-700 transition-colors">{zone.zoneName}</h4>
                                      <p className="text-[10px] text-gray-400 capitalize">{zone.category?.replace('_', ' ') || 'Other Area'}</p>
                                  </div>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                                  zone.riskLevel === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                                  zone.riskLevel === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                  zone.riskLevel === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'
                              }`}>
                                  {zone.riskLevel?.toUpperCase() || 'SAFE'}
                              </span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 rounded-lg p-2">
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">Threshold</p>
                                  <p className="text-[10px] font-medium text-gray-700">{zone.thresholds?.animalCount || 1} Animals</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">Rule</p>
                                  <p className="text-[10px] font-medium text-gray-700 capitalize">{zone.securityRules?.alertLevel || 'Warning'}</p>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default ZoneOverview;
