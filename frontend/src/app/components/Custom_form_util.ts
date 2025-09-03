// Utility di mapping/analisi del form DOM

export const getElementPath = (element: HTMLElement): string => {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
    } else {
      let classSelector = '';
      try {
        if (typeof (current.className) === 'string' && current.className.trim()) {
          classSelector = current.className.trim().split(/\s+/).join('.');
        } else if (current.classList && current.classList.length) {
          classSelector = Array.from(current.classList).join('.');
        } else {
          const attr = current.getAttribute && current.getAttribute('class');
          if (attr) classSelector = attr.trim().split(/\s+/).join('.');
        }
      } catch (e) {
        classSelector = '';
      }

      if (classSelector) selector += `.${classSelector}`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
};

export const traverseAllElements = () => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  if (!formContainer) return [];

  const allElements: any[] = [];

  const traverse = (node: Node, depth = 0) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const elementInfo = {
        depth,
        tag: element.tagName.toLowerCase(),
        id: element.id || null,
        className: element.className || null,
        type: element.getAttribute('type') || null,
        name: element.getAttribute('name') || null,
        label: element.getAttribute('aria-label') || null,
        textContent: element.textContent?.trim().substring(0, 100) || null,
        isInput: ['input', 'textarea', 'select'].includes(element.tagName.toLowerCase()),
        isButton: element.tagName.toLowerCase() === 'button',
        isSection: element.id?.includes('sezione_') || false,
        element: element,
        path: getElementPath(element)
      };
      allElements.push(elementInfo);
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      traverse(node.childNodes[i], depth + 1);
    }
  };

  traverse(formContainer);
  return allElements;
};

export const mapAllInputs = () => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  if (!formContainer) return [];

  const inputs = formContainer.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
  return Array.from(inputs).map((input, index) => ({
    index,
    type: input.type,
    name: input.name,
    id: input.id,
    value: input.value,
    disabled: input.disabled,
    required: input.required,
    placeholder: input.placeholder,
    element: input,
    parentSection: input.closest('[id^="sezione_"]')?.id || null
  }));
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
           section.querySelector('[variant="subtitle1"]')?.textContent || 'Senza titolo',
    element: section
  }));
};

export const mapFormStructure = () => {
  const sections = mapAllSections();
  const inputs = mapAllInputs();

  const sectionMap = sections.map(section => ({
    id: section.id,
    title: section.title,
    visible: section.visible,
    order: section.order,
    inputCount: section.inputCount,
    fields: inputs.filter(i => i.parentSection === section.id).map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      value: f.value,
      disabled: f.disabled,
      required: f.required,
      placeholder: f.placeholder
    }))
  }));

  return sectionMap;
};

export const queryElements = (selector: string, filters?: {
  visible?: boolean;
  enabled?: boolean;
  hasValue?: boolean;
}) => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement;
  if (!formContainer) return [];

  const elements = Array.from(formContainer.querySelectorAll(selector)) as HTMLElement[];
  if (!filters) return elements;

  return elements.filter(el => {
    if (filters.visible !== undefined) {
      const isVisible = el.style.display !== 'none' && !el.hidden && el.offsetParent !== null;
      if (isVisible !== filters.visible) return false;
    }

    if (filters.enabled !== undefined) {
      const input = el as HTMLInputElement;
      if (input.disabled === filters.enabled) return false;
    }

    if (filters.hasValue !== undefined) {
      const input = el as HTMLInputElement;
      const hasValue = input.value && input.value.trim() !== '';
      if (hasValue !== filters.hasValue) return false;
    }

    return true;
  });
};

export const getFormStats = () => {
  const allElements = traverseAllElements();
  const allInputs = mapAllInputs();
  const allSections = mapAllSections();

  return {
    totalElements: allElements.length,
    totalInputs: allInputs.length,
    totalSections: allSections.length,
    visibleInputs: allInputs.filter(input => !input.disabled).length,
    filledInputs: allInputs.filter(input => input.value && input.value.trim() !== '').length,
    visibleSections: allSections.filter(section => section.visible).length,
    elements: allElements,
    inputs: allInputs,
    sections: allSections,
    elementsByType: allElements.reduce((acc: Record<string, number>, el: any) => {
      acc[el.tag] = (acc[el.tag] || 0) + 1;
      return acc;
    }, {})
  };
};

// Funzioni di manipolazione DOM: visibilità, riordino, editabilità
export const hideField = (fieldId: string) => {
  const element = document.getElementById(fieldId);
  if (element) element.style.display = 'none';
};

export const showField = (fieldId: string) => {
  const element = document.getElementById(fieldId);
  if (element) element.style.display = '';
};

export const makeFieldReadOnly = (fieldId: string) => {
  const element = document.getElementById(fieldId);
  if (element) {
    const input = element.querySelector('input, textarea, select') as HTMLInputElement | null;
    if (input) input.disabled = true;
    element.style.opacity = '0.6';
  }
};

