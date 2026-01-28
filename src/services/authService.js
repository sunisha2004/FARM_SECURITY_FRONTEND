import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/';
const USER_URL = 'http://localhost:5000/api/users/';

const register = async (userData) => {
  // If userData is FormData, send it directly; otherwise wrap in JSON
  const config = userData instanceof FormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {};
  
  const response = await axios.post(API_URL + 'register', userData, config);
  return response.data;
};

const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getMe = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return null;
    
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(USER_URL + 'me', config);
    return response.data;
}

const updateMe = async (data) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    
    if (data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    const response = await axios.put(USER_URL + 'me', data, config);
    return response.data;
}

const authService = {
  register,
  login,
  logout,
  getMe,
  updateMe
};

export default authService;
