import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

// Create the context
const AuthContext = createContext(null);

// Export hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hideNavbar, setHideNavbar] = useState(false); // 👈 added for Navbar control
  const [basicSummary, setBasicSummary] = useState("");
  const [dashscores, setDashScores] = useState({});

  // 🔐 Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/user/me");
        setUser(res.data.username);
        console.log("User:", res.data);
        
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 🚪 Logout
  const logout = async () => {
    await fetch("http://127.0.0.1:8000/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    logout,
    hideNavbar,
    setHideNavbar, 
    basicSummary,
    setBasicSummary,
    setDashScores,
    dashscores,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
