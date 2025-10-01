import { 
  CustomizationConfig, 
  GridCustomization, 
  FormCustomization,
  GridColumn,
  FormSection 
} from '../types/customization.types';

/**
 * Utility per unire configurazioni di customizzazione
 */
export class ConfigMerge {
  /**
   * Unisce una configurazione di base con una personalizzata
   */
  static mergeConfigs(
    baseConfig: CustomizationConfig,
    userConfig: Partial<CustomizationConfig>
  ): CustomizationConfig {
    return {
      grids: {
        ...baseConfig.grids,
        ...this.mergeGridConfigs(baseConfig.grids || {}, userConfig.grids || {})
      },
      forms: {
        ...baseConfig.forms,
        ...this.mergeFormConfigs(baseConfig.forms || {}, userConfig.forms || {})
      },
      global: {
        ...baseConfig.global,
        ...userConfig.global
      }
    };
  }

  /**
   * Unisce configurazioni delle griglie
   */
  private static mergeGridConfigs(
    baseGrids: Record<string, GridCustomization>,
    userGrids: Record<string, GridCustomization>
  ): Record<string, GridCustomization> {
    const merged: Record<string, GridCustomization> = { ...baseGrids };
    
    Object.entries(userGrids).forEach(([gridId, userGrid]) => {
      const baseGrid = merged[gridId] || {};
      
      merged[gridId] = {
        ...baseGrid,
        ...userGrid,
        columns: this.mergeGridColumns(baseGrid.columns || [], userGrid.columns || []),
        filters: { ...baseGrid.filters, ...userGrid.filters }
      };
    });

    return merged;
  }

  /**
   * Unisce configurazioni delle colonne
   */
  private static mergeGridColumns(
    baseColumns: GridCustomization['columns'],
    userColumns: GridCustomization['columns']
  ): GridCustomization['columns'] {
    if (!baseColumns) return userColumns;
    if (!userColumns) return baseColumns;

    const merged = [...baseColumns];
    
    userColumns.forEach(userColumn => {
      const existingIndex = merged.findIndex(col => col.id === userColumn.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...userColumn };
      } else {
        merged.push(userColumn);
      }
    });

    return merged;
  }

  /**
   * Unisce configurazioni dei form
   */
  private static mergeFormConfigs(
    baseForms: Record<string, FormCustomization>,
    userForms: Record<string, FormCustomization>
  ): Record<string, FormCustomization> {
    const merged: Record<string, FormCustomization> = { ...baseForms };
    
    Object.entries(userForms).forEach(([formId, userForm]) => {
      const baseForm = merged[formId] || {};
      
      merged[formId] = {
        ...baseForm,
        ...userForm,
        sections: this.mergeFormSections(baseForm.sections || [], userForm.sections || []),
        fields: this.mergeFormFields(baseForm.fields || [], userForm.fields || [])
      };
    });

    return merged;
  }

  /**
   * Unisce configurazioni delle sezioni
   */
  private static mergeFormSections(
    baseSections: FormCustomization['sections'],
    userSections: FormCustomization['sections']
  ): FormCustomization['sections'] {
    if (!baseSections) return userSections;
    if (!userSections) return baseSections;

    const merged = [...baseSections];
    
    userSections.forEach(userSection => {
      const existingIndex = merged.findIndex(section => section.id === userSection.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...userSection };
      } else {
        merged.push(userSection);
      }
    });

    return merged;
  }

  /**
   * Unisce configurazioni dei campi
   */
  private static mergeFormFields(
    baseFields: FormCustomization['fields'],
    userFields: FormCustomization['fields']
  ): FormCustomization['fields'] {
    if (!baseFields) return userFields;
    if (!userFields) return baseFields;

    const merged = [...baseFields];
    
    userFields.forEach(userField => {
      const existingIndex = merged.findIndex(field => field.id === userField.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...userField };
      } else {
        merged.push(userField);
      }
    });

    return merged;
  }

  /**
   * Applica una configurazione di griglia alle colonne di default
   */
  static applyGridCustomization(
    defaultColumns: GridColumn[],
    customization: GridCustomization
  ): GridColumn[] {
    let columns = [...defaultColumns];
    
    if (customization.columns) {
      columns = columns
        .map(column => {
          const customColumn = customization.columns?.find(c => c.id === column.id);
          return {
            ...column,
            order: customColumn?.order ?? column.defaultOrder ?? 0,
            hidden: customColumn?.hidden ?? false,
            width: customColumn?.width ?? column.minWidth,
          };
        })
        .filter(column => !column.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    return columns;
  }

  /**
   * Applica una configurazione di form alle sezioni di default
   */
  static applyFormCustomization(
    defaultSections: FormSection[],
    customization: FormCustomization
  ): FormSection[] {
    let sections = [...defaultSections];
    
    // Applica customizzazioni sezioni
    if (customization.sections) {
      sections = sections
        .map(section => {
          const customSection = customization.sections?.find(cs => cs.id === section.id);
          return {
            ...section,
            order: customSection?.order ?? section.defaultOrder ?? 0,
            hidden: customSection?.hidden ?? false,
            readOnly: customSection?.readOnly ?? false,
            collapsed: customSection?.collapsed ?? false,
          };
        })
        .filter(section => !section.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // Applica customizzazioni campi
    if (customization.fields) {
      sections = sections.map(section => ({
        ...section,
        fields: section.fields
          .map(field => {
            const customField = customization.fields?.find(cf => cf.id === field.id);
            return {
              ...field,
              order: customField?.order ?? field.defaultOrder ?? 0,
              hidden: customField?.hidden ?? false,
              readOnly: customField?.readOnly ?? false,
              required: customField?.required ?? field.required ?? false,
            };
          })
          .filter(field => !field.hidden)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
    }
    
    return sections;
  }

  /**
   * Valida una configurazione
   */
  static validateConfig(config: any): boolean {
    try {
      if (typeof config !== 'object' || config === null) {
        return false;
      }

      // Valida grids
      if (config.grids && typeof config.grids === 'object') {
        for (const [gridId, gridConfig] of Object.entries(config.grids)) {
          if (typeof gridId !== 'string' || typeof gridConfig !== 'object') {
            return false;
          }
        }
      }

      // Valida forms
      if (config.forms && typeof config.forms === 'object') {
        for (const [formId, formConfig] of Object.entries(config.forms)) {
          if (typeof formId !== 'string' || typeof formConfig !== 'object') {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crea una configurazione vuota
   */
  static createEmptyConfig(): CustomizationConfig {
    return {
      grids: {},
      forms: {},
      global: {
        theme: 'light',
        language: 'it',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      }
    };
  }

  /**
   * Clona in profondità una configurazione
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}