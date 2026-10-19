import React, { createContext, useContext, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cadd_user") || "null"); }
    catch { return null; }
  });

  async function login(email, password) {
    const result = await loginRequest(email, password);
    const token = result.token || result.accessToken || result.data?.token;
    const profile = result.user || result.data?.user || { email, name: email.split("@")[0] };
    if (token) localStorage.setItem("cadd_token", token);
    localStorage.setItem("cadd_user", JSON.stringify(profile));
    setUser(profile);
    return result;
  }

  async function register(payload) {
    const result = await registerRequest(payload);
    const token = result.token || result.accessToken || result.data?.token;
    const profile = result.user || result.data?.user || { name: payload.name || payload.full_name, email: payload.email, role: payload.role };
    if (token) localStorage.setItem("cadd_token", token);
    localStorage.setItem("cadd_user", JSON.stringify(profile));
    setUser(profile);
    return result;
  }

  function logout() {
    localStorage.removeItem("cadd_token");
    localStorage.removeItem("cadd_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
