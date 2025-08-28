"use client";
import React, { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./Authcontext";
import { CustomizableForm } from "./Customization/components/CustomizableForm";
import { useUserCustomization } from "./Customization/hooks/useUsercustomization";
import { DEFAULT_FORM_CONFIGS } from "./Customization/config/forms/defaultFormConfigs";
import {
  Paper,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

export default function CustomizableRegistration() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const by = authContext?.user?.email;
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";

  // Customization hooks
  const {
    getUserRegistrationFormConfig,
    updateUserRegistrationFormCustomization,
    loading: customizationLoading
  } = useUserCustomization();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: isAgent ? "client" : formData.role, // forza client se agent
        createdBy: by || "",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Errore nella registrazione utente');
      
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push('/user');
      }, 1000);
    } catch (err) {
      alert('Errore durante la registrazione utente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Prepara sezioni del form
  const formSections = DEFAULT_FORM_CONFIGS['user-registration'].sections.map(section => {
    // Se è un agent, nascondi la sezione permessi o rendi readonly il campo role
    if (isAgent && section.id === 'permissions') {
      return {
        ...section,
        fields: section.fields.map(field => 
          field.id === 'role' 
            ? { ...field, readOnly: true, hidden: false }
            : field
        )
      };
    }
    return section;
  });

  if (customizationLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <Typography>Caricamento configurazione...</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      height="100%"
      minHeight="60vh"
      p={2}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "800px",
          borderRadius: 3,
          p: 4,
          bgcolor: "#fff",
          display: "flex",
          flexDirection: "column",
          mx: "auto"
        }}
      >
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrazione Nuovo Utente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Compila il form per creare un nuovo utente nel sistema
          </Typography>
        </Box>

        {/* Form customizzabile */}
        <CustomizableForm
          formId="user-registration"
          sections={formSections}
          customization={getUserRegistrationFormConfig() || undefined}
          onCustomizationChange={updateUserRegistrationFormCustomization}
          onSubmit={handleSubmit}
          submitLabel={loading ? "Registrazione..." : "Registra Utente"}
          loading={loading}
          initialValues={{
            role: isAgent ? "client" : "",
            createdBy: by || ""
          }}
        />

        {/* Pulsanti di controllo */}
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button 
            variant="outlined" 
            onClick={handleCancel}
            disabled={loading}
          >
            Annulla
          </Button>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
            Utente registrato con successo!
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
