import React, { useContext } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
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
    console.log(user);
    logout();
    setCurrentPage('login'); // Reindirizza alla login dopo il logout
  };

  return (
    <AppBar
      position="fixed"
      sx={{
      top: 0,
      left: 0,
      width: 220,
      height: '100vh',
      boxShadow: 2,
      borderRadius: '0 0.5rem 0.5rem 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      px: 2,
      py: 4,
      }}
    >
      <Toolbar
      sx={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 3,
        minHeight: 'unset',
        p: 0,
        height: '100%',
      }}
      >
      <Typography
        variant="h6"
        sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', mb: 2 }}
        onClick={() => setCurrentPage('home')}
      >
        App 
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {user && (
          <Box
        sx={{
          background: '#518997',
          borderRadius: 2,
          p: 2,
          mb: 2,
          textAlign: 'center',
        }}
          >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
          {user.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'white', textTransform: 'lowercase' }}>
          {role}
        </Typography>
          </Box>
        )}
        <Button color="inherit" onClick={() => setCurrentPage('home')}>Home</Button>
        {user && (role === 'admin' || role === 'agent') && (
          <Button color="inherit" onClick={() => setCurrentPage('users')}>Utenti</Button>
        )}
        {!user && (
          <Button color="inherit" onClick={() => setCurrentPage('login')}>Login</Button>
        )}
      </Box>
            {user && (
        <Box sx={{ flexGrow: 1 }} />
            )}
            {user && (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            onClick={handleLogout}
            sx={{
              backgroundColor: 'red',
              color: 'white',
              minWidth: 0,
              width: 48,
              height: 48,
              borderRadius: '50%',
              mt: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
          backgroundColor: '#b71c1c',
              },
            }}
          >
            <LogoutIcon sx={{ color: 'white' }} />
          </Button>
        </Box>
            )}
      
      </Toolbar>
    </AppBar>
  );

};

export default Navbar;