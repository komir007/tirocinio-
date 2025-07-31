'use client';
import React, { useContext, useState, useEffect } from 'react';
import {
  Container, Box, Typography, TextField, Button, CircularProgress,
  Select, MenuItem, FormControl, InputLabel, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AuthContext} from './components/Authcontext'; // Importa AuthContext e tipi
import { Role } from './types/auth'; // Importa il tipo Role

interface EditUserPageProps {
  setCurrentPage: (page: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const EditUserPage: React.FC<EditUserPageProps> = ({ setCurrentPage }) => {
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const editUser = localStorage.getItem('editUser');
    if (editUser) {
      const user = JSON.parse(editUser);
      setUserData(user);
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || '');
      localStorage.removeItem('editUser');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Token non trovato');
      const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setDialogMessage('Utente aggiornato con successo!');
        setShowDialog(true);
        setTimeout(() => {
          setShowDialog(false);
          setCurrentPage('users');
        }, 1200);
      } else {
        setError(data.message || 'Errore durante la modifica.');
        setDialogMessage(data.message || 'Errore durante la modifica.');
        setShowDialog(true);
      }
    } catch (err: any) {
      setError(err.message);
      setDialogMessage(err.message);
      setShowDialog(true);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
        <CircularProgress />
        <Typography variant="h6" className="ml-4">Caricamento dati utente...</Typography>
      </Container>
    );
  }

  return (
    <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <Paper className="p-8 rounded-lg shadow-lg bg-white w-full max-w-md">
        <Typography variant="h5" component="h2" gutterBottom className="text-center text-gray-800 font-bold">
          Modifica Utente
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

          <FormControl variant="outlined" fullWidth>
            <InputLabel>Ruolo</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole((e.target.value ?? '') as string)} // Ensure value is always string
              label="Ruolo"
              required
            >
              <MenuItem value="client">Cliente</MenuItem>
              <MenuItem value="agent">Agente</MenuItem>
            </Select>
          </FormControl>
          <Box className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              className="py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Salva Modifiche'}
            </Button>
          </Box>
        </form>
        {error && <Typography color="error" className="mt-4 text-center">{error}</Typography>}
      </Paper>
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Notifica</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            Chiudi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditUserPage;