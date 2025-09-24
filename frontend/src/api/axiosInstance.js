import axios from "axios";

// Environment-aware base URL
const getBaseURL = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback logic for different environments
  if (typeof window !== 'undefined') {
    // Client-side
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    // Production - replace with your actual backend URL
    return 'https://your-backend-url.vercel.app'; // Update this with your actual backend URL
  }
  // Server-side fallback
  return 'http://localhost:8000';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(), // FastAPI backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔒 VERY IMPORTANT: send cookies
});

export default axiosInstance;
