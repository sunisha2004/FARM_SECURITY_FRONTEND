import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AnimalActivity = ({ mostFrequent, lastDetected, loading }) => {
  const { isDarkMode } = useTheme();

  const themeClasses = {
    card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
    header: isDarkMode ? 'border-gray-800' : 'border-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-800',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`rounded-3xl border shadow-xl h-full flex flex-col overflow-hidden transition-colors duration-500 ${themeClasses.card}`}>
         <div className={`p-6 border-b flex items-center gap-3 ${themeClasses.header}`}>
            <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                <Activity size={20} />
            </div>
            <h2 className={`font-bold text-xl tracking-tight ${themeClasses.text}`}>Animal Activity</h2>
         </div>
         <div className="p-6 space-y-6 flex-1">
             <motion.div 
               whileHover={{ x: 5 }}
               className="flex items-center gap-5 p-4 rounded-2xl transition-colors duration-300 hover:bg-white/5"
             >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                     <Activity size={28} />
                 </div>
                 <div>
                     <p className={`text-xs font-bold uppercase tracking-widest ${themeClasses.muted}`}>Most Frequent</p>
                     <h3 className={`text-2xl font-black capitalize mt-1 ${themeClasses.text}`}>{loading ? '...' : mostFrequent || 'None'}</h3>
                     <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">Peak activity today</p>
                 </div>
             </motion.div>
             
             <div className={`h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}></div>

             <motion.div 
               whileHover={{ x: 5 }}
               className="flex items-center gap-5 p-4 rounded-2xl transition-colors duration-300 hover:bg-white/5"
             >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 ${isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700'}`}>
                     <Clock size={28} />
                 </div>
                 <div className="flex-1 min-w-0">
                     <p className={`text-xs font-bold uppercase tracking-widest ${themeClasses.muted}`}>Last Detection</p>
                     {loading ? (
                         <div className={`h-8 w-32 mt-2 animate-pulse rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                     ) : lastDetected ? (
                        <div className="mt-1">
                             <h3 className={`text-xl font-black capitalize truncate ${themeClasses.text}`}>{lastDetected.animal}</h3>
                             <p className={`text-xs font-medium mt-0.5 truncate ${themeClasses.muted}`}>
                                 In <span className="text-emerald-500 font-bold uppercase">{lastDetected.zone}</span> at {new Date(lastDetected.time).toLocaleTimeString()}
                             </p>
                        </div>
                     ) : (
                         <p className={`text-lg font-bold mt-1 ${themeClasses.muted}`}>No detections yet</p>
                     )}
                 </div>
             </motion.div>

             {/* Dynamic insight card */}
             <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                <ShieldCheck size={18} className="shrink-0" />
                <p className="text-[10px] font-bold uppercase leading-tight">Artificial Intelligence monitoring active for all linked zones</p>
             </div>
         </div>
    </div>
  );
};

export default AnimalActivity;

