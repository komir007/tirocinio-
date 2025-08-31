import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { ExpandMore, AdminPanelSettings } from '@mui/icons-material';
import { FormSection, FormField } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';
import { useCustomizationContext } from './CustomizableProvider';

interface AdminFieldRestrictionsProps {
  formId: string;
  sections: FormSection[];
  targetUserId?: number;
  open: boolean;
  onClose: () => void;
}

export function AdminFieldRestrictions({
  formId,
  sections,
  targetUserId,
  open,
  onClose,
}: AdminFieldRestrictionsProps) {
  const authContext = useContext(AuthContext);
  const { updateAdminFieldRestrictions } = useCustomizationContext();
  const userRole = authContext?.user?.role;
  
  const [lockedFields, setLockedFields] = useState<Set<string>>(new Set());
  const [lockedSections, setLockedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verifica se l'utente è admin
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setError('Solo gli amministratori possono accedere a questa funzionalità');
      return;
    }
  }, [isAdmin]);

  const handleFieldToggle = (fieldId: string) => {
    setLockedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleSectionToggle = (sectionId: string, section: FormSection) => {
    setLockedSections(prev => {
      const newSet = new Set(prev);
      const newLockedFields = new Set(lockedFields);
      
      if (newSet.has(sectionId)) {
        // Unlock section and all its fields
        newSet.delete(sectionId);
        section.fields.forEach(field => newLockedFields.delete(field.id));
      } else {
        // Lock section and all its fields
        newSet.add(sectionId);
        section.fields.forEach(field => newLockedFields.add(field.id));
      }
      
      setLockedFields(newLockedFields);
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!updateAdminFieldRestrictions || !targetUserId) {
      setError('Impossibile salvare le restrizioni');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const restrictions = {
        [formId]: {
          lockedFields: Array.from(lockedFields),
          lockedSections: Array.from(lockedSections),
        }
      };

      await updateAdminFieldRestrictions(targetUserId, restrictions);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Errore nel salvataggio delle restrizioni');
      console.error('Error saving field restrictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLockedFields(new Set());
    setLockedSections(new Set());
  };

  if (!isAdmin) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings color="error" />
            <Typography variant="h6">Accesso Negato</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Solo gli amministratori possono accedere al pannello di gestione restrizioni campi.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminPanelSettings color="primary" />
            <Typography variant="h6">
              Gestione Restrizioni Campi - {formId}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box mb={2}>
            <Alert severity="info">
              I campi e sezioni selezionati saranno bloccati per gli utenti non amministratori.
              Gli agenti non potranno modificare questi elementi.
            </Alert>
          </Box>

          {sections.map((section) => (
            <Accordion key={section.id} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={lockedSections.has(section.id)}
                        onChange={() => handleSectionToggle(section.id, section)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={`Blocca intera sezione: ${section.label}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box display="flex" flexDirection="column" gap={1}>
                  {section.fields.map((field) => (
                    <FormControlLabel
                      key={field.id}
                      control={
                        <Checkbox
                          checked={lockedFields.has(field.id)}
                          onChange={() => handleFieldToggle(field.id)}
                          disabled={lockedSections.has(section.id)}
                        />
                      }
                      label={`${field.label} (${field.type})`}
                      sx={{ 
                        ml: 2,
                        opacity: lockedSections.has(section.id) ? 0.6 : 1 
                      }}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleReset} disabled={loading}>
            Reset
          </Button>
          <Button onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !targetUserId}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Salvataggio...' : 'Salva Restrizioni'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar per feedback */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Restrizioni salvate con successo!
        </Alert>
      </Snackbar>
    </>
  );
}
