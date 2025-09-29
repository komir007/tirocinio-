"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRouter, useSearchParams } from "next/navigation";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AuthContext } from "./Authcontext";
import { useContext } from "react";
import { Divider } from "@mui/material";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            role: isAgent ? "client" : form.role,
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
      minHeight="70vh"
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100vw",
          height: "auto",
          maxHeight: "auto",
          borderRadius: 3,
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // scroll solo dentro il form
        }}
      >
        <MagicWrapper>
          <Box
            aria-label="form_Edit_User"
            key="form_Edit_User"
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            <Box
              id="sezione_anagrafica"
              key="sezione_anagrafica"
              display="flex"
              flexDirection="column"
              gap={2}
              m={2}
              border={1}
              borderColor="grey.300"
              borderRadius={2}
              p={2}
              bgcolor="grey.50"
            >
              <Typography variant="subtitle1">
                Informazioni anagrafiche
              </Typography>
              <Box
                key="1"
                gap={2}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  id="f-name"
                  key="field-name"
                  name="name"
                  label="Nome"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    backgroundColor: "white",
                  }}
                />

                <TextField
                  id="f-cognome"
                  key="field-cognome"
                  name="cognome"
                  label="Cognome"
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    backgroundColor: "white",
                  }}
                />

                <TextField
                  id="f-indirizzo"
                  key="field-indirizzo"
                  name="indirizzo"
                  label="Indirizzo"
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    backgroundColor: "white",
                  }}
                />
              </Box>
            </Box>

            <Box
              id="sezione_accesso"
              key="sezione_accesso"
              display="flex"
              flexDirection="column"
              gap={2}
              m={2}
              border={1}
              borderColor="grey.300"
              borderRadius={2}
              p={2}
              bgcolor="grey.50"
            >
              <Typography variant="subtitle1">Accesso</Typography>
              <Box
                key="2"
                display="flex"
                gap={2}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  id="f-email"
                  key="field-email"
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    backgroundColor: "white",
                  }}
                />

                <TextField
                  id="f-password"
                  key="field-password"
                  name="password"
                  label="Nuova password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    backgroundColor: "white",
                  }}
                />
              </Box>
            </Box>

            <Box
              m={2}
              id="sezione_ruolo"
              key="sezione_ruolo"
              display="flex"
              flexDirection="column"
              gap={2}
              border={1}
              borderColor="grey.300"
              borderRadius={2}
              p={2}
              bgcolor="grey.50"
            >
              <Typography variant="subtitle1">Ruolo</Typography>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                width={{ xs: "100%", sm: "50%" }}
                gap={2}
              >
                {!isAgent && (
                  <TextField
                    id="f-role"
                    key="field-role"
                    name="role"
                    label="Ruolo"
                    select
                    value={form.role}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      backgroundColor: "white",
                    }}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="agent">Agent</MenuItem>
                    <MenuItem value="client">Client</MenuItem>
                  </TextField>
                )}
                {isAgent && (
                  <TextField
                    disabled
                    value="client"
                    label="Ruolo"
                    helperText="Gli agent possono assegnare solo client"
                    fullWidth
                    sx={{
                      flex: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      backgroundColor: "white",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </MagicWrapper>

        <Box sx={{ maxHeight: "100%" }} />
        <Divider />
        <Box display="flex" p={2} justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="primary" onClick={handleCancel}>
            Annulla
          </Button>
          <Button
            form="form_EditUser"
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
