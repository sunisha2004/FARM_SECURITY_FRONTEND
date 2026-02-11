import { useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AxiosInterceptor = ({ children }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.log('Token expired or unauthorized. Logging out...');
                    logout();
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [logout, navigate]);

    return children;
};

export default AxiosInterceptor;
