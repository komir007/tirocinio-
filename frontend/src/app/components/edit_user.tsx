"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AuthContext } from "./Authcontext";
import { useContext } from "react";

import { useSearchParams } from "next/navigation";
import MagicWrapper from "../test_secon/comp/MagicWrapper";

export default function Edit_user() {
  const searchParams = useSearchParams();
  const authContext = useContext(AuthContext);
  const userLogged = authContext?.user;
  const isAgent = userLogged?.role?.toLowerCase() === "agent";

  const [form, setForm] = React.useState({
    id: searchParams.get("id") || "",
    name: searchParams.get("name") || "",
    email: searchParams.get("email") || "",
    password: "",
    role: isAgent ? "client" : (searchParams.get("role") || "client"),
  });
  const router = useRouter();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  // Se agent, forza il ruolo a client
  React.useEffect(() => {
    if (isAgent) {
      setForm((prev) => ({ ...prev, role: "client" }));
    }
    // eslint-disable-next-line
  }, [isAgent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Token non trovato, effettua di nuovo il login.");
      return;
    }
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/users/${form.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: isAgent ? "client" : form.role, // forza client se agent
          }),
        }
      );
      if (!res.ok) throw new Error("Errore nella modifica utente");
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push("/user");
      }, 1000);
    } catch (err) {
      alert("Errore durante la modifica utente");
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
        <MagicWrapper>
        <Box
          component="form"
          aria-label="form_Edit_user"
          key="form_Edit_user"
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
            key="form_name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            name="email"
            label="Email"
            key="form_email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            fullWidth
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
          />
          <TextField
            key="form_password"  
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
              key="form_role"
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
        </MagicWrapper>
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
            Modifica
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
          Modifica avvenuta con successo!
        </Alert>
      </Snackbar>
    </Box>
  );
}
