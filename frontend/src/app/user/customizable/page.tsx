"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CustomizableUsersTable from "../../components/CustomizableUsersTable";
import CustomizationHelp from "../../components/CustomizationHelp";
import { Box, Typography, Button, Chip } from "@mui/material";
import { ArrowBack as ArrowBackIcon, Settings as SettingsIcon, TableChart as TableIcon } from "@mui/icons-material";

export default function CustomizableUsersPage() {
  const router = useRouter();

  return (
    <Box sx={{ p: 2 }}>
      {/* Header con pulsanti di navigazione */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestione Utenti (Customizzabile)
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Tabella utenti con personalizzazione avanzata - Clicca sull'icona ⚙️ per personalizzare
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Chip 
            icon={<SettingsIcon />}
            label="Modalità Customizzabile" 
            color="primary"
            variant="filled"
          />
          <Button
            variant="outlined"
            startIcon={<TableIcon />}
            onClick={() => router.push('/user')}
            size="large"
          >
            Modalità Standard
          </Button>
        </Box>
      </Box>

      <CustomizableUsersTable />
      
      {/* Guida rapida */}
      <CustomizationHelp variant="table" />
    </Box>
  );
}
