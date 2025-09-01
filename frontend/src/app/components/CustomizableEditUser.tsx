"use client";
import React, { useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "./Authcontext";
import { CompactCustomizableForm } from "./Customization/components/CompactCustomizableForm";
import { useUserCustomization } from "./Customization/hooks/useUsercustomization";
import { DEFAULT_FORM_CONFIGS } from "./Customization/config/defaulteFormConfigs";
import {
  Paper,
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

interface UserData {
  name: string;
  email: string;
  role: string;
  createdBy?: string;
  createdAt?: string;
  lastLogin?: string;
  status?: string;
}

export default function CustomizableEditUser() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email');

  // Customization hooks
  const {
    getUserEditFormConfig,
    updateUserEditFormCustomization,
    loading: customizationLoading
  } = useUserCustomization();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  // Carica dati utente
  useEffect(() => {
    const loadUser = async () => {
      if (!userEmail) {
        setSnackbar({
          open: true,
          message: "Email utente non specificata",
          severity: "error"
        });
        setLoadingUser(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users/${userEmail}`,
          {
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          }
        );

        if (!res.ok) throw new Error('Utente non trovato');
        
        const data = await res.json();
        setUserData({
          name: data.name || '',
          email: data.email || '',
          role: data.role || '',
          createdBy: data.createdBy || '',
          createdAt: data.createdAt || '',
          lastLogin: data.lastLogin || '',
          status: data.status || 'active'
        });
      } catch (error) {
        console.error('Errore caricamento utente:', error);
        setSnackbar({
          open: true,
          message: 'Errore nel caricamento dei dati utente',
          severity: 'error'
        });
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [userEmail]);

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!userEmail) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      const payload = {
        name: formData.name,
        role: formData.role,
        status: formData.status || 'active'
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users/${userEmail}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('Errore nell\'aggiornamento utente');
      
      setSnackbar({
        open: true,
        message: "Utente aggiornato con successo!",
        severity: "success"
      });
      
      setTimeout(() => {
        router.push('/user');
      }, 1500);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: 'Errore durante l\'aggiornamento utente',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loadingUser || customizationLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
        <Typography ml={2}>
          {loadingUser ? 'Caricamento utente...' : 'Caricamento configurazione...'}
        </Typography>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <Typography color="error">
          Impossibile caricare i dati dell'utente
        </Typography>
      </Box>
    );
  }

  // Prepara valori iniziali per il form
  const initialValues = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
    createdBy: userData.createdBy || '',
    createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : '',
    lastLogin: userData.lastLogin ? new Date(userData.lastLogin).toISOString().split('T')[0] : '',
    status: userData.status || 'active'
  };

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
            Modifica Utente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Modifica i dati dell'utente: {userData.email}
          </Typography>
        </Box>

        {/* Form customizzabile */}
        <CompactCustomizableForm
          formId="user-edit"
          sections={DEFAULT_FORM_CONFIGS['user-edit'].sections}
          customization={getUserEditFormConfig() || undefined}
          onCustomizationChange={updateUserEditFormCustomization}
          onSubmit={handleSubmit}
          submitLabel={loading ? "Aggiornamento..." : "Aggiorna Utente"}
          loading={loading}
          initialValues={initialValues}
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
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}
