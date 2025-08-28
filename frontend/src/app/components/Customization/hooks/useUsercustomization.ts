import { useCustomization } from './useCustomization';
import { GridCustomization, FormCustomization } from '../types/customization.types';

export function useUserCustomization() {
  const {
    config,
    loading,
    updateGridCustomization,
    updateFormCustomization,
    updateGlobalCustomization,
    resetCustomization,
    exportCustomizations,
    importCustomizations
  } = useCustomization();

  // Metodi specializzati per la sezione utenti
  const updateUsersGridCustomization = (gridConfig: GridCustomization) => {
    updateGridCustomization('users-table', gridConfig);
  };

  const updateUserRegistrationFormCustomization = (formConfig: FormCustomization) => {
    updateFormCustomization('user-registration', formConfig);
  };

  const updateUserEditFormCustomization = (formConfig: FormCustomization) => {
    updateFormCustomization('user-edit', formConfig);
  };

  // Getter per configurazioni specifiche
  const getUsersGridConfig = () => config?.grids?.['users-table'] || null;
  const getUserRegistrationFormConfig = () => config?.forms?.['user-registration'] || null;
  const getUserEditFormConfig = () => config?.forms?.['user-edit'] || null;

  return {
    config,
    loading,
    
    // Metodi generici
    updateGridCustomization,
    updateFormCustomization,
    updateGlobalCustomization,
    resetCustomization,
    exportCustomizations,
    importCustomizations,
    
    // Metodi specializzati utenti
    updateUsersGridCustomization,
    updateUserRegistrationFormCustomization,
    updateUserEditFormCustomization,
    
    // Getter specializzati
    getUsersGridConfig,
    getUserRegistrationFormConfig,
    getUserEditFormConfig
  };
}