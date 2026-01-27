import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    const data = await authService.login(userData);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const updateUser = (updatedData) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const newUser = { ...currentUser, ...updatedData };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
