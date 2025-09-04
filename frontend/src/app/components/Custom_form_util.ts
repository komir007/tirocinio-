// Utility di mapping e gestione del form - Versione Semplificata

// === TIPI ===
export type FieldConfig = {
  id: string;
  containerId: string;
  name: string;
  type: string;
  value: string;
  disabled: boolean;
  required: boolean;
  placeholder: string;
  label: string;
  order: number;
  fieldIndex: number;
  visible: boolean;
  readOnly: boolean;
  adminLocked: boolean;
};

export type SectionConfig = {
  id: string;
  title: string;
  visible: boolean;
  readOnly: boolean;
  adminLocked: boolean;
  order: number;
  fields?: FieldConfig[];
};

// === FUNZIONI DI GESTIONE CAMPI ===
const getFieldAdminLock = (fieldId: string): boolean => {
  const locks = JSON.parse(localStorage.getItem('fieldAdminLocks') || '{}');
  return !!locks[fieldId];
};

const setFieldAdminLock = (fieldId: string, locked: boolean) => {
  const locks = JSON.parse(localStorage.getItem('fieldAdminLocks') || '{}');
  if (locked) {
    locks[fieldId] = true;
  } else {
    delete locks[fieldId];
  }
  localStorage.setItem('fieldAdminLocks', JSON.stringify(locks));
};

const isFieldVisible = (fieldId: string): boolean => {
  const element = document.getElementById(fieldId);
  if (!element) return false;
  return element.style.display !== 'none';
};

const isFieldReadOnly = (fieldId: string): boolean => {
  const element = document.getElementById(fieldId);
  if (!element) return false;
  const input = element.querySelector('input, textarea, select') as HTMLInputElement;
  return input ? input.disabled : false;
};

