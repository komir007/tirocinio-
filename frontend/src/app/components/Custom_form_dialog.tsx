"use client";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionConfig, FieldConfig } from './Custom_form_util';

// Funzione helper per trovare il container MUI
const findFieldContainer = (fieldId: string): HTMLElement | null => {
  // Prima prova con l'ID diretto
  let element = document.getElementById(fieldId);
  
  if (!element) {
    // Se non trovato, cerca per name attribute
    const input = document.querySelector(`input[name="${fieldId}"], textarea[name="${fieldId}"], select[name="${fieldId}"]`) as HTMLElement;
    if (input) {
      element = input;
    }
  }
  
  if (!element) {
    console.warn(`⚠️ Element not found for fieldId: ${fieldId}`);
    return null;
  }
  
  // Per i campi MUI, cerca il container che include label + input
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
      return muiContainer;
    }
  }
  
  // Se non è un campo MUI, cerca un container generico
  const genericContainer = element.closest('[id]') || 
                          element.closest('.form-group') ||
                          element.closest('.field-container') ||
                          element.closest('div');
  
  if (genericContainer && genericContainer !== element && genericContainer instanceof HTMLElement) {
    return genericContainer;
  }
  
  // Fallback: ritorna l'elemento stesso
  return element;
};

function SortableItem({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    marginBottom: 8,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    boxShadow: transform ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
  };

  return (
    <ListItem ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
      <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
      <ListItemText 
        primary={title} 
        secondary={subtitle}
        primaryTypographyProps={{ fontWeight: 500 }}
      />
    </ListItem>
  );
}

function SortableField({ id, title, subtitle }: { id: string; title: string; subtitle?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'linear-gradient(135deg, #e8f5e8 0%, #b3d9b3 100%)',
    marginBottom: 4,
    borderRadius: 6,
    border: '1px solid #c8e6c9',
    boxShadow: transform ? '0 2px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
    marginLeft: 16,
  };

  return (
    <ListItem ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}>
      <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
      <ListItemText 
        primary={title} 
        secondary={subtitle}
        primaryTypographyProps={{ fontWeight: 400, fontSize: '0.9rem' }}
        secondaryTypographyProps={{ fontSize: '0.8rem' }}
      />
    </ListItem>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  sections: SectionConfig[];
  onChange: (newSections: SectionConfig[]) => void;
};

