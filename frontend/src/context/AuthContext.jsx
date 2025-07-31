import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axiosInstance";

// Create the context
const AuthContext = createContext(null); // 📌 Start with null as default

// Export hook for easy access later
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap App
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // 🧑‍💻 stores user object
  const [loading, setLoading] = useState(true);  // ⏳ shows loading while checking

  // ✅ 1. Check if logged in on first load
useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axios.get("/protected"); // ✅ Uses withCredentials
      setUser(res.data.user); // 👈 Expecting backend returns { user: {...} }
    } catch (err) {
      setUser(null); // ❌ Not logged in
    } finally {
      setLoading(false); // ✅ Either way we're done loading
    }
  };

  checkAuth(); // 👈 call it
}, []);

  // ✅ 2. Logout (calls backend to clear cookie)
  const logout = async () => {
    await fetch("http://127.0.0.1:8000/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null); // 🧹 Clear user on logout
  };

  const value = {
    user,
    loading,
    isLoggedIn: !!user,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* 👇 render children after check */}
    </AuthContext.Provider>
  );
};