// Funzione per trovare il container completo di un campo MUI
const findFieldContainer = (fieldId: string): HTMLElement | null => {
  // Prima prova a cercare una box con pattern field-*-box
  const fieldBoxSelectors = [
    `#field-${fieldId}-box`,
    `[id*="field-${fieldId}-box"]`,
    `[id^="field-"][id*="${fieldId}"][id$="-box"]`,
    `[class*="field-${fieldId}-box"]`,
    `[class*="field"][class*="${fieldId}"][class*="box"]`
  ];
  
  console.log(`🔍 Cercando box per campo: ${fieldId}`);
  
  for (const selector of fieldBoxSelectors) {
    const boxElement = document.querySelector(selector) as HTMLElement;
    if (boxElement) {
      console.log(`📦 Trovata field-box per ${fieldId}:`, boxElement.id || boxElement.className);
      return boxElement;
    }
  }
  
  // Prima prova con l'ID diretto
  let element = document.getElementById(fieldId);
  
  if (!element) {
    // Se non trovato, cerca per name attribute
    const input = document.querySelector(`input[name="${fieldId}"], textarea[name="${fieldId}"], select[name="${fieldId}"]`) as HTMLElement;
    if (input) {
      element = input;
      console.log(`🎯 Trovato input per name: ${fieldId}`);
    }
  }
  
  if (!element) {
    console.warn(`⚠️ Element not found for fieldId: ${fieldId}`);
    return null;
  }
  
  // Cerca un container con pattern field-*-box come parent
  const fieldBoxParent = element.closest('[id*="field-"][id*="-box"], [class*="field-"][class*="-box"]') as HTMLElement;
  if (fieldBoxParent) {
    console.log(`📦 Trovato field-box parent per ${fieldId}:`, fieldBoxParent.id || fieldBoxParent.className);
    return fieldBoxParent;
  }
  
  // Per i campi MUI, cerca il container che include label + input
  // Possibili selettori per MUI components:
  const muiSelectors = [
    '.MuiFormControl-root',
    '.MuiTextField-root', 
    '.MuiInputBase-root',
    '[class*="MuiFormControl"]',
    '[class*="TextField"]'
  ];
  
  // Cerca il container MUI più vicino
  for (const selector of muiSelectors) {
    const muiContainer = element.closest(selector) as HTMLElement;
    if (muiContainer) {
      console.log(`📦 Found MUI container for ${fieldId}:`, muiContainer.className);
      return muiContainer;
    }
  }
  
  // Se non è un campo MUI, cerca un container generico
  const genericContainer = element.closest('[id]') || 
                          element.closest('.form-group') ||
                          element.closest('.field-container') ||
                          element.closest('div');
  
  if (genericContainer && genericContainer !== element && genericContainer instanceof HTMLElement) {
    console.log(`📦 Found generic container for ${fieldId}:`, genericContainer.id || genericContainer.className);
    return genericContainer;
  }
  
  // Fallback: ritorna l'elemento stesso
  console.log(`📦 Using element itself for ${fieldId}`);
  return element;
};
// === FUNZIONI DI MAPPING ===
export const mapAllInputs = () => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  if (!formContainer) return [];

  // Prima cerca tutte le field-box
  const fieldBoxes = formContainer.querySelectorAll('[id*="field-"][id*="-box"], [class*="field-"][class*="-box"]') as NodeListOf<HTMLElement>;
  console.log(`📦 Trovate ${fieldBoxes.length} field-box nel form`);

  const inputs = formContainer.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
  return Array.from(inputs).map((input, index) => {
    const parentSection = input.closest('[id^="sezione_"]') as HTMLElement;
    
    // Cerca il field-box container per questo input
    const fieldBox = input.closest('[id*="field-"][id*="-box"], [class*="field-"][class*="-box"]') as HTMLElement;
    const inputContainer = fieldBox || input.closest('[id]') as HTMLElement;
    
    console.log(`🔍 Input ${input.name || input.id}:`, {
      hasFieldBox: !!fieldBox,
      fieldBoxId: fieldBox?.id,
      containerId: inputContainer?.id
    });
    
    return {
      index,
      type: input.type,
      name: input.name,
      id: input.id,
      containerId: inputContainer?.id || input.id,
      fieldBoxId: fieldBox?.id || null,
      value: input.value,
      disabled: input.disabled,
      required: input.required,
      placeholder: input.placeholder,
      label: getFieldLabel(input),
      order: getFieldOrder(inputContainer || input, parentSection),
      element: input,
      container: inputContainer,
      fieldBox: fieldBox,
      parentSection: parentSection?.id || null
    };
  });
};

const getFieldLabel = (input: HTMLInputElement): string => {
  const label = input.labels?.[0] || document.querySelector(`label[for="${input.id}"]`);
  if (label) return label.textContent?.trim() || '';
  
  if (input.getAttribute('aria-label')) return input.getAttribute('aria-label') || '';
  if (input.placeholder) return input.placeholder;
  
  return input.name || input.id || 'Campo senza nome';
};

const getFieldOrder = (fieldElement: HTMLElement, parentSection: HTMLElement | null): number => {
  if (!parentSection || !fieldElement) return 0;
  
  const cssOrder = fieldElement.style.order;
  if (cssOrder) return parseInt(cssOrder, 10);
  
  const fieldsInSection = parentSection.querySelectorAll('input, textarea, select');
  return Array.from(fieldsInSection).findIndex(field => {
    const container = field.closest('[id]') || field;
    return container === fieldElement || container.contains(fieldElement);
  });
};

export const mapAllFieldBoxes = () => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  if (!formContainer) {
    console.warn('⚠️ Form container non trovato');
    return [];
  }

  const fieldBoxes = formContainer.querySelectorAll('[id*="field-"][id*="-box"], [class*="field-"][class*="-box"]') as NodeListOf<HTMLElement>;
  console.log(`📦 Mappatura di ${fieldBoxes.length} field-box trovate`);

  return Array.from(fieldBoxes).map((box, index) => {
    const parentSection = box.closest('[id^="sezione_"]') as HTMLElement;
    const inputs = box.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
    const primaryInput = inputs[0]; // Input principale della box
    
    console.log(`📦 Field-box ${box.id}:`, {
      inputCount: inputs.length,
      primaryInputName: primaryInput?.name,
      section: parentSection?.id
    });

    return {
      index,
      id: box.id,
      className: box.className,
      visible: box.style.display !== 'none',
      order: getFieldOrder(box, parentSection),
      inputCount: inputs.length,
      primaryInput: primaryInput ? {
        name: primaryInput.name,
        id: primaryInput.id,
        type: primaryInput.type,
        disabled: primaryInput.disabled,
        required: primaryInput.required
      } : null,
      label: getFieldBoxLabel(box),
      element: box,
      parentSection: parentSection?.id || null
    };
  });
};