export default function CustomFormDialog({ open, onClose, sections, onChange }: Props) {
  const [localSections, setLocalSections] = React.useState<SectionConfig[]>(sections || []);
  const [activeTab, setActiveTab] = React.useState(0);
  const [selectedSectionId, setSelectedSectionId] = React.useState<string>('');

  React.useEffect(() => {
    setLocalSections(sections || []);
    if (sections && sections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    
    if (active.id !== over.id) {
      // Controlla se stiamo riordinando sezioni o campi
      if (active.id.startsWith('field_') && over.id.startsWith('field_')) {
        // Riordino campi
        const activeFieldId = active.id.replace('field_', '');
        const overFieldId = over.id.replace('field_', '');
        
        setLocalSections(prev => prev.map(section => {
          if (section.id === selectedSectionId && section.fields) {
            const oldIndex = section.fields.findIndex(f => f.id === activeFieldId);
            const newIndex = section.fields.findIndex(f => f.id === overFieldId);
            
            if (oldIndex >= 0 && newIndex >= 0) {
              const newFields = arrayMove(section.fields, oldIndex, newIndex);
              return {
                ...section,
                fields: newFields.map((field, index) => ({
                  ...field,
                  order: index
                }))
              };
            }
          }
          return section;
        }));
      } else {
        // Riordino sezioni
        const oldIndex = localSections.findIndex(s => s.id === active.id);
        const newIndex = localSections.findIndex(s => s.id === over.id);
        if (oldIndex >= 0 && newIndex >= 0) {
          setLocalSections((items) => {
            const newItems = arrayMove(items, oldIndex, newIndex);
            return newItems.map((section, index) => ({
              ...section,
              order: index
            }));
          });
        }
      }
    }
  };

  const toggleVisibility = (id: string) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === id) {
        const newVisible = !s.visible;
        // Applica immediatamente al DOM
        const sectionElement = document.getElementById(id);
        if (sectionElement) {
          sectionElement.style.display = newVisible ? '' : 'none';
        }
        return { ...s, visible: newVisible };
      }
      return s;
    }));
  };

  const toggleReadOnly = (id: string) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === id) {
        const newReadOnly = !s.readOnly;
        // Applica immediatamente al DOM
        const sectionElement = document.getElementById(id);
        if (sectionElement) {
          const inputs = sectionElement.querySelectorAll('input, textarea, select') as NodeListOf<HTMLInputElement>;
          inputs.forEach(input => input.disabled = newReadOnly);
          sectionElement.style.opacity = newReadOnly ? '0.6' : '1';
        }
        return { ...s, readOnly: newReadOnly };
      }
      return s;
    }));
  };

  const toggleAdminLock = (id: string) => {
    setLocalSections(prev => prev.map(s => {
      if (s.id === id) {
        const newAdminLocked = !s.adminLocked;
        // Applica immediatamente al DOM
        const sectionElement = document.getElementById(id);
        if (sectionElement) {
          if (newAdminLocked) {
            sectionElement.style.border = '2px solid #ff5722';
            sectionElement.style.borderRadius = '8px';
          } else {
            sectionElement.style.border = '';
            sectionElement.style.borderRadius = '';
          }
        }
        return { ...s, adminLocked: newAdminLocked };
      }
      return s;
    }));
  };

  // Funzioni per i campi
  const toggleFieldVisibility = (sectionId: string, fieldId: string) => {
    setLocalSections(prev => prev.map(section => {
      if (section.id === sectionId && section.fields) {
        return {
          ...section,
          fields: section.fields.map(field => {
            if (field.id === fieldId) {
              const newVisible = !field.visible;
              // Applica immediatamente al DOM usando la nuova funzione
              const fieldContainer = findFieldContainer(field.containerId || field.id);
              if (fieldContainer) {
                fieldContainer.style.display = newVisible ? '' : 'none';
                console.log(`🔀 Field visibility toggled: ${fieldId} -> ${newVisible ? 'visible' : 'hidden'}`);
              }
              return { ...field, visible: newVisible };
            }
            return field;
          })
        };
      }
      return section;
    }));
  };

  const toggleFieldReadOnly = (sectionId: string, fieldId: string) => {
    setLocalSections(prev => prev.map(section => {
      if (section.id === sectionId && section.fields) {
        return {
          ...section,
          fields: section.fields.map(field => {
            if (field.id === fieldId) {
              const newReadOnly = !field.readOnly;
              // Applica immediatamente al DOM usando la nuova funzione
              const fieldContainer = findFieldContainer(field.containerId || field.id);
              if (fieldContainer) {
                const input = fieldContainer.querySelector('input, textarea, select') as HTMLInputElement;
                if (input) {
                  input.disabled = newReadOnly;
                  fieldContainer.style.opacity = newReadOnly ? '0.6' : '1';
                  console.log(`🔀 Field read-only toggled: ${fieldId} -> ${newReadOnly ? 'read-only' : 'editable'}`);
                }
              }
              return { ...field, readOnly: newReadOnly };
            }
            return field;
          })
        };
      }
      return section;
    }));
  };

  const toggleFieldAdminLock = (sectionId: string, fieldId: string) => {
    setLocalSections(prev => prev.map(section => {
      if (section.id === sectionId && section.fields) {
        return {
          ...section,
          fields: section.fields.map(field => {
            if (field.id === fieldId) {
              const newAdminLocked = !field.adminLocked;
              // Applica immediatamente al DOM usando la nuova funzione
              const fieldContainer = findFieldContainer(field.containerId || field.id);
              if (fieldContainer) {
                if (newAdminLocked) {
                  fieldContainer.style.border = '2px solid #ff5722';
                  fieldContainer.style.borderRadius = '4px';
                  fieldContainer.style.padding = '2px';
                } else {
                  fieldContainer.style.border = '';
                  fieldContainer.style.borderRadius = '';
                  fieldContainer.style.padding = '';
                }
                console.log(`🔀 Field admin lock toggled: ${fieldId} -> ${newAdminLocked ? 'locked' : 'unlocked'}`);
              }
              return { ...field, adminLocked: newAdminLocked };
            }
            return field;
          })
        };
      }
      return section;
    }));
  };

  const handleSave = () => {
    console.log('Salvataggio delle modifiche...', localSections);
    
    // Debug: mostra ID degli elementi nel DOM
    localSections.forEach(section => {
      console.log(`Sezione ${section.id}:`, document.getElementById(section.id) ? 'Trovata' : 'NON TROVATA');
      if (section.fields) {
        section.fields.forEach(field => {
          const fieldElement = document.getElementById(field.containerId || field.id);
          console.log(`  Campo ${field.id} (container: ${field.containerId}):`, fieldElement ? 'Trovato' : 'NON TROVATO');
          if (fieldElement) {
            console.log(`    Display: ${fieldElement.style.display || 'default'}`);
            const input = fieldElement.querySelector('input, textarea, select') as HTMLInputElement;
            if (input) {
              console.log(`    Input disabled: ${input.disabled}`);
            }
          }
        });
      }
    });
    
    onChange(localSections);
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
      {value === index && children}
    </div>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminPanelSettingsIcon color="primary" />
          Configurazione Form
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab 
            icon={<DragIndicatorIcon />} 
            label="Sezioni" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<DragIndicatorIcon />} 
            label="Campi" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<VisibilityIcon />} 
            label="Visibilità" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<LockIcon />} 
            label="Read-Only" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<AdminPanelSettingsIcon />} 
            label="Admin Lock" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        </Tabs>

        <Box sx={{ px: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Riordina le sezioni
            </Typography>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={localSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                  {localSections.map((s, idx) => (
                    <SortableItem 
                      key={s.id} 
                      id={s.id} 
                      title={s.title} 
                      subtitle={`Posizione ${idx + 1} • ${s.id}`} 
                    />
                  ))}
                </List>
              </SortableContext>
            </DndContext>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Trascina gli elementi per riordinarli
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Riordina i campi per sezione
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Seleziona sezione:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {localSections.map(section => (
                  <Button
                    key={section.id}
                    variant={selectedSectionId === section.id ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    {section.title}
                  </Button>
                ))}
              </Box>
            </Box>
            {selectedSectionId && localSections.find(s => s.id === selectedSectionId)?.fields && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext 
                  items={localSections.find(s => s.id === selectedSectionId)?.fields?.map(f => `field_${f.id}`) || []} 
                  strategy={verticalListSortingStrategy}
                >
                  <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                    {localSections.find(s => s.id === selectedSectionId)?.fields?.map((field, idx) => (
                      <SortableField 
                        key={`field_${field.id}`} 
                        id={`field_${field.id}`} 
                        title={field.label || field.name} 
                        subtitle={`Posizione ${idx + 1} • ${field.type} • ${field.id}`} 
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Seleziona una sezione e trascina i campi per riordinarli
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Gestisci visibilità
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Sezioni
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
              {localSections.map(s => (
                <ListItem key={`vis-${s.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <VisibilityIcon sx={{ mr: 2, color: s.visible ? 'success.main' : 'text.disabled' }} />
                  <ListItemText 
                    primary={s.title} 
                    secondary={s.visible ? 'Visibile' : 'Nascosta'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Switch 
                    checked={!!s.visible} 
                    onChange={() => toggleVisibility(s.id)}
                    color="primary"
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Campi per sezione
            </Typography>
            {localSections.map(section => (
              section.fields && section.fields.length > 0 && (
                <Box key={`fields-vis-${section.id}`} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    {section.title}
                  </Typography>
                  <List sx={{ bgcolor: 'background.default', borderRadius: 2, ml: 2 }}>
                    {section.fields.map(field => (
                      <ListItem key={`vis-field-${field.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <VisibilityIcon sx={{ mr: 2, color: field.visible ? 'success.main' : 'text.disabled', fontSize: '1rem' }} />
                        <ListItemText 
                          primary={field.label || field.name} 
                          secondary={field.visible ? 'Visibile' : 'Nascosto'}
                          primaryTypographyProps={{ fontWeight: 400, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <Switch 
                          checked={!!field.visible} 
                          onChange={() => toggleFieldVisibility(section.id, field.id)}
                          color="primary"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )
            ))}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Imposta modalità sola lettura
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Sezioni
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
              {localSections.map(s => (
                <ListItem key={`ro-${s.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <LockIcon sx={{ mr: 2, color: s.readOnly ? 'warning.main' : 'text.disabled' }} />
                  <ListItemText 
                    primary={s.title} 
                    secondary={s.readOnly ? 'Solo lettura' : 'Modificabile'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Checkbox 
                    checked={!!s.readOnly} 
                    onChange={() => toggleReadOnly(s.id)}
                    color="warning"
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Campi per sezione
            </Typography>
            {localSections.map(section => (
              section.fields && section.fields.length > 0 && (
                <Box key={`fields-ro-${section.id}`} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    {section.title}
                  </Typography>
                  <List sx={{ bgcolor: 'background.default', borderRadius: 2, ml: 2 }}>
                    {section.fields.map(field => (
                      <ListItem key={`ro-field-${field.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <LockIcon sx={{ mr: 2, color: field.readOnly ? 'warning.main' : 'text.disabled', fontSize: '1rem' }} />
                        <ListItemText 
                          primary={field.label || field.name} 
                          secondary={field.readOnly ? 'Solo lettura' : 'Modificabile'}
                          primaryTypographyProps={{ fontWeight: 400, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <Checkbox 
                          checked={!!field.readOnly} 
                          onChange={() => toggleFieldReadOnly(section.id, field.id)}
                          color="warning"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )
            ))}
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Blocco amministratore
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Gli elementi bloccati dall'amministratore non possono essere modificati
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Sezioni
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2, mb: 3 }}>
              {localSections.map(s => (
                <ListItem key={`al-${s.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                  <AdminPanelSettingsIcon sx={{ mr: 2, color: s.adminLocked ? 'error.main' : 'text.disabled' }} />
                  <ListItemText 
                    primary={s.title} 
                    secondary={s.adminLocked ? 'Bloccata dall\'amministratore' : 'Non bloccata'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Checkbox 
                    checked={!!s.adminLocked} 
                    onChange={() => toggleAdminLock(s.id)}
                    color="error"
                  />
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Campi per sezione
            </Typography>
            {localSections.map(section => (
              section.fields && section.fields.length > 0 && (
                <Box key={`fields-al-${section.id}`} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                    {section.title}
                  </Typography>
                  <List sx={{ bgcolor: 'background.default', borderRadius: 2, ml: 2 }}>
                    {section.fields.map(field => (
                      <ListItem key={`al-field-${field.id}`} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <AdminPanelSettingsIcon sx={{ mr: 2, color: field.adminLocked ? 'error.main' : 'text.disabled', fontSize: '1rem' }} />
                        <ListItemText 
                          primary={field.label || field.name} 
                          secondary={field.adminLocked ? 'Bloccato dall\'amministratore' : 'Non bloccato'}
                          primaryTypographyProps={{ fontWeight: 400, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.8rem' }}
                        />
                        <Checkbox 
                          checked={!!field.adminLocked} 
                          onChange={() => toggleFieldAdminLock(section.id, field.id)}
                          color="error"
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )
            ))}
          </TabPanel>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          Annulla
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          Salva Configurazione
        </Button>
      </DialogActions>
    </Dialog>
  );
}
