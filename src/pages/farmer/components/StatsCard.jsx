import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, loading }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-105 ${loading ? 'animate-pulse' : ''}`}>
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{loading ? '...' : value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
