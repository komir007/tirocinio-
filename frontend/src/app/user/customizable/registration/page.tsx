"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomizableRegistration from "../../../components/CustomizableRegistration";
import CustomizationHelp from "../../../components/CustomizationHelp";
import { Box, Typography, Button, Chip } from "@mui/material";
import { Edit as EditIcon, Settings as SettingsIcon } from "@mui/icons-material";

export default function CustomizableRegistrationPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con pulsanti di navigazione */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Registrazione Utente (Customizzabile)
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Form di registrazione personalizzabile - Clicca sull'icona ⚙️ per personalizzare
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip 
            icon={<SettingsIcon />}
            label="Form Customizzabile" 
            color="primary"
            variant="filled"
          />
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => router.push('/user/registration')}
            size="large"
          >
            Form Standard
          </Button>
        </Box>
      </Box>

      <CustomizableRegistration />
      
      {/* Guida rapida */}
      <CustomizationHelp variant="form" />
    </Box>
  );
}