const getFieldBoxLabel = (box: HTMLElement): string => {
  // Cerca la label dentro la field-box
  const label = box.querySelector('label');
  if (label) return label.textContent?.trim() || '';
  
  // Cerca un Typography o span con il testo della label
  const typography = box.querySelector('Typography, .MuiTypography-root, .field-label, span[class*="label"]');
  if (typography) return typography.textContent?.trim() || '';
  
  // Fallback: usa l'ID della box
  const idMatch = box.id.match(/field-(.+)-box/);
  return idMatch ? idMatch[1].replace(/-/g, ' ') : 'Campo senza nome';
};

export const mapAllSections = () => {
  const sections = document.querySelectorAll('[id^="sezione_"]') as NodeListOf<HTMLElement>;
  return Array.from(sections).map((section, index) => ({
    index,
    id: section.id,
    visible: section.style.display !== 'none',
    order: section.style.order || index.toString(),
    inputCount: section.querySelectorAll('input, textarea, select').length,
    title: section.querySelector('h1, h2, h3, h4, h5, h6')?.textContent || 
           section.querySelector('[variant="subtitle1"]')?.textContent || 
           section.querySelector('Typography')?.textContent || 'Senza titolo',
    element: section
  }));
};

export const mapFormStructure = () => {
  const sections = mapAllSections();
  const inputs = mapAllInputs();

  return sections.map((section, sectionIndex) => ({
    id: section.id,
    title: section.title,
    visible: section.visible,
    order: section.order,
    sectionIndex: sectionIndex,
    inputCount: section.inputCount,
    fields: inputs
      .filter(i => i.parentSection === section.id)
      .sort((a, b) => a.order - b.order)
      .map((f, fieldIndex) => ({
        id: f.id,
        containerId: f.containerId,
        name: f.name,
        type: f.type,
        value: f.value,
        disabled: f.disabled,
        required: f.required,
        placeholder: f.placeholder,
        label: f.label,
        order: f.order,
        fieldIndex: fieldIndex,
        visible: isFieldVisible(f.containerId || f.id),
        readOnly: isFieldReadOnly(f.containerId || f.id),
        adminLocked: getFieldAdminLock(f.containerId || f.id)
      }))
  }));
};

// === FUNZIONI DI MANIPOLAZIONE CAMPI ===
export const hideField = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    container.style.display = 'none';
    console.log(`🙈 Hidden field: ${fieldId}`);
  }
};

export const showField = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    container.style.display = '';
    console.log(`👁️ Shown field: ${fieldId}`);
  }
};

export const hideFields = (fieldIds: string[]) => {
  fieldIds.forEach(fieldId => hideField(fieldId));
};

export const showFields = (fieldIds: string[]) => {
  fieldIds.forEach(fieldId => showField(fieldId));
};

export const makeFieldReadOnly = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    const input = container.querySelector('input, textarea, select') as HTMLInputElement | null;
    if (input) {
      input.disabled = true;
      container.style.opacity = '0.6';
      console.log(`🔒 Made field read-only: ${fieldId}`);
    }
  }
};

export const makeFieldEditable = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    const input = container.querySelector('input, textarea, select') as HTMLInputElement | null;
    if (input) {
      input.disabled = false;
      container.style.opacity = '1';
      console.log(`✏️ Made field editable: ${fieldId}`);
    }
  }
};

export const makeFieldsReadOnly = (fieldIds: string[]) => {
  fieldIds.forEach(fieldId => makeFieldReadOnly(fieldId));
};

