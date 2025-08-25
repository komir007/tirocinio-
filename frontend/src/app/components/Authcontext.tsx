"use client";
import React, { createContext, useState, useEffect, useRef } from "react";
import { User, Role } from "../type/auth";

export interface AuthContextType {
  user: User | null | undefined; // undefined = inizializzazione in corso
  role: Role;
  login: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    user?: User;
    role?: Role;
    message?: string;
  }>;
  logout: () => void;
  loading: boolean;
  fetchWithAuth?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = ancora inizializzando
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const logoutTimerRef = useRef<number | null>(null);

  const clearLogoutTimer = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  const scheduleLogout = (expSeconds?: number) => {
    clearLogoutTimer();
    if (!expSeconds) return;
    const ms = expSeconds * 1000 - Date.now();
    if (ms <= 0) {
      // già scaduto
      handleLogoutClean();
    } else {
      logoutTimerRef.current = window.setTimeout(() => {
        handleLogoutClean();
      }, ms);
    }
  };

  const handleLogoutClean = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("accessToken");
    clearLogoutTimer();
  };

  useEffect(() => {
    setLoading(true);
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      const payloadBase64 = storedToken.split(".")[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const exp = decodedPayload.exp as number | undefined;
      // se scaduto -> rimuovi e logout
      if (exp && Date.now() / 1000 > exp) {
        handleLogoutClean();
        setLoading(false);
        return;
      }
      const currentUser: User = {
        id: decodedPayload.sub,
        name: decodedPayload.name || "Utente",
        email: decodedPayload.email || "email@example.com",
        role: decodedPayload.role as Role,
      };
      setUser(currentUser);
      setRole(currentUser.role);
      if (exp) scheduleLogout(exp);
    } catch (e) {
      console.error("Errore nel decodificare il token:", e);
      handleLogoutClean();
    } finally {
      setLoading(false);
    }

    return () => clearLogoutTimer();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        localStorage.setItem("accessToken", data.access_token);
        const payloadBase64 = data.access_token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const loggedInUser: User = {
          id: decodedPayload.sub,
          name: decodedPayload.name || "Utente",
          email: decodedPayload.email || "email@example.com",
          role: decodedPayload.role as Role,
        };
        setUser(loggedInUser);
        setRole(loggedInUser.role);
        if (decodedPayload.exp) scheduleLogout(decodedPayload.exp);
        return { success: true, user: loggedInUser, role: loggedInUser.role };
      } else {
        throw new Error(data.message || "Credenziali non valide.");
      }
    } catch (err: any) {
      console.error("Errore durante il login:", err);
      return {
        success: false,
        message: err.message || "Errore di rete o del server.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    handleLogoutClean();
  };

  // fetch wrapper che include Authorization e gestisce 401/403
  const fetchWithAuth = async (input: RequestInfo, init: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    // preserve content-type if already set
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 || res.status === 403) {
      // token non valido / scaduto lato server: puliamo stato e notifichiamo chiamante
      handleLogoutClean();
      // opzionale: force redirect a /login -> lasciamo ai consumer la decisione
      throw new Error("Unauthorized");
    }
    return res;
  };

  const contextValue: AuthContextType = {
    user,
    role,
    login,
    logout,
    loading,
    fetchWithAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
