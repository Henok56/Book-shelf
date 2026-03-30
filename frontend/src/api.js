import axios from 'axios'; // <--- CRITICAL: Don't forget this!

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a response interceptor so your services get the data directly
api.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export default api;