import { useEffect, useState, useCallback, useContext } from 'react';
import { CustomizationConfig, GridCustomization, FormCustomization } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';

export function useCustomization() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  
  const [config, setConfig] = useState<CustomizationConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const storageKey = `track_customization_${userId || 'anonymous'}`;

  // Carica configurazioni dal localStorage
  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem(storageKey);
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig(parsedConfig);
        } else {
          // Inizializza configurazione vuota
          setConfig({
            grids: {},
            forms: {},
            global: {
              theme: 'light',
              language: 'it',
              dateFormat: 'DD/MM/YYYY',
              timeFormat: '24h',
            }
          });
        }
      } catch (error) {
        console.error('Error loading customization config:', error);
        setConfig({
          grids: {},
          forms: {},
          global: {}
        });
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [storageKey]);

  // Salva configurazioni nel localStorage
  const saveConfig = useCallback((newConfig: CustomizationConfig) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Error saving customization config:', error);
    }
  }, [storageKey]);

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
        newConfig.global = {};
        break;
      case 'all':
        localStorage.removeItem(storageKey);
        setConfig({
          grids: {},
          forms: {},
          global: {}
        });
        return;
    }
    
    saveConfig(newConfig);
  }, [config, saveConfig, storageKey]);

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

  return {
    config,
    loading,
    updateGridCustomization,
    updateFormCustomization,
    updateGlobalCustomization,
    resetCustomization,
    exportCustomizations,
    importCustomizations
  };
}