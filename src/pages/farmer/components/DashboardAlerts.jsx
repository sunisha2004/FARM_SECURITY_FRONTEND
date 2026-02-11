import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Skull, Bell, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const DashboardAlerts = ({ alerts, loading, onClear, onClearAll }) => {
  const { isDarkMode } = useTheme();

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'DANGEROUS': return { color: 'text-red-500', bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50', border: 'border-red-500/20', icon: Skull };
      case 'WARNING': return { color: 'text-orange-500', bg: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50', border: 'border-orange-500/20', icon: AlertTriangle };
      case 'SAFE': return { color: 'text-emerald-500', bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50', border: 'border-emerald-500/20', icon: ShieldCheck };
      default: return { color: 'text-gray-500', bg: isDarkMode ? 'bg-gray-500/10' : 'bg-gray-50', border: 'border-gray-500/20', icon: Bell };
    }
  };

  const themeClasses = {
    card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
    header: isDarkMode ? 'border-gray-800' : 'border-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-800',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  if(loading) return (
    <div className={`p-12 text-center rounded-3xl border animate-pulse ${themeClasses.card} ${themeClasses.muted}`}>
      <Bell size={40} className="mx-auto mb-4 opacity-20" />
      Loading live alerts...
    </div>
  );

  return (
    <div className={`rounded-3xl border shadow-xl flex flex-col h-full overflow-hidden transition-colors duration-500 ${themeClasses.card}`}>
      <div className={`p-6 border-b flex justify-between items-center ${themeClasses.header}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700'}`}>
            <Bell size={20} />
          </div>
          <h2 className={`font-bold text-xl tracking-tight ${themeClasses.text}`}>Live Alerts</h2>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={onClearAll}
                className={`text-xs px-4 py-2 rounded-xl font-bold transition-all duration-300 active:scale-95 ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
             >
                Clear All
             </button>
        </div>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[450px] scrollbar-thin scrollbar-thumb-gray-800">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-20"
             >
                <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <ShieldCheck className="text-emerald-500" size={32} />
                </div>
                <p className={`font-bold ${themeClasses.text}`}>All systems clear</p>
                <p className={`text-sm mt-1 ${themeClasses.muted}`}>No active alerts detected</p>
             </motion.div>
          ) : (
             alerts.map((alert, idx) => {
               const config = getSeverityConfig(alert.severity);
               const Icon = config.icon;
               
               return (
                 <motion.div 
                   key={alert._id} 
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   transition={{ delay: idx * 0.05 }}
                   className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${config.bg} ${config.border}`}
                 >
                   <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${config.color}`}>
                     <Icon size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-center mb-1">
                        <h4 className={`font-black text-xs uppercase tracking-widest ${config.color}`}>{alert.animalType} Alert</h4>
                        <span className={`text-[10px] font-bold ${themeClasses.muted}`}>{new Date(alert.createdAt).toLocaleTimeString()}</span>
                     </div>
                     <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Intrusion detected in <span className="font-black text-emerald-500">{alert.zoneName}</span> zone. Risk Level: <span className={`font-black ${config.color}`}>{alert.severity}</span>
                     </p>
                   </div>
                   <button 
                      onClick={() => onClear(alert._id)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                   >
                      <X size={18} />
                   </button>
                 </motion.div>
               )
             })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardAlerts;
