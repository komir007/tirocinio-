import { useEffect, useState, useCallback, useContext } from 'react';
import { CustomizationConfig, GridCustomization, FormCustomization } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';

export function useCustomization() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  const token = localStorage.getItem('token');


  
  const [config, setConfig] = useState<CustomizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `track_customization_${userId || 'anonymous'}`;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  // NUOVO: Carica configurazioni dal backend
  const loadConfigFromBackend = useCallback(async () => {
    if (!token || !userId) {
      // Fallback al localStorage per utenti non autenticati
      return loadConfigFromLocalStorage();
    }

    try {
      const response = await fetch(`${apiBaseUrl}/user-settings/my-settings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.customizationConfig) {
        const parsedConfig = typeof data.customizationConfig === 'string' 
          ? JSON.parse(data.customizationConfig) 
          : data.customizationConfig;
        
        setConfig(parsedConfig);
        
        // Sincronizza anche con localStorage come backup
        localStorage.setItem(storageKey, JSON.stringify(parsedConfig));
      } else {
        // Inizializza configurazione di default
        const defaultConfig = getDefaultConfig();
        setConfig(defaultConfig);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error loading customization from backend:', error);
      setError('Errore nel caricamento delle configurazioni dal server');
      
      // Fallback al localStorage
      loadConfigFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [token, userId, apiBaseUrl, storageKey]);

  // Carica configurazioni dal localStorage (fallback)
  const loadConfigFromLocalStorage = useCallback(() => {
    try {
      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } else {
        setConfig(getDefaultConfig());
      }
      setError(null);
    } catch (error) {
      console.error('Error loading customization from localStorage:', error);
      setConfig(getDefaultConfig());
      setError('Errore nel caricamento delle configurazioni locali');
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  // Configurazione di default
  const getDefaultConfig = (): CustomizationConfig => ({
    grids: {},
    forms: {},
    global: {
      theme: 'light',
      language: 'it',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
    }
  });

  useEffect(() => {
    loadConfigFromBackend();
  }, [loadConfigFromBackend]);

  // NUOVO: Salva configurazioni nel backend
  const saveConfigToBackend = useCallback(async (newConfig: CustomizationConfig) => {
    if (!token || !userId) {
      // Fallback al localStorage per utenti non autenticati
      return saveConfigToLocalStorage(newConfig);
    }

    try {
      const response = await fetch(`${apiBaseUrl}/user-settings/my-settings/customization`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customizationConfig: newConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setConfig(newConfig);
      
      // Sincronizza anche con localStorage come backup
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      
      setError(null);
      console.log('Configuration saved to backend successfully');
      
    } catch (error) {
      console.error('Error saving customization to backend:', error);
      setError('Errore nel salvataggio delle configurazioni sul server');
      
      // Fallback al localStorage
      saveConfigToLocalStorage(newConfig);
    }
  }, [token, userId, apiBaseUrl, storageKey]);

  // Salva configurazioni nel localStorage (fallback)
  const saveConfigToLocalStorage = useCallback((newConfig: CustomizationConfig) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      setConfig(newConfig);
      setError(null);
      console.log('Configuration saved to localStorage');
    } catch (error) {
      console.error('Error saving customization to localStorage:', error);
      setError('Errore nel salvataggio delle configurazioni locali');
    }
  }, [storageKey]);

  // Salva configurazioni (backend + localStorage)
  const saveConfig = useCallback((newConfig: CustomizationConfig) => {
    saveConfigToBackend(newConfig);
  }, [saveConfigToBackend]);

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
    
    console.log('Updating grid customization:', { gridId, gridConfig, newConfig });
    saveConfig(newConfig);
  }, [config, saveConfig]);

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
    
    console.log('Updating form customization:', { formId, formConfig, newConfig });
    saveConfig(newConfig);
  }, [config, saveConfig]);

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
    
    saveConfig(newConfig);
  }, [config, saveConfig]);

  // Reset configurazioni
  const resetCustomization = useCallback(async (scope: 'all' | 'grids' | 'forms' | 'global' = 'all') => {
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
        newConfig.global = {};
        break;
      case 'all':
        // Reset completo
        newConfig = getDefaultConfig();
        
        // Rimuovi anche dal localStorage
        localStorage.removeItem(storageKey);
        
        // Reset anche sul backend se l'utente è autenticato
        if (token && userId) {
          try {
            await fetch(`${apiBaseUrl}/user-settings/my-settings/customization`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customizationConfig: null
              }),
            });
          } catch (error) {
            console.error('Error resetting customization on backend:', error);
          }
        }
        
        setConfig(newConfig);
        return;
    }
    
    saveConfig(newConfig);
  }, [config, saveConfig, storageKey, token, userId, apiBaseUrl]);

  // Esporta configurazioni
  const exportCustomizations = useCallback(() => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  // Importa configurazioni
  const importCustomizations = useCallback((configJson: string) => {
    try {
      const importedConfig = JSON.parse(configJson);
      
      // Validazione base della struttura
      if (typeof importedConfig === 'object' && importedConfig !== null) {
        saveConfig(importedConfig);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing customizations:', error);
      return false;
    }
  }, [saveConfig]);

  // Ricarica configurazioni dal backend
  const reloadConfig = useCallback(() => {
    setLoading(true);
    loadConfigFromBackend();
  }, [loadConfigFromBackend]);

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
    reloadConfig,
  };
}