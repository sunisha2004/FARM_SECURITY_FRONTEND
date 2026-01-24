import axios from 'axios';

const API_URL = 'http://localhost:5000/api/farmer/zones/';

// Get user token
const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Create new zone
const createZone = async (zoneData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    };
    const response = await axios.post(API_URL, zoneData, config);
    return response.data;
};

// Get user zones
const getZones = async () => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Update zone
const updateZone = async (id, zoneData) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    };
    const response = await axios.put(API_URL + id, zoneData, config);
    return response.data;
};

// Delete zone
const deleteZone = async (id) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    };
    const response = await axios.delete(API_URL + id, config);
    return response.data;
};

const zoneService = {
    createZone,
    getZones,
    updateZone,
    deleteZone,
};

export default zoneService;
