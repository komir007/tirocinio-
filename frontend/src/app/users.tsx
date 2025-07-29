import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AuthContext, User, Role } from './components/Authcontext'; // Importa AuthContext e tipi
import { DisplayUser } from './types/auth'; // Importa DisplayUser

// Definisci un tipo per le props della pagina utenti
interface UsersPageProps {
  setCurrentPage: (page: string) => void;
}

// Ottieni l'URL base dell'API dalle variabili d'ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const UsersPage: React.FC<UsersPageProps> = ({ setCurrentPage }) => {
  const { user, role } = useContext(AuthContext);
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || (role !== 'admin' && role !== 'agent')) {
        setUsers([]);
        setLoadingUsers(false);
        return; // Non tentare di recuperare gli utenti se non autorizzato
      }

      setLoadingUsers(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Token di autenticazione non trovato.');
        }

        const response = await fetch(`${API_BASE_URL}/users`, { // Endpoint per la lista utenti NestJS
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Invia il token nell'header Authorization
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUsers(data);
        } else {
          // Gestisci errori specifici dal backend (es. 401, 403)
          if (response.status === 401 || response.status === 403) {
            setError('Non autorizzato ad accedere a queste risorse. Potrebbe essere necessario effettuare nuovamente il login.');
            setDialogMessage('Non autorizzato ad accedere a queste risorse. Effettua nuovamente il login.');
            setShowDialog(true);
            // Opzionale: pulisci il token e reindirizza al login
            // localStorage.removeItem('accessToken');
            // setCurrentPage('login');
          } else {
            setError(data.message || 'Errore durante il recupero degli utenti.');
            setDialogMessage(data.message || 'Errore durante il recupero degli utenti.');
            setShowDialog(true);
          }
        }
      } catch (err: any) {
        console.error('Errore di rete o del server:', err);
        setError(err.message || 'Si è verificato un errore di connessione. Riprova più tardi.');
        setDialogMessage(err.message || 'Si è verificato un errore di connessione. Riprova più tardi.');
        setShowDialog(true);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, role, setCurrentPage]); // Dipendenze: user e role

  const handleCreateUserClick = () => {
    setCurrentPage('register');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    // Se l'errore era un 401/403, reindirizza al login dopo aver chiuso il dialog
    if (error && (error.includes('Non autorizzato') || error.includes('Effettua nuovamente il login'))) {
      setCurrentPage('login');
    }
  };

  if (!user || (role !== 'admin' && role !== 'agent')) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <Paper className="p-8 rounded-lg shadow-lg bg-white text-center w-full max-w-md">
          <Typography variant="h6" color="error" gutterBottom>
            Accesso negato!
          </Typography>
          <Typography variant="body1">
            Solo amministratori e agenti possono visualizzare la lista utenti.
          </Typography>
          <Button variant="contained" color="primary" className="mt-4" onClick={() => setCurrentPage('login')}>
            Vai al Login
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loadingUsers) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <CircularProgress />
        <Typography variant="h6" className="ml-4">Caricamento utenti...</Typography>
      </Container>
    );
  }

  return (
    <Container className="p-8">
      <Paper className="p-8 rounded-lg shadow-lg bg-white">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h5" component="h2" className="text-gray-800 font-bold">
            Lista Utenti
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateUserClick}
            className="py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            Crea Nuovo Utente
          </Button>
        </Box>

        {error && <Typography color="error" className="mb-4">{error}</Typography>}

        <TableContainer component={Paper} className="rounded-lg shadow-md">
          <Table aria-label="user table">
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell className="font-semibold">Nome</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Ruolo</TableCell>
                {role === 'admin' && <TableCell className="font-semibold">Creato da (ID)</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={role === 'admin' ? 4 : 3} className="text-center py-4">
                    Nessun utente trovato per il tuo ruolo.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    {role === 'admin' && <TableCell>{u.createdBy || 'N/A'}</TableCell>}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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

export default UsersPage;