export const makeFieldsEditable = (fieldIds: string[]) => {
  fieldIds.forEach(fieldId => makeFieldEditable(fieldId));
};

export const reorderFieldsInSection = (sectionId: string, fieldOrder: string[]) => {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  fieldOrder.forEach((fieldId, index) => {
    const fieldElement = section.querySelector(`#${fieldId}`) || 
                        section.querySelector(`[id*="${fieldId}"]`);
    if (fieldElement && fieldElement instanceof HTMLElement) {
      fieldElement.style.order = index.toString();
    }
  });
  
  section.style.display = section.style.display || 'flex';
  section.style.flexDirection = 'column';
};

// === FUNZIONI DI MANIPOLAZIONE SEZIONI ===
export const reorderSections = (sectionOrder: string[]) => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement | null;
  if (!formContainer) return;
  
  sectionOrder.forEach((sectionId, index) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.order = index.toString();
      section.style.display = section.style.display || 'flex';
    }
  });
  
  formContainer.style.display = 'flex';
  formContainer.style.flexDirection = 'column';
};

export const hideSections = (sectionIds: string[]) => {
  sectionIds.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'none';
  });
};

export const showSections = (sectionIds: string[]) => {
  sectionIds.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = '';
  });
};

export const makeSectionReadOnly = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const inputs = section.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.disabled = true);
    section.style.opacity = '0.6';
  }
};

export const makeSectionEditable = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const inputs = section.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.disabled = false);
    section.style.opacity = '1';
  }
};

export const hideAllFields = () => {
  const sections = mapAllSections();
  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) el.style.display = 'none';
  });
};

export const showAllFields = () => {
  const sections = mapAllSections();
  sections.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) el.style.display = '';
  });
};

export const makeAllReadOnly = () => {
  const inputs = mapAllInputs();
  inputs.forEach(i => makeFieldReadOnly(i.id));
};

export const makeAllEditable = () => {
  const inputs = mapAllInputs();
  inputs.forEach(i => makeFieldEditable(i.id));
};

// === GESTIONE SINGOLI CAMPI ===
export const toggleFieldVisibility = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    const isVisible = container.style.display !== 'none';
    container.style.display = isVisible ? 'none' : '';
    console.log(`🔀 Toggled field visibility: ${fieldId} -> ${isVisible ? 'hidden' : 'visible'}`);
  }
};

export const toggleFieldReadOnly = (fieldId: string) => {
  const container = findFieldContainer(fieldId);
  if (container) {
    const input = container.querySelector('input, textarea, select') as HTMLInputElement;
    if (input) {
      input.disabled = !input.disabled;
      container.style.opacity = input.disabled ? '0.6' : '1';
      console.log(`🔀 Toggled field read-only: ${fieldId} -> ${input.disabled ? 'read-only' : 'editable'}`);
    }
  }
};

export const toggleFieldAdminLock = (fieldId: string) => {
  const currentLock = getFieldAdminLock(fieldId);
  setFieldAdminLock(fieldId, !currentLock);
  
  const container = findFieldContainer(fieldId);
  if (container) {
    if (!currentLock) {
      container.style.border = '2px solid #ff5722';
      container.style.borderRadius = '4px';
      container.style.padding = '2px';
    } else {
      container.style.border = '';
      container.style.borderRadius = '';
      container.style.padding = '';
    }
    console.log(`🔀 Toggled field admin lock: ${fieldId} -> ${!currentLock ? 'locked' : 'unlocked'}`);
  }
};

export const reorderField = (sectionId: string, fieldId: string, newOrder: number) => {
  const section = document.getElementById(sectionId);
  if (!section) return;
  
  const fieldContainer = findFieldContainer(fieldId);
  if (fieldContainer && fieldContainer instanceof HTMLElement) {
    fieldContainer.style.order = newOrder.toString();
    console.log(`🔄 Reordered field: ${fieldId} -> order ${newOrder}`);
  }
};

