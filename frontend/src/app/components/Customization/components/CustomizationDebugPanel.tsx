import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { ExpandMore, BugReport } from '@mui/icons-material';
import { useCustomizationContext } from './CustomizableProvider';
import { AuthContext } from '../../Authcontext';
import { useContext } from 'react';

export function CustomizationDebugPanel() {
  const authContext = useContext(AuthContext);
  const { config, loading, error, refreshConfig } = useCustomizationContext();
  const [apiTest, setApiTest] = useState<{ success: boolean; message: string } | null>(null);

  const testAPI = async () => {
    try {
      const response = await authContext?.fetchWithAuth?.('http://localhost:3001/user-settings/test');
      if (response?.ok) {
        const data = await response.json();
        setApiTest({ success: true, message: data.message });
      } else {
        setApiTest({ success: false, message: `HTTP ${response?.status}` });
      }
    } catch (error) {
      setApiTest({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const testSaveConfig = async () => {
    try {
      const testConfig = {
        grids: {},
        forms: {
          'user-registration': {
            compactMode: true,
            layout: 'grid'
          }
        },
        global: {
          theme: 'light',
          compactInterface: true
        }
      };

      const response = await authContext?.fetchWithAuth?.('http://localhost:3001/user-settings/my-settings/customization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customizationConfig: testConfig }),
      });

      if (response?.ok) {
        setApiTest({ success: true, message: 'Configurazione di test salvata!' });
        refreshConfig?.();
      } else {
        const errorText = await response?.text();
        setApiTest({ success: false, message: `Errore salvataggio: ${response?.status} - ${errorText}` });
      }
    } catch (error) {
      setApiTest({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <BugReport color="warning" />
        <Typography variant="h6">Debug Panel - Customization</Typography>
      </Box>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Stato Utente & Auth</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>
              <strong>User ID:</strong> {authContext?.user?.id || 'Non definito'}
            </Typography>
            <Typography>
              <strong>User Role:</strong> {authContext?.user?.role || 'Non definito'}
            </Typography>
            <Typography>
              <strong>FetchWithAuth:</strong> {authContext?.fetchWithAuth ? '✅ Disponibile' : '❌ Non disponibile'}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Stato Configurazioni</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography>
              <strong>Loading:</strong> <Chip label={loading ? 'Sì' : 'No'} color={loading ? 'warning' : 'success'} size="small" />
            </Typography>
            <Typography>
              <strong>Error:</strong> {error || 'Nessuno'}
            </Typography>
            <Typography>
              <strong>Config presente:</strong> <Chip label={config ? 'Sì' : 'No'} color={config ? 'success' : 'error'} size="small" />
            </Typography>
            {config && (
              <Typography component="pre" sx={{ fontSize: '0.8rem', bgcolor: 'grey.100', p: 1 }}>
                {JSON.stringify(config, null, 2)}
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Test API</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button onClick={testAPI} variant="outlined">
              Test Endpoint Base
            </Button>
            <Button onClick={testSaveConfig} variant="outlined">
              Test Salvataggio Config
            </Button>
            <Button onClick={refreshConfig} variant="outlined">
              Ricarica Config
            </Button>
            
            {apiTest && (
              <Alert severity={apiTest.success ? 'success' : 'error'}>
                {apiTest.message}
              </Alert>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}
