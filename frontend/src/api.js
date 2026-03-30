import axios from 'axios';

// This handles the switch between your local machine and Render
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor to simplify data access (returns response.data automatically)
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error("📡 API Error:", error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

// CRITICAL: This was the cause of your "Missing Export" error
export default api;