// === GESTIONE CONFIGURAZIONI ===
const isReadOnlySection = (sectionId: string): boolean => {
  const section = document.getElementById(sectionId);
  if (!section) return false;
  const inputs = section.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
  if (inputs.length === 0) return false;
  return Array.from(inputs).every(input => input.disabled);
};

export const getAdminLock = (sectionId: string): boolean => {
  const locks = JSON.parse(localStorage.getItem('adminLocks') || '{}');
  return !!locks[sectionId];
};

export const setAdminLock = (sectionId: string, locked: boolean) => {
  const locks = JSON.parse(localStorage.getItem('adminLocks') || '{}');
  if (locked) {
    locks[sectionId] = true;
  } else {
    delete locks[sectionId];
  }
  localStorage.setItem('adminLocks', JSON.stringify(locks));
};

export const getCurrentFormConfig = (): SectionConfig[] => {
  const sections = mapFormStructure();
  const fieldBoxes = mapAllFieldBoxes();
  
  console.log('🗺️ Mapped form structure:', sections);
  console.log('📦 Mapped field-boxes:', fieldBoxes);
  
  const sortedSections = sections.sort((a, b) => {
    const orderA = Number(a.order) || a.sectionIndex;
    const orderB = Number(b.order) || b.sectionIndex;
    return orderA - orderB;
  });
  
  return sortedSections.map((section, index) => ({
    id: section.id,
    title: section.title,
    visible: section.visible,
    readOnly: isReadOnlySection(section.id),
    adminLocked: getAdminLock(section.id),
    order: index,
    fields: section.fields || [],
    fieldBoxes: fieldBoxes.filter(box => box.parentSection === section.id)
  }));
};

export const applyFormConfig = (configs: SectionConfig[]) => {
  console.log('🔧 Applying form config:', configs);
  
  const sortedSections = configs.slice().sort((a, b) => a.order - b.order);
  reorderSections(sortedSections.map(s => s.id));

  configs.forEach(config => {
    console.log(`📋 Processing section: ${config.id}`);
    
    if (config.visible) {
      showSections([config.id]);
    } else {
      hideSections([config.id]);
    }

    if (config.readOnly) {
      makeSectionReadOnly(config.id);
    } else {
      makeSectionEditable(config.id);
    }

    setAdminLock(config.id, config.adminLocked);
    
    const section = document.getElementById(config.id);
    if (section) {
      if (config.adminLocked) {
        section.style.border = '2px solid #ff5722';
        section.style.borderRadius = '8px';
      } else {
        section.style.border = '';
        section.style.borderRadius = '';
      }
    }

    if (config.fields && config.fields.length > 0) {
      console.log(`  📝 Processing ${config.fields.length} fields for section ${config.id}`);
      const sortedFields = config.fields.slice().sort((a, b) => a.order - b.order);
      reorderFieldsInSection(config.id, sortedFields.map(f => f.containerId || f.id));

      config.fields.forEach(field => {
        const fieldId = field.containerId || field.id;
        const fieldContainer = findFieldContainer(fieldId);
        
        console.log(`    🎯 Field ${field.id} (${fieldId}):`, fieldContainer ? 'Found' : 'NOT FOUND');
        
        if (fieldContainer) {
          // Gestione visibilità campo
          if (field.visible !== undefined) {
            console.log(`      👁️ Setting visibility: ${field.visible}`);
            fieldContainer.style.display = field.visible ? '' : 'none';
          }

          // Gestione read-only campo
          if (field.readOnly !== undefined) {
            console.log(`      🔒 Setting readOnly: ${field.readOnly}`);
            const input = fieldContainer.querySelector('input, textarea, select') as HTMLInputElement;
            if (input) {
              input.disabled = field.readOnly;
              fieldContainer.style.opacity = field.readOnly ? '0.6' : '1';
            }
          }

          // Gestione admin lock campo
          setFieldAdminLock(fieldId, field.adminLocked);
          if (field.adminLocked) {
            console.log(`      🛡️ Setting admin lock: true`);
            fieldContainer.style.border = '2px solid #ff5722';
            fieldContainer.style.borderRadius = '4px';
            fieldContainer.style.padding = '2px';
          } else {
            fieldContainer.style.border = '';
            fieldContainer.style.borderRadius = '';
            fieldContainer.style.padding = '';
          }
        } else {
          console.warn(`⚠️ Field container not found for ${field.id} (tried ID: ${fieldId})`);
          
          // Debugging: mostra elementi simili
          const similarElements = document.querySelectorAll(`[id*="${field.id}"], [name="${field.id}"]`);
          if (similarElements.length > 0) {
            console.log(`🔍 Found ${similarElements.length} similar elements:`, 
              Array.from(similarElements).map(el => ({ 
                id: (el as HTMLElement).id, 
                name: (el as HTMLInputElement).name,
                className: el.className 
              }))
            );
          }
        }
      });
    }
  });
  
  console.log('✅ Form config application completed');
};

