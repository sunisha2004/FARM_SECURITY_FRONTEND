import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const StatsCard = ({ title, value, icon: Icon, color, loading }) => {
  const { isDarkMode } = useTheme();

  const colorVariants = {
    emerald: isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700',
    orange: isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700',
    red: isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700',
    blue: isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700',
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`p-6 rounded-3xl border transition-all duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl shadow-black/20' : 'bg-white border-gray-100 shadow-sm'} flex items-center gap-5 ${loading ? 'animate-pulse' : ''}`}
    >
      <div className={`p-4 rounded-2xl transition-colors duration-500 ${colorVariants[color] || colorVariants.emerald}`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{title}</h3>
        <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{loading ? '...' : value}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;
