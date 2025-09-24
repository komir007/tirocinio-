"use client";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthContext } from "../components/Authcontext";
import { useContext, useState, useEffect } from "react";

export default function Loginpage() {
  const [open, setOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false); // Nuovo stato per l'alert di errore
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const login = authContext?.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorOpen(false); // Chiudi l'alert di errore precedente
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    try {
      if (!login) {
        setError("Servizio di autenticazione non disponibile");
        setErrorOpen(true); // Mostra l'alert di errore
        setLoading(false);
        return;
      }
      const result = await login(email, password);
      if (result?.success) {
        setOpen(true);
        setTimeout(() => {
          setOpen(false);
          //router.push("/");
        }, 1000);
      } else {
        setError(result?.message || "Credenziali non valide");
        setErrorOpen(true); // Mostra l'alert di errore
        setLoading(false); // Riabilita il bottone in caso di errore
      }
    } catch (err) {
      setError("Errore di rete o del server");
      setErrorOpen(true); // Mostra l'alert di errore
      setLoading(false); // Riabilita il bottone in caso di errore
    }
  };

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const handleErrorClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setErrorOpen(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (user) {
        router.push("/");
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [user, router]);

  return (
    <Box display="flex" flexDirection="row" height="100vh" bgcolor="grey.100">
      <Box
        flex={1}
        display={{ xs: "none", md: "flex" }}
        sx={{ height: "100%", bgcolor: "grey.100", position: "relative" }}
      >
        <Image
          src={require("@/app/im_login.jpg").default}
          alt="Login Image"
          fill
          style={{ objectFit: "cover" }}
          sizes="(min-width: 900px) 100vw, 100vw"
        />
      </Box>

      <Box
        flex={1}
        sx={{
          bgcolor: "grey.100",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            //bgcolor: "grey.100",
            p: 4,
            borderRadius: 4,
            minWidth: 320,
            maxWidth: 400,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography variant="h2" align="left">
            LOGO
          </Typography>
          <Box>
            <Typography variant="h5" align="left">
              Accedi
            </Typography>
            <Typography variant="body2" align="left" color="grey.600">
              Inserisci i tuoi dati qui sotto
            </Typography>
          </Box>
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            <TextField
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 2 }}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              sx={{ borderRadius: 2 }}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ borderRadius: 2, mt: 2 }}
              fullWidth
              disabled={loading}
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </form>
        </Paper>

        {/* Snackbar per successo */}
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Accesso effettuato con successo!
          </Alert>
        </Snackbar>

        {/* Snackbar per errori */}
        <Snackbar
          open={errorOpen}
          autoHideDuration={6000}
          onClose={handleErrorClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleErrorClose}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
