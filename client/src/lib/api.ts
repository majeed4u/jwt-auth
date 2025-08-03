import axios from "axios";

// Get API URL from environment or fallback to development
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        // Client-side
        return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    } else {
        // Server-side
        return process.env.API_URL || "http://localhost:5000/api/v1";
    }
};

// Create axios instance with default config
const api = axios.create({
    baseURL: getApiUrl(),
    withCredentials: true, // Always send cookies
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging (only in development)
api.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('🚀 Making request to:', config.url);
            console.log('🍪 With credentials:', config.withCredentials);
        }
        return config;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ Request error:', error);
        }
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging (only in development)
api.interceptors.response.use(
    (response) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('✅ Response received:', response.status);
            console.log('🍪 Response headers:', response.headers['set-cookie']);
        }
        return response;
    },
    (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error('❌ Response error:', error.response?.status, error.response?.data);
        }
        return Promise.reject(error);
    }
);

export default api;

