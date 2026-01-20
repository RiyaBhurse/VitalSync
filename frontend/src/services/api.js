import axios from 'axios';
import { Platform } from 'react-native';

// Your Mac's LAN IP for Expo Go physical device testing
const LAN_IP = '10.26.28.160';

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:5001/api';
    }
    return `http://${LAN_IP}:5001/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export default api;
