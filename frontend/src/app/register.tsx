"use client"
import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AuthContext} from './components/Authcontext'; // Importa AuthContext e tipi
import { Role } from './types/auth'; // Importa il tipo Role
// Definisci un tipo per le props della pagina di registrazione
interface RegisterPageProps {
  setCurrentPage: (page: string) => void;
}

// Ottieni l'URL base dell'API dalle variabili d'ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentPage }) => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const role = authContext?.role;
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>('client'); // Default for agents
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  // Redirect if not admin or agent
  useEffect(() => {
    if (!user || (role !== 'admin' && role !== 'agent')) {
      setDialogMessage('Non hai i permessi per accedere a questa pagina.');
      setShowDialog(true);
      setTimeout(() => {
        setShowDialog(false);
        setCurrentPage('home');
      }, 2000);
    }
  }, [user, role, setCurrentPage]);
  //console.log('user:', user, 'role:', role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token di autenticazione non trovato. Effettua il login.');
      }

      const newUserRole = role === 'admin' ? selectedRole : 'client'; // L'admin sceglie, l'agente crea solo client

      const response = await fetch(`${API_BASE_URL}/users`, { // Endpoint di creazione utente NestJS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Invia il token
        },
        body: JSON.stringify({ name, email, password, role: newUserRole, createdBy: user?.email }), // Includi chi ha creato l'utente
      });

      const data = await response.json();

      if (response.ok) {
        setDialogMessage(`Utente '${name}' creato con successo come ${newUserRole}!`);
        setShowDialog(true);
        // Dopo il successo, reindirizza alla lista utenti
        setTimeout(() => {
          setShowDialog(false);
          setCurrentPage('users');
        }, 1500);
      } else {
        // Gestisci errori specifici dal backend (es. email già esistente)
        if (response.status === 401 || response.status === 403) {
          setError('Non autorizzato a creare utenti. Potrebbe essere necessario effettuare nuovamente il login.');
          setDialogMessage('Non autorizzato a creare utenti. Effettua nuovamente il login.');
          setShowDialog(true);
        } else {
          setError(data.message || 'Errore durante la creazione dell\'utente.');
          setDialogMessage(data.message || 'Errore durante la creazione dell\'utente.');
          setShowDialog(true);
        }
      }
    } catch (err: any) {
      console.error('Errore durante la creazione utente:', err);
      setError(err.message || 'Si è verificato un errore di connessione. Riprova più tardi.');
      setDialogMessage(err.message || 'Si è verificato un errore di connessione. Riprova più tardi.');
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    // Se l'errore era un 401/403, reindirizza al login dopo aver chiuso il dialog
    if (error && (error.includes('Non autorizzato') || error.includes('Effettua nuovamente il login'))) {
      setCurrentPage('login');
    } else if (!error) { // Solo se non c'è stato un errore, naviga
      setCurrentPage('users');
    }
  };

  useEffect(() => {
  const editUser = localStorage.getItem('editUser');
  if (editUser) {
    const userData = JSON.parse(editUser);
    setName(userData.name || '');
    setEmail(userData.email || '');
    setSelectedRole(userData.role || 'client');
    // ...altri campi se servono
    localStorage.removeItem('editUser');
  }
  }, []);

  if (!user || (role !== 'admin' && role !== 'agent')) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <Paper className="p-8 rounded-lg shadow-lg bg-white text-center w-full max-w-md">
          <Typography variant="h6" color="error" gutterBottom>
            Accesso negato!
          </Typography>
          <Typography variant="body1">
            Solo amministratori e agenti possono registrare nuovi utenti.
          </Typography>
          <Button variant="contained" color="primary" className="mt-4" onClick={() => setCurrentPage('login')}>
            Vai al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <Paper className="p-8 rounded-lg shadow-lg bg-white w-full max-w-md">
        <Typography variant="h5" component="h2" gutterBottom className="text-center text-gray-800 font-bold">
          Registra Nuovo Utente
        </Typography>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <TextField
            label="Nome"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />

          {role === 'admin' && ( // Only show role selection for admins
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Ruolo</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)} // Cast to Role type
                label="Ruolo"
              >
                <MenuItem value="client">Cliente</MenuItem>
                <MenuItem value="agent">Agente</MenuItem>
              </Select>
            </FormControl>
          )}

          <Box className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              className="py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Registra Utente'}
            </Button>
          </Box>
        </form>
        {error && <Typography color="error" className="mt-4 text-center">{error}</Typography>}
      </Paper>

      <Dialog open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>Notifica</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegisterPage;