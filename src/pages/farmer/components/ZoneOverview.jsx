import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Map as MapIcon, Shield, ChevronRight, Target, Zap } from 'lucide-react';
import ZoneMap from './ZoneMap';
import { useTheme } from '../../../context/ThemeContext';

const ZoneOverview = ({ zones, loading }) => {
  const { isDarkMode } = useTheme();

  const themeClasses = {
    card: isDarkMode ? 'bg-gray-900 border-gray-800 shadow-2xl shadow-black/40' : 'bg-white border-gray-100 shadow-sm',
    header: isDarkMode ? 'bg-gray-950/50 border-gray-800' : 'bg-gray-50/50 border-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-800',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    item: isDarkMode ? 'bg-gray-800/40 border-gray-700 hover:bg-gray-800/60' : 'bg-white border-gray-100 hover:bg-gray-50',
    subItem: isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50',
  };

  if (loading) return (
    <div className={`rounded-3xl border p-12 flex flex-col items-center justify-center animate-pulse ${themeClasses.card}`}>
        <div className="w-12 h-12 rounded-2xl border-2 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
        <p className={`font-bold tracking-tight ${themeClasses.muted}`}>Initializing Map Data...</p>
    </div>
  );

  return (
    <div className={`rounded-3xl border overflow-hidden transition-colors duration-500 ${themeClasses.card}`}>
       <div className={`p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${themeClasses.header}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                <MapIcon size={22} />
            </div>
            <div>
                <h2 className={`font-bold text-xl tracking-tight ${themeClasses.text}`}>Farmland Zone Overview</h2>
                <p className={`text-xs font-medium ${themeClasses.muted}`}>Geospatial monitoring of farm boundaries</p>
            </div>
        </div>
        <div className="flex gap-2">
             <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5' : 'bg-green-100 text-green-700 border-green-200 shadow-green-500/5'}`}>
                <Shield size={12} /> {zones.length} Active Zones
             </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Map Section */}
          <div className={`lg:col-span-2 p-6 transition-colors duration-500 ${isDarkMode ? 'bg-gray-950/30' : 'bg-white'}`}>
              <div className={`rounded-2xl overflow-hidden border-4 ${isDarkMode ? 'border-gray-800/50 shadow-inner' : 'border-gray-50'}`}>
                  <ZoneMap 
                    existingZones={zones} 
                    isEditing={false} 
                    height="450px" 
                  />
              </div>
          </div>

          {/* List Section */}
          <div className={`p-6 border-l flex flex-col transition-colors duration-500 ${isDarkMode ? 'border-gray-800 bg-gray-900/40' : 'border-gray-100 bg-gray-50/20'}`}>
              <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 px-1 ${themeClasses.muted}`}>Zone Repository</h3>
              
              <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
                  {zones.length === 0 ? (
                      <div className="text-center py-20 flex flex-col items-center">
                          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border shadow-sm'}`}>
                             <MapPin size={32} className="text-gray-300" />
                          </div>
                          <p className={`text-sm font-bold uppercase tracking-tight ${themeClasses.muted}`}>No zones defined</p>
                          <button className="mt-4 text-emerald-500 text-xs font-black uppercase hover:underline">Define boundaries</button>
                      </div>
                  ) : (
                      zones.map((zone, idx) => (
                          <motion.div 
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.05 }}
                             key={zone._id} 
                             className={`p-4 border rounded-2xl transition-all duration-300 group cursor-pointer hover:shadow-lg ${themeClasses.item}`}
                          >
                              <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 ${
                                          zone.riskLevel === 'critical' ? 'bg-red-500/20 text-red-500' :
                                          zone.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-500' : 
                                          zone.riskLevel === 'medium' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'
                                      }`}>
                                          <Target size={18} />
                                      </div>
                                      <div className="min-w-0">
                                          <h4 className={`font-black text-sm truncate tracking-tight transition-colors group-hover:text-emerald-500 ${themeClasses.text}`}>{zone.zoneName}</h4>
                                          <p className={`text-[10px] font-bold uppercase tracking-widest ${themeClasses.muted}`}>{zone.category?.replace('_', ' ') || 'General Area'}</p>
                                      </div>
                                  </div>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black border uppercase tracking-tighter ${
                                      zone.riskLevel === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                      zone.riskLevel === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                      zone.riskLevel === 'medium' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                  }`}>
                                      {zone.riskLevel || 'SAFE'}
                                  </span>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-2 gap-3">
                                  <div className={`rounded-xl p-2.5 flex flex-col gap-0.5 transition-colors ${themeClasses.subItem}`}>
                                      <p className={`text-[8px] font-black uppercase tracking-wider ${themeClasses.muted}`}>Sensitiveness</p>
                                      <div className="flex items-center gap-1.5 ">
                                         <Zap size={10} className="text-emerald-500" />
                                         <p className={`text-[10px] font-black ${themeClasses.text}`}>{zone.thresholds?.animalCount || 1} Units</p>
                                      </div>
                                  </div>
                                  <div className={`rounded-xl p-2.5 flex flex-col gap-0.5 transition-colors ${themeClasses.subItem}`}>
                                      <p className={`text-[8px] font-black uppercase tracking-wider ${themeClasses.muted}`}>Protocol</p>
                                      <p className={`text-[10px] font-black transition-colors group-hover:text-emerald-500 ${themeClasses.text}`}>{zone.securityRules?.alertLevel || 'Standard'}</p>
                                  </div>
                              </div>
                          </motion.div>
                      ))
                  )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-gray-100/10">
                 <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                    View Full Geospatial Data <ChevronRight size={14} />
                 </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ZoneOverview;
