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
import { Divider, IconButton } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import MagicWrapper from "../test_secon/comp/MagicWrapper";
import { grey } from "@mui/material/colors";

export default function Registration() {
  const authContext = useContext(AuthContext);
  const by = authContext?.user?.email;
  const parentId = authContext?.user?.parentId;
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";

  const [form, setForm] = React.useState({
    name: "esxample",
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
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: isAgent ? "client" : form.role, // forza client se agent
            createdBy: form.createdBy,
          }),
        }
      );
      if (!res.ok) throw new Error("Errore nella registrazione utente");
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push("/user");
      }, 1000);
    } catch (err) {
      alert("Errore durante la registrazione utente");
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
          height: "auto", // <-- evitare che Paper espanda la pagina
          maxHeight: "auto", // <-- limita l'altezza complessiva (regola a piacere)
          borderRadius: 3,
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // <-- impedisce lo scroll esterno; lo gestiamo nel form
        }}
      >
        <MagicWrapper>
          <Box
            aria-label="form_Registration"
            key="form_Registration"
            component="form"
            onSubmit={handleSubmit}
            /* layout e scroll qui */
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto", // <-- occupa lo spazio rimanente del Paper
              minHeight: 0, // <-- ESSENZIALE: permette al box di ridursi e abilitare lo scroll interno
              overflowY: "auto", // <-- lo scroll apparirà solo qui
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
                }} // Per supportare order
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
                  //value={}
                  //onChange={handleChange}
                  required
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
                  //value={}
                  //onChange={handleChange}
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
                }} // Per supportare order
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
                  label="Password"
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
              </Box>
            </Box>
          </Box>
        </MagicWrapper>
        <Box sx={{ maxHeight: "100%" }} />
        {/* footer / bottoni rimangono fissi sotto e NON scrollano */}
        <Divider />
        <Box display="flex" p={2} justifyContent="flex-end" gap={2}>
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
