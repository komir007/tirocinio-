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
import CustomFormDialog from "./Custom_form_dialog";
import {
  traverseAllElements,
  mapAllInputs,
  mapAllSections,
  mapFormStructure,
  queryElements,
  getFormStats,
  hideField,
  showField,
  makeFieldReadOnly,
  makeFieldEditable,
  reorderField,
  reorderSections,
  hideSections,
  showSections,
  makeSectionReadOnly,
  makeSectionEditable,
  hideAllFields,
  showAllFields,
  makeAllReadOnly,
  makeAllEditable,
  getCurrentFormConfig,
  applyFormConfig,
  SectionConfig
} from './Custom_form_util';

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
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const router = useRouter();

  // Manipolazione singoli campi: usare le funzioni importate da custom_form_util

  // ... le funzioni di mapping e query sono esternalizzate in custom_form_util.ts

  // Manipolazione sezioni e read-only: usare le funzioni importate da custom_form_util

  // Configurazioni predefinite
  const applyConfiguration = (config: string) => {
    switch (config) {
      case 'reverse':
        // Inverti l'ordine delle sezioni
        reorderSections(['sezione_ruolo', 'sezione_accesso', 'sezione_anagrafica']);
        break;
      case 'minimal':
        // Mostra solo sezione accesso
        hideSections(['sezione_anagrafica', 'sezione_ruolo']);
        showSections(['sezione_accesso']);
        break;
      case 'readonly_personal':
        // Rendi read-only la sezione anagrafica
        makeSectionReadOnly('sezione_anagrafica');
        break;
      case 'reset':
        // Reset tutto
        showSections(['sezione_anagrafica', 'sezione_accesso', 'sezione_ruolo']);
        makeSectionEditable('sezione_anagrafica');
        makeSectionEditable('sezione_accesso');
        makeSectionEditable('sezione_ruolo');
        reorderSections(['sezione_anagrafica', 'sezione_accesso', 'sezione_ruolo']);
        break;
    }
  };

  // Azioni globali sul form
  // Azioni globali: hide/show/reorder/read-only centralizzate in custom_form_util

  // Query selector avanzato con filtri: funzione esternalizzata in custom_form_util.ts

  // Statistiche complete del form: funzione esternalizzata in custom_form_util.ts

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfigChange = (newSections: SectionConfig[]) => {
    applyFormConfig(newSections);
    setDialogOpen(false);
  };

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

          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          aria-label="Registration Form"
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          flexGrow={1}
        >
          <Box
            id="sezione_anagrafica"
            key="sezione_anagrafica"
            display="flex"
            flexDirection="column"
            gap={2}
            m={2}
          >
            <Typography variant="subtitle1">
              Informazioni anagrafiche
            </Typography>
            <Box
              key="1"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              width={{ xs: "100%", sm: "50%" }}
              gap={2}
              sx={{ display: 'flex', flexDirection: 'row' }} // Per supportare order
            >
              <TextField
                id="field-name"
                name="name"
                label="Nome"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
              <TextField
                id="field-cognome"
                name="cognome"
                label="Cognome"
                //value={}
                //onChange={handleChange}
                required
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                }}
              />
            </Box>
          <Divider />
          </Box>


          <Box
            id="sezione_accesso"
            key="sezione_accesso"
            display="flex"
            flexDirection="column"
            gap={2}
            m={2}
          >
            <Typography variant="subtitle1">Accesso</Typography>
            <Box
              key="2"
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={2}
              sx={{ display: 'flex', flexDirection: 'row' }} // Per supportare order
            >
              <TextField
                id="field-email"
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
                }}
              />
              <TextField
                id="field-password"
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
                }}
              />
            </Box>
            <Divider />
          </Box>

          

          <Box
            m={2}
            id="sezione_ruolo"
            key="sezione_ruolo"
            display="flex"
            flexDirection="column"
            gap={2}
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
                  id="field-role"
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
                  }}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="client">Client</MenuItem>
                </TextField>
              )}
            </Box>
            <Divider />
          </Box>
         
        </Box>
        <Divider />
        
        
        
        <Divider />

        <Box display="flex" p={2} justifyContent="flex-end" gap={2}>
          <IconButton
           onClick={handleOpenDialog}
           aria-label="settings">
            <SettingsIcon />
          </IconButton>
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
      
      <CustomFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        sections={getCurrentFormConfig()}
        onChange={handleConfigChange}
      />
    </Box>
  );
}
