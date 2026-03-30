import axios from 'axios';

/**
 * 1. DYNAMIC BASE URL
 * This automatically picks the right URL based on where the app is running.
 * 'import.meta.env.VITE_API_URL' comes from your .env or Vercel settings.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debugging: This will now show the REAL URL in your browser console
        console.log(`🚀 Sending ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
    (response) => {
        // Return response.data so components don't need to call .data
        return response.data;
    },
    (error) => {
        const message = error.response?.data?.message || "A network error occurred";

        if (error.response) {
            console.error(`❌ Backend Error (${error.response.status}):`, message);
        } else if (error.request) {
            console.error("📡 No response from server. Is the backend URL correct?");
            console.error("Current Base URL attempted:", BASE_URL);
        } else {
            console.error("⚙️ Request Setup Error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;