// === FUNZIONI DI DEBUG ===
export const debugFormStructure = () => {
  console.log('🔍 DEBUG: Analyzing form structure...');
  
  // Trova il form container
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  console.log('📋 Form container:', formContainer ? 'Found' : 'NOT FOUND');
  
  if (!formContainer) {
    console.log('⚠️ Form container not found. Looking for alternative selectors...');
    const forms = document.querySelectorAll('form');
    console.log(`Found ${forms.length} form elements:`, forms);
    return;
  }
  
  // Trova tutte le sezioni
  const sections = formContainer.querySelectorAll('[id^="sezione_"]');
  console.log(`📁 Found ${sections.length} sections:`);
  
  sections.forEach((section, index) => {
    const sectionElement = section as HTMLElement;
    console.log(`  ${index + 1}. Section ID: ${sectionElement.id}`);
    console.log(`     Visible: ${sectionElement.style.display !== 'none'}`);
    
    // Trova tutti i campi nella sezione
    const fields = sectionElement.querySelectorAll('input, textarea, select');
    console.log(`     Fields: ${fields.length}`);
    
    fields.forEach((field, fieldIndex) => {
      const fieldElement = field as HTMLElement;
      const container = fieldElement.closest('[id]') as HTMLElement;
      console.log(`       ${fieldIndex + 1}. Field ID: ${fieldElement.id}`);
      console.log(`          Container ID: ${container?.id || 'No container'}`);
      console.log(`          Type: ${fieldElement.tagName} ${(field as HTMLInputElement).type || ''}`);
      console.log(`          Name: ${(field as HTMLInputElement).name || 'No name'}`);
      console.log(`          Visible: ${fieldElement.style.display !== 'none' && container?.style.display !== 'none'}`);
      console.log(`          Disabled: ${(field as HTMLInputElement).disabled}`);
    });
  });
  
  return {
    formContainer,
    sectionsCount: sections.length,
    sections: Array.from(sections).map(s => s.id)
  };
};

export const debugFieldById = (fieldId: string) => {
  console.log(`🎯 DEBUG: Analyzing field "${fieldId}"...`);
  
  const element = document.getElementById(fieldId);
  if (!element) {
    console.log(`❌ Element with ID "${fieldId}" not found`);
    
    // Cerca elementi simili
    const similar = document.querySelectorAll(`[id*="${fieldId}"]`);
    if (similar.length > 0) {
      console.log(`🔍 Found ${similar.length} similar elements:`);
      similar.forEach((el, i) => console.log(`  ${i + 1}. ${(el as HTMLElement).id}`));
    }
    return null;
  }
  
  console.log(`✅ Element found:`, element);
  console.log(`   Tag: ${element.tagName}`);
  console.log(`   ID: ${element.id}`);
  console.log(`   Display: ${element.style.display || 'default'}`);
  console.log(`   Opacity: ${element.style.opacity || 'default'}`);
  
  // Se è un input container, cerca l'input interno
  const input = element.querySelector('input, textarea, select') as HTMLInputElement;
  if (input) {
    console.log(`   Input found:`, input);
    console.log(`     Type: ${input.type}`);
    console.log(`     Name: ${input.name}`);
    console.log(`     Disabled: ${input.disabled}`);
  }
  
  return { element, input };
};
