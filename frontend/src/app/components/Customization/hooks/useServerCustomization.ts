import { useEffect, useState, useCallback, useContext } from 'react';
import { CustomizationConfig, GridCustomization, FormCustomization } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export function useServerCustomization() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  const userRole = authContext?.user?.role;
  const fetchWithAuth = authContext?.fetchWithAuth;
  
  const [config, setConfig] = useState<CustomizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica configurazioni dal server
  const loadConfigFromServer = useCallback(async () => {
    console.log('🔄 Tentativo di caricamento configurazioni dal server:', { userId, fetchWithAuth: !!fetchWithAuth });
    
    if (!fetchWithAuth || !userId) {
      console.log('⚠️ Utente non autenticato, skipping caricamento server');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Richiesta GET al server...');
      const response = await fetchWithAuth(`${API_BASE_URL}/user-settings/my-settings`);
      
      console.log('📥 Risposta GET server:', response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dati ricevuti dal server:', data);
        
        const serverConfig = data.customizationConfig || {
          grids: {},
          forms: {},
          global: {
            theme: 'light',
            language: 'it',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            compactInterface: false,
          }
        };
        console.log('✅ Configurazioni caricate dal server');
        setConfig(serverConfig);
      } else {
        const errorText = await response.text();
        console.error('❌ Errore response server (GET):', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Errore nel caricamento dal server:', error);
      setError('Errore nel caricamento delle configurazioni');
      // Fallback al localStorage
      const localStorageKey = `track_customization_${userId || 'anonymous'}`;
      const savedConfig = localStorage.getItem(localStorageKey);
      if (savedConfig) {
        try {
          console.log('📦 Fallback a localStorage');
          setConfig(JSON.parse(savedConfig));
        } catch (e) {
          console.error('❌ Errore parsing localStorage:', e);
          setConfig({
            grids: {},
            forms: {},
            global: {
              theme: 'light',
              language: 'it',
              dateFormat: 'DD/MM/YYYY',
              timeFormat: '24h',
              compactInterface: false,
            }
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, userId]);

  // Salva configurazioni sul server
  const saveConfigToServer = useCallback(async (newConfig: CustomizationConfig) => {
    console.log('🔄 Tentativo di salvataggio configurazioni:', { newConfig, userId, fetchWithAuth: !!fetchWithAuth });
    
    if (!fetchWithAuth || !userId) {
      console.log('⚠️ Fallback al localStorage - utente non autenticato');
      // Fallback al localStorage se non autenticato
      const localStorageKey = `track_customization_${userId || 'anonymous'}`;
      localStorage.setItem(localStorageKey, JSON.stringify(newConfig));
      setConfig(newConfig);
      return;
    }

    try {
      console.log('📤 Invio richiesta al server...');
      const response = await fetchWithAuth(`${API_BASE_URL}/user-settings/my-settings/customization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customizationConfig: newConfig }),
      });

      console.log('📥 Risposta server:', response.status, response.ok);

      if (response.ok) {
        console.log('✅ Configurazioni salvate con successo sul server');
        setConfig(newConfig);
        setError(null);
        // Backup anche in localStorage
        const localStorageKey = `track_customization_${userId || 'anonymous'}`;
        localStorage.setItem(localStorageKey, JSON.stringify(newConfig));
      } else {
        const errorText = await response.text();
        console.error('❌ Errore response server:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Errore nel salvataggio sul server:', error);
      setError('Errore nel salvataggio delle configurazioni');
      // Fallback al localStorage
      const localStorageKey = `track_customization_${userId || 'anonymous'}`;
      localStorage.setItem(localStorageKey, JSON.stringify(newConfig));
      setConfig(newConfig);
    }
  }, [fetchWithAuth, userId]);

  // Carica configurazioni all'inizializzazione
  useEffect(() => {
    loadConfigFromServer();
  }, [loadConfigFromServer]);

  // Aggiorna customizzazione griglia
  const updateGridCustomization = useCallback((gridId: string, gridConfig: GridCustomization) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      grids: {
        ...config.grids,
        [gridId]: gridConfig
      }
    };
    
    saveConfigToServer(newConfig);
  }, [config, saveConfigToServer]);

  // Aggiorna customizzazione form
  const updateFormCustomization = useCallback((formId: string, formConfig: FormCustomization) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      forms: {
        ...config.forms,
        [formId]: formConfig
      }
    };
    
    saveConfigToServer(newConfig);
  }, [config, saveConfigToServer]);

  // Aggiorna configurazioni globali
  const updateGlobalCustomization = useCallback((globalConfig: CustomizationConfig['global']) => {
    if (!config) return;
    
    const newConfig = {
      ...config,
      global: {
        ...config.global,
        ...globalConfig
      }
    };
    
    saveConfigToServer(newConfig);
  }, [config, saveConfigToServer]);

  // Reset configurazioni
  const resetCustomization = useCallback((scope: 'all' | 'grids' | 'forms' | 'global' = 'all') => {
    if (!config) return;
    
    let newConfig = { ...config };
    
    switch (scope) {
      case 'grids':
        newConfig.grids = {};
        break;
      case 'forms':
        newConfig.forms = {};
        break;
      case 'global':
        newConfig.global = {
          theme: 'light',
          language: 'it',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          compactInterface: false,
        };
        break;
      case 'all':
        newConfig = {
          grids: {},
          forms: {},
          global: {
            theme: 'light',
            language: 'it',
            dateFormat: 'DD/MM/YYYY',
            timeFormat: '24h',
            compactInterface: false,
          }
        };
        break;
    }
    
    saveConfigToServer(newConfig);
  }, [config, saveConfigToServer]);

  // Funzioni per admin - gestione restrizioni campi
  const updateAdminFieldRestrictions = useCallback(async (targetUserId: number, restrictions: any) => {
    if (!fetchWithAuth || userRole !== 'admin') {
      throw new Error('Only admins can set field restrictions');
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/user-settings/admin/field-restrictions/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminFieldRestrictions: restrictions }),
      });

      if (!response.ok) {
        throw new Error('Failed to update field restrictions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating field restrictions:', error);
      throw error;
    }
  }, [fetchWithAuth, userRole]);

  // Esporta configurazioni
  const exportCustomizations = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Importa configurazioni
  const importCustomizations = useCallback((configJson: string) => {
    try {
      const importedConfig = JSON.parse(configJson);
      
      if (typeof importedConfig === 'object' && importedConfig !== null) {
        saveConfigToServer(importedConfig);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing customizations:', error);
      return false;
    }
  }, [saveConfigToServer]);

  return {
    config,
    loading,
    error,
    updateGridCustomization,
    updateFormCustomization,
    updateGlobalCustomization,
    resetCustomization,
    exportCustomizations,
    importCustomizations,
    updateAdminFieldRestrictions,
    refreshConfig: loadConfigFromServer,
  };
}
