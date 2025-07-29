import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { AuthContext, AuthContextType } from './Authcontext'; // Importa AuthContext e AuthContextType

// Definisci un tipo per le props della Navbar
interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  // Specifica il tipo per il contesto
  const { user, role, logout } = useContext(AuthContext) as AuthContextType;

  const handleLogout = () => {
    logout();
    setCurrentPage('home'); // Reindirizza alla home dopo il logout
  };

  return (
    <AppBar position="static" className="shadow-md rounded-b-lg">
      <Toolbar className="flex justify-between items-center px-4 py-2">
        <Typography variant="h6" className="text-white font-bold cursor-pointer" onClick={() => setCurrentPage('home')}>
          App Utenti
        </Typography>
        <Box className="flex space-x-4">
          <Button color="inherit" onClick={() => setCurrentPage('home')}>Homepage</Button>
          {user ? (
            <>
              {(role === 'admin' || role === 'agent') && (
                <Button color="inherit" onClick={() => setCurrentPage('users')}>Lista Utenti</Button>
              )}
              <Button color="inherit" onClick={handleLogout}>Logout ({user.name})</Button>
            </>
          ) : (
            <Button color="inherit" onClick={() => setCurrentPage('login')}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;