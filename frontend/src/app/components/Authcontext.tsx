import React, { createContext, useState, useEffect } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { User, Role } from '../types/auth'; // Importa User e Role dal nuovo file

// Definisci l'interfaccia per il valore del contesto di autenticazione
export interface AuthContextType {
  user: User | null;
  role: Role;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; role?: Role; message?: string }>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Ottieni l'URL base dell'API dalle variabili d'ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const payloadBase64 = storedToken.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64)); // Decodifica il payload del JWT
        
        const currentUser: User = {
          id: decodedPayload.sub, // 
          name: decodedPayload.name || 'Utente',
          email: decodedPayload.email || 'email@example.com', 
          role: decodedPayload.role as Role, 
        };
        setUser(currentUser);
        setRole(currentUser.role);
      } catch (e) {
        console.error("Errore nel decodificare il token o nel recuperare l'utente:", e);
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { // Endpoint di login NestJS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Se il login ha successo, salva il token e i dati utente
        localStorage.setItem('accessToken', data.access_token);
        // Decodifica il token per ottenere i dettagli dell'utente e il ruolo
        const payloadBase64 = data.access_token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        const loggedInUser: User = {
          id: decodedPayload.sub,
          name: decodedPayload.name || 'Utente',
          email: decodedPayload.email || 'email@example.com',
          role: decodedPayload.role as Role,
        };

        setUser(loggedInUser);
        setRole(loggedInUser.role);
        return { success: true, user: loggedInUser, role: loggedInUser.role };
      } else {
        // Gestisci errori di login dal backend
        throw new Error(data.message || 'Credenziali non valide.');
      }
    } catch (err: any) {
      console.error("Errore durante il login:", err);
      return { success: false, message: err.message || 'Errore di rete o del server.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('accessToken'); 
    
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A2E] text-white">
        <CircularProgress color="inherit" />
        <Typography variant="h6" className="ml-4">Caricamento...</Typography>
      </div>
    );
  }

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

