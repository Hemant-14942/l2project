import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000", // FastAPI backend
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 🔒 VERY IMPORTANT: send cookies
});

export default axiosInstance;
