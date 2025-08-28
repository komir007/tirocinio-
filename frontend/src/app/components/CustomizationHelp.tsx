"use client";
import React, { useState } from "react";
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from "@mui/material";
import {
  Help as HelpIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  SwapVert as SwapVertIcon,
  TableChart as TableChartIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from "@mui/icons-material";

interface CustomizationHelpProps {
  variant: 'table' | 'form';
}

export default function CustomizationHelp({ variant }: CustomizationHelpProps) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const tableSteps = [
    {
      label: 'Apri il pannello di personalizzazione',
      description: 'Clicca sull\'icona ⚙️ in alto a destra della tabella',
      icon: <SettingsIcon color="primary" />
    },
    {
      label: 'Personalizza le colonne',
      description: 'Nascondi/mostra colonne, riordinale trascinando, modifica le larghezze',
      icon: <VisibilityIcon color="primary" />
    },
    {
      label: 'Configura ordinamento',
      description: 'Scegli la colonna per l\'ordinamento di default e la direzione',
      icon: <SwapVertIcon color="primary" />
    },
    {
      label: 'Imposta la paginazione',
      description: 'Seleziona quante righe mostrare per pagina (5, 10, 25, 50, 100)',
      icon: <TableChartIcon color="primary" />
    }
  ];

  const formSteps = [
    {
      label: 'Apri il pannello di personalizzazione',
      description: 'Clicca sull\'icona ⚙️ in alto a destra del form',
      icon: <SettingsIcon color="primary" />
    },
    {
      label: 'Gestisci le sezioni',
      description: 'Nascondi/mostra sezioni, rendi readonly, espandi/contrai',
      icon: <VisibilityIcon color="primary" />
    },
    {
      label: 'Personalizza i campi',
      description: 'Nascondi campi, rendili readonly, modifica l\'ordine',
      icon: <EditIcon color="primary" />
    },
    {
      label: 'Scegli il layout',
      description: 'Verticale, orizzontale o griglia responsiva',
      icon: <SwapVertIcon color="primary" />
    }
  ];

  const steps = variant === 'table' ? tableSteps : formSteps;

  const features = variant === 'table' 
    ? [
        { text: "Colonne personalizzabili", icon: <VisibilityIcon /> },
        { text: "Ordinamento dinamico", icon: <SwapVertIcon /> },
        { text: "Paginazione configurabile", icon: <TableChartIcon /> },
        { text: "Salvataggio automatico", icon: <SaveIcon /> }
      ]
    : [
        { text: "Sezioni personalizzabili", icon: <VisibilityIcon /> },
        { text: "Campi configurabili", icon: <EditIcon /> },
        { text: "Layout adattivo", icon: <SwapVertIcon /> },
        { text: "Salvataggio automatico", icon: <SaveIcon /> }
      ];

  return (
    <>
      <Fab
        color="secondary"
        size="medium"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
          }
        }}
      >
        <HelpIcon />
      </Fab>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <HelpIcon />
          Guida alla Personalizzazione {variant === 'table' ? 'Tabelle' : 'Form'}
          <Chip label="NUOVO" color="warning" size="small" />
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            🎯 Come personalizzare la tua interfaccia
          </Typography>

          <Box mb={3}>
            <Typography variant="body1" color="text.secondary" paragraph>
              Le tue personalizzazioni vengono salvate automaticamente e ripristinate ad ogni accesso!
            </Typography>
          </Box>

          {/* Funzionalità principali */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom color="primary">
              ✨ Funzionalità disponibili:
            </Typography>
            <List dense>
              {features.map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText primary={feature.text} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Steps */}
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel 
                  icon={step.icon}
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Typography variant="subtitle1" color="primary">
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(activeStep + 1)}
                      size="small"
                      disabled={index === steps.length - 1}
                    >
                      {index === steps.length - 1 ? 'Finito' : 'Continua'}
                    </Button>
                    <Button
                      onClick={() => setActiveStep(activeStep - 1)}
                      size="small"
                      disabled={index === 0}
                      sx={{ ml: 1 }}
                    >
                      Indietro
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Box mt={3} p={2} sx={{ bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant="body2" color="info.contrastText">
              💡 <strong>Consiglio:</strong> Sperimenta con le varie opzioni! 
              Puoi sempre usare il pulsante "Reset" per tornare alle impostazioni di default.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpen(false)} 
            variant="contained" 
            color="primary"
            size="large"
          >
            Ho Capito!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
