import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      if (!token) return;

      const { data } = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(data);
      setUnreadCount(data.filter(a => !a.isRead).length);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.put(`http://localhost:5000/api/alerts/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  // Poll for alerts every 10 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, unreadCount, fetchAlerts, markAsRead }}>
      {children}
    </AlertContext.Provider>
  );
};
