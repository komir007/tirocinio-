"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "./Authcontext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Registration() {
  const authContext = useContext(AuthContext);
  const by = authContext?.user?.email;
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    role: isAgent ? "client" : "",
    createdBy: by || "",
  });
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: isAgent ? "client" : form.role, // forza client se agent
          createdBy: form.createdBy,
        }),
      });
      if (!res.ok) throw new Error('Errore nella registrazione utente');
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push('/user');
      }, 1000);
    } catch (err) {
      alert('Errore durante la registrazione utente');
      console.error(err);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      height="100%"
      minHeight="60vh"
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100vw",
          height: "100%",
          maxHeight: "100vh",
          borderRadius: 3,
          p: 4,
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={2}
          mb={4}
          flexGrow={1}
        >
          <TextField
            name="name"
            label="Nome"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          {!isAgent && (
            <TextField
              name="role"
              label="Ruolo"
              select
              value={form.role}
              onChange={handleChange}
              required
              fullWidth
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
              <MenuItem value="client">Client</MenuItem>
            </TextField>
          )}
        </Box>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Annulla
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Invia
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Registrazione avvenuta con successo!
        </Alert>
      </Snackbar>
    </Box>
  );
}
