export interface GridColumn {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  defaultOrder?: number;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface GridCustomization {
  columns?: Array<{
    id: string;
    order?: number;
    hidden?: boolean;
    width?: number;
    pinned?: 'left' | 'right' | null;
  }>;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  defaultOrder?: number;
  section: string;
  readOnly?: boolean;
  hidden?: boolean;
  order?: number;
  adminLocked?: boolean; // Nuovo: se true, solo gli admin possono modificare questo campo
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSection {
  id: string;
  label: string;
  description?: string;
  defaultOrder?: number;
  collapsible?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  collapsed?: boolean;
  order?: number;
  adminLocked?: boolean; // Nuovo: se true, solo gli admin possono modificare questa sezione
  fields: FormField[];
}

export interface FormCustomization {
  sections?: Array<{
    id: string;
    order?: number;
    hidden?: boolean;
    readOnly?: boolean;
    collapsed?: boolean;
    adminLocked?: boolean; // Se true, solo gli admin possono modificare questa sezione
  }>;
  fields?: Array<{
    id: string;
    order?: number;
    hidden?: boolean;
    readOnly?: boolean;
    required?: boolean;
    adminLocked?: boolean; // Se true, solo gli admin possono modificare questo campo
  }>;
  layout?: 'vertical' | 'horizontal' | 'grid';
  compactMode?: boolean; // Nuovo: modalità compatta per l'interfaccia
}

export interface CustomizationConfig {
  grids?: {
    [gridId: string]: GridCustomization;
  };
  forms?: {
    [formId: string]: FormCustomization;
  };
  global?: {
    theme?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
    compactInterface?: boolean; // Modalità interfaccia compatta globale
  };
  adminRestrictions?: {
    [entityId: string]: {
      lockedFields?: string[];
      lockedSections?: string[];
    };
  };
}

export interface CustomizationContextType {
  config: CustomizationConfig | null;
  loading: boolean;
  error?: string | null;
  updateGridCustomization: (gridId: string, config: GridCustomization) => void;
  updateFormCustomization: (formId: string, config: FormCustomization) => void;
  updateGlobalCustomization: (config: CustomizationConfig['global']) => void;
  resetCustomization: (scope?: 'all' | 'grids' | 'forms' | 'global') => void;
  exportCustomizations: () => string;
  importCustomizations: (configJson: string) => boolean;
  updateAdminFieldRestrictions?: (targetUserId: number, restrictions: any) => Promise<any>;
  refreshConfig?: () => Promise<void>;
}