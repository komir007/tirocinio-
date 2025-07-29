import React, { createContext, useState, useEffect } from 'react';
import { CircularProgress, Typography } from '@mui/material';

// Definisci i tipi per utente e ruolo
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role; // Aggiungi il ruolo qui per coerenza
}

export type Role = 'admin' | 'agent' | 'client' | null;

// Definisci l'interfaccia per il valore del contesto di autenticazione
export interface AuthContextType {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; role?: Role; message?: string }>;
  logout: () => void;
  loading: boolean;
}

// Crea il contesto con un valore iniziale che corrisponde all'interfaccia
// Il valore iniziale può essere null, ma poi lo castiamo per TypeScript
export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null); // 'admin', 'agent', 'client'
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate checking for a stored token/session on mount
    const storedUser = localStorage.getItem('currentUser');
    const storedRole = localStorage.getItem('currentRole');
    if (storedUser && storedRole) {
      try {
        setUser(JSON.parse(storedUser));
        setRole(storedRole as Role); // Cast a Role
      } catch (e) {
        console.error("Failed to parse stored user or role:", e);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call to NestJS for login
    setLoading(true);
    return new Promise<{ success: boolean; user?: User; role?: Role; message?: string }>((resolve, reject) => {
      setTimeout(() => { // Simulate network delay
        let loggedInUser: User | null = null;
        let loggedInRole: Role = null;

        if (email === 'admin@example.com' && password === 'admin123') {
          loggedInUser = { id: 'admin-1', name: 'Amministratore', email: 'admin@example.com', role: 'admin' };
          loggedInRole = 'admin';
        } else if (email === 'agent@example.com' && password === 'agent123') {
          loggedInUser = { id: 'agent-1', name: 'Agente Mario', email: 'agent@example.com', role: 'agent' };
          loggedInRole = 'agent';
        } else if (email === 'client@example.com' && password === 'client123') {
          loggedInUser = { id: 'client-1', name: 'Cliente Paolo', email: 'client@example.com', role: 'client' };
          loggedInRole = 'client';
        } else {
          setLoading(false);
          reject({ success: false, message: 'Credenziali non valide.' });
          return;
        }

        setUser(loggedInUser);
        setRole(loggedInRole);
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        localStorage.setItem('currentRole', loggedInRole);
        setLoading(false);
        resolve({ success: true, user: loggedInUser, role: loggedInRole });
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    // In a real app, you'd also invalidate the token on the backend
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A2E] text-white">
        <CircularProgress color="inherit" />
        <Typography variant="h6" className="ml-4">Caricamento...</Typography>
      </div>
    );
  }

  // Il valore del contesto deve corrispondere all'interfaccia AuthContextType
  const contextValue: AuthContextType = {
    user,
    role,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
