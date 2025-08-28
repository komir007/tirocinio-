"use client";
import React, { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Paper,
  Chip
} from "@mui/material";
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  Lightbulb as LightbulbIcon,
  StarBorder as StarIcon
} from "@mui/icons-material";

interface CustomizationBannerProps {
  onTryCustomization: () => void;
  variant?: 'table' | 'form';
}

export default function CustomizationBanner({ 
  onTryCustomization, 
  variant = 'table' 
}: CustomizationBannerProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const features = variant === 'table' 
    ? [
        "Personalizza colonne (mostra/nascondi, riordina, ridimensiona)",
        "Ordinamento e filtri avanzati",
        "Paginazione configurabile",
        "Configurazioni salvate automaticamente"
      ]
    : [
        "Personalizza sezioni e campi del form",
        "Layout adattivo (verticale/orizzontale/griglia)",
        "Campi nascondibili o in sola lettura",
        "Validazioni personalizzabili"
      ];

  return (
    <Collapse in={open}>
      <Paper 
        elevation={3}
        sx={{ 
          mb: 3, 
          background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
          border: '1px solid',
          borderColor: 'primary.light'
        }}
      >
        <Alert
          severity="info"
          icon={<LightbulbIcon />}
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={onTryCustomization}
                sx={{
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                  }
                }}
              >
                Prova Ora
              </Button>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon color="primary" />
            <strong>Novità: Modalità Customizzabile!</strong>
            <Chip label="NUOVO" color="primary" size="small" />
          </AlertTitle>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ora puoi personalizzare completamente l'interfaccia secondo le tue esigenze:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, mb: 1 }}>
            {features.map((feature, index) => (
              <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                {feature}
              </Typography>
            ))}
          </Box>
          
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            💡 Le tue personalizzazioni vengono salvate automaticamente e restaurate ad ogni accesso!
          </Typography>
        </Alert>
      </Paper>
    </Collapse>
  );
}
