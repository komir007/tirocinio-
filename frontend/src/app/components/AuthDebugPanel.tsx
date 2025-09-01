"use client";
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './Authcontext';
import { Box, Card, CardContent, Typography, Button, Chip } from '@mui/material';

const AuthDebugPanel: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const updateTokenInfo = () => {
    if (authContext?.getTokenInfo) {
      setTokenInfo(authContext.getTokenInfo());
    }
  };

  useEffect(() => {
    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 1000); // Aggiorna ogni secondo
    return () => clearInterval(interval);
  }, [authContext]);

  if (!authContext) return null;

  const simulateTokenExpiration = () => {
    // Simula un token scaduto modificando il localStorage
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        payload.exp = Math.floor(Date.now() / 1000) - 1; // Scaduto 1 secondo fa
        const newPayload = btoa(JSON.stringify(payload));
        const newToken = `${parts[0]}.${newPayload}.${parts[2]}`;
        localStorage.setItem("accessToken", newToken);
        window.location.reload(); // Ricarica per attivare il controllo
      } catch (e) {
        console.error("Errore nella simulazione:", e);
      }
    }
  };

  return (
    <Card sx={{ m: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🔐 Debug Panel - Autenticazione
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Stato Utente:</strong> {authContext.user ? '✅ Autenticato' : '❌ Non autenticato'}
          </Typography>
          {authContext.user && (
            <Typography variant="body2" gutterBottom>
              <strong>Utente:</strong> {authContext.user.name} ({authContext.user.role})
            </Typography>
          )}
        </Box>

        {tokenInfo && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" component="div" gutterBottom>
              <strong>Token Status:</strong> 
              <Chip 
                label={tokenInfo.isValid ? 'VALIDO' : 'SCADUTO'} 
                color={tokenInfo.isValid ? 'success' : 'error'}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            {tokenInfo.isValid && tokenInfo.expiresIn && (
              <>
                <Typography variant="body2" gutterBottom>
                  <strong>Scade tra:</strong> {tokenInfo.expiresIn} secondi
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Scade il:</strong> {tokenInfo.expiresAt?.toLocaleString('it-IT')}
                </Typography>
              </>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={updateTokenInfo}
          >
            Aggiorna Info
          </Button>
          <Button 
            variant="outlined" 
            color="warning"
            size="small" 
            onClick={simulateTokenExpiration}
          >
            Simula Scadenza Token
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            size="small" 
            onClick={authContext.logout}
          >
            Logout Manuale
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;