export const makeFieldEditable = (fieldId: string) => {
  const element = document.getElementById(fieldId);
  if (element) {
    const input = element.querySelector('input, textarea, select') as HTMLInputElement | null;
    if (input) input.disabled = false;
    element.style.opacity = '1';
  }
};

export const reorderField = (fieldId: string, order: number) => {
  const element = document.getElementById(fieldId);
  if (element) element.style.order = order.toString();
};

export const reorderSections = (sectionOrder: string[]) => {
  const formContainer = document.querySelector('[aria-label="Registration Form"]') as HTMLElement | null;
  if (!formContainer) return;
  
  // Applica l'ordine CSS a ogni sezione
  sectionOrder.forEach((sectionId, index) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.order = index.toString();
      // Forza il re-render del layout
      section.style.display = section.style.display || 'flex';
    }
  });
  
  // Assicura che il container supporti flexbox
  formContainer.style.display = 'flex';
  formContainer.style.flexDirection = 'column';
  
  // Debug: logga l'ordine applicato
  console.log('Riordino applicato:', sectionOrder.map((id, idx) => `${id}: ${idx}`));
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
  inputs.forEach(i => {
    const el = document.getElementById(i.id);
    if (el) {
      const input = el.querySelector('input, textarea, select') as HTMLInputElement | null;
      if (input) input.disabled = true;
      el.style.opacity = '0.6';
    }
  });
};

export const makeAllEditable = () => {
  const inputs = mapAllInputs();
  inputs.forEach(i => {
    const el = document.getElementById(i.id);
    if (el) {
      const input = el.querySelector('input, textarea, select') as HTMLInputElement | null;
      if (input) input.disabled = false;
      el.style.opacity = '1';
    }
  });
};

// === NUOVE FUNZIONI PER IL DIALOG ===

export type SectionConfig = {
  id: string;
  title: string;
  visible: boolean;
  readOnly: boolean;
  adminLocked: boolean;
  order: number;
};

// Mappa la configurazione corrente del form per il dialog
export const getCurrentFormConfig = (): SectionConfig[] => {
  const sections = mapAllSections();
  // Ordina le sezioni in base al loro ordine CSS effettivo
  const sortedSections = sections.sort((a, b) => {
    const orderA = Number(a.order) || a.index;
    const orderB = Number(b.order) || b.index;
    return orderA - orderB;
  });
  
  return sortedSections.map((section, index) => ({
    id: section.id,
    title: section.title,
    visible: section.visible,
    readOnly: isReadOnlySection(section.id),
    adminLocked: getAdminLock(section.id),
    order: index
  }));
};

// Verifica se una sezione è read-only controllando i suoi input
const isReadOnlySection = (sectionId: string): boolean => {
  const section = document.getElementById(sectionId);
  if (!section) return false;
  const inputs = section.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
  if (inputs.length === 0) return false;
  return Array.from(inputs).every(input => input.disabled);
};

// Gestisce l'admin lock (salva in localStorage per semplicità)
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

// Applica la configurazione dal dialog al DOM
export const applyFormConfig = (configs: SectionConfig[]) => {
  // Ordina le sezioni
  const sortedSections = configs.slice().sort((a, b) => a.order - b.order);
  reorderSections(sortedSections.map(s => s.id));

  // Applica visibilità, read-only e admin lock
  configs.forEach(config => {
    // Visibilità
    if (config.visible) {
      showSections([config.id]);
    } else {
      hideSections([config.id]);
    }

    // Read-only
    if (config.readOnly) {
      makeSectionReadOnly(config.id);
    } else {
      makeSectionEditable(config.id);
    }

    // Admin lock
    setAdminLock(config.id, config.adminLocked);
    
    // Applica stile visivo per admin lock
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
  });
};

// Salva configurazione completa
export const saveFormConfiguration = (name: string): string => {
  const config = {
    name,
    timestamp: new Date().toISOString(),
    sections: getCurrentFormConfig()
  };
  
  const configId = `form_config_${Date.now()}`;
  localStorage.setItem(configId, JSON.stringify(config));
  
  // Salva anche l'elenco delle configurazioni
  const configList = JSON.parse(localStorage.getItem('formConfigList') || '[]');
  configList.push({ id: configId, name, timestamp: config.timestamp });
  localStorage.setItem('formConfigList', JSON.stringify(configList));
  
  return configId;
};

// Carica configurazione
export const loadFormConfiguration = (configId: string): SectionConfig[] | null => {
  const configData = localStorage.getItem(configId);
  if (!configData) return null;
  
  try {
    const config = JSON.parse(configData);
    return config.sections || [];
  } catch (e) {
    console.error('Errore nel caricamento della configurazione:', e);
    return null;
  }
};

// Lista configurazioni salvate
export const getFormConfigurationList = () => {
  return JSON.parse(localStorage.getItem('formConfigList') || '[]');
};

