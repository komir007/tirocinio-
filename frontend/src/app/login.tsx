
import React, { useContext, useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AuthContext } from './components/Authcontext'; // Importa AuthContext

// Definisci un tipo per le props della pagina di login
interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const authContext = useContext(AuthContext);
  const login = authContext?.login;
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log( login);
    try {
      // Assicurati che login non sia null prima di chiamarlo
      if (login) {
        const result = await login(email, password);
        if (result.success) {
          setDialogMessage('Login effettuato con successo!');
          setShowDialog(true);
          // Redirect based on role after dialog closes
          setTimeout(() => {
            setShowDialog(false);
            if (result.role === 'admin' || result.role === 'agent') {
              setCurrentPage('users');
            } else {
              setCurrentPage('home'); // Clients don't have a specific internal page
            }
          }, 1500); // Give user time to read message
        }
      } else {
        throw new Error("Auth context login function is not available.");
      }
    } catch (err: any) {
      setError(err.message || 'Errore durante il login.');
      setDialogMessage(err.message || 'Errore durante il login.');
      setShowDialog(true);
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <Container className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-8">
      <Paper className="p-8 rounded-lg shadow-lg bg-white w-full max-w-md">
        <Typography variant="h5" component="h2" gutterBottom className="text-center text-gray-800 font-bold">
          Login
        </Typography>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            className="py-3 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-300"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Accedi'}
          </Button>
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

export default LoginPage;
