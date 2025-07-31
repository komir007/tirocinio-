'use client'
import React, { useState } from 'react';
import { AppProps } from 'next/app'; // Importa AppProps da next/app
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './components/Authcontext';
import { theme } from '../../theme/muiTheme';
import Navbar from './components/Navbar'; // Importa la Navbar

// Importa le pagine che useremo per la navigazione interna, dato che non usiamo next/router
// Assicurati che questi import si riferiscano ai nuovi file .tsx
import HomePage from './index';
import LoginPage from './login';
import UsersPage from './users';
import RegisterPage from './register';
import EditUserPage from './edit-user'; // Importa la pagina di modifica

// Importa i CSS globali (per il body)
import './globals.css';

// Definisci un tipo per setCurrentPage per passarlo alle pagine
type SetCurrentPage = (page: string) => void;

export default function App({ Component, pageProps }: AppProps) {
  const [currentPage, setCurrentPage] = useState<string>('login'); // Stato per gestire la pagina corrente

  // Funzione per renderizzare la pagina basata sullo stato
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'users':
        return <UsersPage setCurrentPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage setCurrentPage={setCurrentPage} />;
      case 'edit-user':
        return <EditUserPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <>
      {/* CDN per Tailwind CSS e Google Fonts (Inter) */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <ThemeProvider theme={theme}>
        <CssBaseline /> {/* Fornisce una base coerente per lo stile */}
        <AuthProvider>
          {/* La Navbar ora riceve setCurrentPage per navigare */}

          {/* <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage}/> */}
          {renderPage()} {/* Renderizza la pagina corrente */}
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}