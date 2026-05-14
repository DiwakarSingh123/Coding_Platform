
import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Automatically handle expired tokens (401 Unauthorized)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid, redirect to login
            // Using window.location to force a redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;