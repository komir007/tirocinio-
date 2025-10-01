import { GridColumn, GridCustomization, FormSection, FormCustomization } from '../types/customization.types';

export class CustomizationHelpers {
  /**
   * Applica customizzazioni alle colonne di una griglia
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
   * Applica customizzazioni alle sezioni di un form
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
   * Valida una configurazione di customizzazione
   */
  static validateCustomization(config: any): boolean {
    try {
      // Validazioni base
      if (typeof config !== 'object' || config === null) {
        return false;
      }

      // Valida struttura griglia
      if (config.grids) {
        for (const [gridId, gridConfig] of Object.entries(config.grids)) {
          if (typeof gridId !== 'string' || typeof gridConfig !== 'object') {
            return false;
          }
        }
      }

      // Valida struttura form
      if (config.forms) {
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
   * Merge configurazioni con priorità
   */
  static mergeConfigurations(
    baseConfig: any,
    userConfig: any,
    systemConfig?: any
  ): any {
    return {
      ...systemConfig,
      ...baseConfig,
      ...userConfig,
      grids: {
        ...systemConfig?.grids,
        ...baseConfig?.grids,
        ...userConfig?.grids,
      },
      forms: {
        ...systemConfig?.forms,
        ...baseConfig?.forms,
        ...userConfig?.forms,
      },
      global: {
        ...systemConfig?.global,
        ...baseConfig?.global,
        ...userConfig?.global,
      }
    };
  }

  /**
   * Esporta configurazioni in formato JSON leggibile
   */
  static exportConfiguration(config: any, options: {
    includeMetadata?: boolean;
    prettify?: boolean;
  } = {}): string {
    const exportData = {
      ...(options.includeMetadata && {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          type: 'track-customization'
        }
      }),
      configuration: config
    };

    return JSON.stringify(
      exportData,
      null,
      options.prettify ? 2 : 0
    );
  }

  /**
   * Importa configurazioni da JSON
   */
  static importConfiguration(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Se ha metadata, estrai la configurazione
      if (parsed.metadata && parsed.configuration) {
        return parsed.configuration;
      }
      
      // Altrimenti assume che sia direttamente la configurazione
      return parsed;
    } catch (error) {
      throw new Error('Formato JSON non valido');
    }
  }

  /**
   * Genera configurazione di esempio
   */
  static generateSampleConfiguration(): any {
    return {
      grids: {
        'users-table': {
          columns: [
            { id: 'name', order: 1, hidden: false, width: 200 },
            { id: 'email', order: 2, hidden: false, width: 250 },
            { id: 'role', order: 3, hidden: false, width: 150 },
            { id: 'createdAt', order: 4, hidden: true, width: 180 }
          ],
          pageSize: 25,
          sortBy: 'name',
          sortOrder: 'asc'
        }
      },
      forms: {
        'user-registration': {
          sections: [
            { id: 'personal-info', order: 1, hidden: false, readOnly: false },
            { id: 'security', order: 2, hidden: false, readOnly: false },
            { id: 'permissions', order: 3, hidden: false, readOnly: false }
          ],
          fields: [
            { id: 'name', order: 1, hidden: false, readOnly: false },
            { id: 'email', order: 2, hidden: false, readOnly: false },
            { id: 'password', order: 1, hidden: false, readOnly: false },
            { id: 'role', order: 1, hidden: false, readOnly: true }
          ],
          layout: 'vertical'
        }
      },
      global: {
        theme: 'light',
        language: 'it',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      }
    };
  }
}