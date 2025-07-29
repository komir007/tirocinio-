import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Box, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { AuthContext, User, Role } from '../components/AuthContext'; // Importa AuthContext e tipi

// Definisci un tipo per le props della pagina utenti
interface UsersPageProps {
  setCurrentPage: (page: string) => void;
}

// --- Simulated User Data (for demonstration) ---
// Estendi l'interfaccia User per includere 'createdBy'
interface DisplayUser extends User {
  createdBy: string | null;
}

const initialUsers: DisplayUser[] = [
  { id: 'admin-1', name: 'Amministratore', email: 'admin@example.com', role: 'admin', createdBy: null },
  { id: 'agent-1', name: 'Agente Mario', email: 'agent@example.com', role: 'agent', createdBy: null },
  { id: 'client-1', name: 'Cliente Paolo', email: 'client@example.com', role: 'client', createdBy: 'agent-1' },
  { id: 'client-2', name: 'Cliente Giulia', email: 'giulia@example.com', role: 'client', createdBy: 'agent-1' },
  { id: 'client-3', name: 'Cliente Marco', email: 'marco@example.com', role: 'client', createdBy: 'admin-1' },
  { id: 'client-4', name: 'Cliente Sara', email: 'sara@example.com', role: 'client', createdBy: 'agent-2' }, // Assume agent-2 exists
];

const UsersPage: React.FC<UsersPageProps> = ({ setCurrentPage }) => {
  const { user, role } = useContext(AuthContext);
  const [users, setUsers] = useState<DisplayUser[]>([]);

  useEffect(() => {
    // Simulate fetching users based on role
    if (role === 'admin') {
      setUsers(initialUsers); // Admin sees all
    } else if (role === 'agent' && user) {
      // Agent sees only clients created by them
      const filteredUsers = initialUsers.filter(u => u.role === 'client' && u.createdBy === user.id);
      setUsers(filteredUsers);
    } else {
      setUsers([]); // Clients or unauthenticated users see nothing
    }
  }, [role, user]);

  if (!user || (role !== 'admin' && role !== 'agent')) {
    // Show message box instead of alert
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

  const handleCreateUserClick = () => {
    setCurrentPage('register');
  };

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
    </Container>
  );
};

export default UsersPage;