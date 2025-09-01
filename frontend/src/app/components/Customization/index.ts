// Componenti Customization
export { CompactCustomizableForm } from './components/CompactCustomizableForm';
export { CustomizableGrid } from './components/CustomizableGrid';
export { CustomizationProvider, useCustomizationContext } from './components/CustomizableProvider';
export { UnifiedCustomizationDialog } from './components/UnifiedCustomizationDialog';
export { GridCustomizationDialog } from './components/GridCustomizationDialog';

// Hooks
export { useCustomization } from './hooks/useCustomization';
export { useServerCustomization } from './hooks/useServerCustomization';
export { useAdminConfig } from './hooks/useAdminConfig';
export { useUserCustomization } from './hooks/useUsercustomization';

// Types
export type {
  GridColumn,
  GridCustomization,
  FormField,
  FormSection,
  FormCustomization,
  CustomizationConfig,
  CustomizationContextType,
} from './types/customization.types';

// Config
export { DEFAULT_FORM_CONFIGS } from './config/defaulteFormConfigs';
export { DEFAULT_GRID_CONFIGS } from './config/defaultGridConfigs';
