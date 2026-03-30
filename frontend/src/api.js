import axios from 'axios';

/**
 * Create an Axios instance with a custom config.
 * This allows us to change the base URL in one place 
 * if your backend moves (e.g., from localhost to a server).
 */
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- REQUEST INTERCEPTOR ---
// This runs BEFORE every request leaves your frontend.
api.interceptors.request.use(
    (config) => {
        // Example: If you have a token in localStorage, add it to headers
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 Sending ${config.method.toUpperCase()} request to ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- RESPONSE INTERCEPTOR ---
// This runs AFTER a response comes back from the server, but BEFORE it reaches your .then() or try/catch.
api.interceptors.response.use(
    (response) => {
        // You can extract the data here so you don't have to write .data in every component
        return response.data;
    },
    (error) => {
        // CENTRALIZED ERROR HANDLING
        const message = error.response?.data?.message || "A network error occurred";

        if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.error(`❌ Backend Error (${error.response.status}):`, message);
            
            if (error.response.status === 401) {
                console.warn("Unauthorized! Redirecting to login...");
                // window.location.href = '/login'; 
            }
        } else if (error.request) {
            // Request was made but no response was received
            console.error("📡 No response from server. Check if your backend is running!");
        } else {
            console.error("⚙️ Request Setup Error:", error.message);
        }

        return Promise.reject(error);
    }
);

export default api;