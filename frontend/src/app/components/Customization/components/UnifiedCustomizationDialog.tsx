import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Visibility,
  VisibilityOff,
  Lock,
  DragIndicator,
  Settings,
  ViewModule,
  AdminPanelSettings,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormSection, FormCustomization, FormField } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';

interface UnifiedCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  formId: string;
  sections: FormSection[];
  currentConfig?: FormCustomization;
  adminConfig?: FormCustomization; // Config dell'admin per ereditare admin locks
  createdBy?: string; // ID dell'admin che ha creato le restrizioni
  onSave: (config: FormCustomization) => void;
  onInheritAdminLocks?: (adminConfig: FormCustomization) => void; // Per ereditare i lock
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function SortableItem({ id, children, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Paper
        elevation={isDragging ? 8 : 1}
        sx={{
          mb: 1,
          cursor: disabled ? 'default' : 'grab',
          '&:hover': {
            elevation: disabled ? 1 : 3,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!disabled && (
            <IconButton
              {...attributes}
              {...listeners}
              size="small"
              sx={{ cursor: 'grab' }}
            >
              <DragIndicator />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>{children}</Box>
        </Box>
      </Paper>
    </div>
  );
}

interface SortableFieldProps {
  field: FormField;
  sectionId: string;
  config: FormCustomization;
  onToggleVisibility: (fieldId: string) => void;
  onToggleRequired: (fieldId: string) => void;
  onToggleAdminLock: (fieldId: string) => void;
  isAdmin: boolean;
}

function SortableField({
  field,
  sectionId,
  config,
  onToggleVisibility,
  onToggleRequired,
  onToggleAdminLock,
  isAdmin,
}: SortableFieldProps) {
  const fieldConfig = config.fields?.find(f => f.id === field.id);
  const isHidden = fieldConfig?.hidden ?? false;
  const isRequired = fieldConfig?.required ?? field.required ?? false;
  
  // Controllo più robusto per admin lock (controlla sia config che base field)
  const isAdminLocked = fieldConfig?.adminLocked ?? field.adminLocked ?? false;
  
  // Indicatore se il campo è effettivamente modificabile dall'utente corrente
  const isUserModifiable = !isAdminLocked || isAdmin;

  return (
    <SortableItem id={field.id} disabled={isAdminLocked && !isAdmin}>
      <Box p={1}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}> {/* Permette text truncation */}
            <Typography variant="body2" fontWeight="medium" sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: isAdminLocked && !isAdmin ? 'text.secondary' : 'text.primary'
            }}>
              {field.label}
              {isAdminLocked && !isAdmin && (
                <Lock 
                  fontSize="inherit" 
                  sx={{ 
                    ml: 0.5, 
                    color: 'warning.main',
                    verticalAlign: 'middle'
                  }} 
                />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ 
              display: 'block',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {field.type} • {field.id}
              {isAdminLocked && !isAdmin && (
                <Typography component="span" color="warning.main" sx={{ ml: 1, fontSize: 'inherit' }}>
                  • Bloccato dall'admin
                </Typography>
              )}
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 0.5, 
            alignItems: 'center', 
            flexShrink: 0 
          }}>
            <Chip
              size="small"
              label={field.type}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            
            <Tooltip title={
              isAdminLocked && !isAdmin 
                ? "Campo bloccato dall'amministratore" 
                : (isHidden ? "Mostra campo" : "Nascondi campo")
            }>
              <span> {/* span wrapper necessario per tooltip su componente disabilitato */}
                <IconButton
                  size="small"
                  onClick={() => onToggleVisibility(field.id)}
                  color={isHidden ? "error" : "success"}
                  disabled={isAdminLocked && !isAdmin}
                >
                  {isHidden ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </span>
            </Tooltip>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isRequired}
                  onChange={() => onToggleRequired(field.id)}
                  disabled={isAdminLocked && !isAdmin}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>Richiesto</span>
                  {isAdminLocked && !isAdmin && (
                    <Lock fontSize="inherit" sx={{ color: 'text.disabled' }} />
                  )}
                </Box>
              }
              labelPlacement="start"
              sx={{ m: 0 }}
            />

            {isAdmin && (
              <Tooltip title={isAdminLocked ? "Sblocca per agenti" : "Blocca per agenti"}>
                <IconButton
                  size="small"
                  onClick={() => onToggleAdminLock(field.id)}
                  color={isAdminLocked ? "error" : "default"}
                >
                  <AdminPanelSettings />
                </IconButton>
              </Tooltip>
            )}

            {/* Indicatore di admin lock per utenti non-admin */}
            {!isAdmin && isAdminLocked && (
              <Tooltip title="Campo bloccato dall'amministratore - Solo visualizzazione">
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Lock fontSize="small" color="warning" />
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    </SortableItem>
  );
}

interface SortableSectionProps {
  section: FormSection;
  config: FormCustomization;
  onToggleSectionVisibility: (sectionId: string) => void;
  onToggleSectionAdminLock: (sectionId: string) => void;
  onToggleFieldVisibility: (fieldId: string) => void;
  onToggleFieldRequired: (fieldId: string) => void;
  onToggleFieldAdminLock: (fieldId: string) => void;
  onFieldsReorder: (sectionId: string, fieldIds: string[]) => void;
  isAdmin: boolean;
}

function SortableSection({
  section,
  config,
  onToggleSectionVisibility,
  onToggleSectionAdminLock,
  onToggleFieldVisibility,
  onToggleFieldRequired,
  onToggleFieldAdminLock,
  onFieldsReorder,
  isAdmin,
}: SortableSectionProps) {
  const sectionConfig = config.sections?.find(s => s.id === section.id);
  const isHidden = sectionConfig?.hidden ?? false;
  
  // Controllo più robusto per admin lock (controlla sia config che base section)
  const isAdminLocked = sectionConfig?.adminLocked ?? section.adminLocked ?? false;
  
  // Indicatore se la sezione è effettivamente modificabile dall'utente corrente
  const isSectionModifiable = !isAdminLocked || isAdmin;

  // Ordina i campi secondo la configurazione
  const sortedFields = [...section.fields].sort((a, b) => {
    const aConfig = config.fields?.find(f => f.id === a.id);
    const bConfig = config.fields?.find(f => f.id === b.id);
    const aOrder = aConfig?.order ?? a.defaultOrder ?? 0;
    const bOrder = bConfig?.order ?? b.defaultOrder ?? 0;
    return aOrder - bOrder;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedFields.findIndex(f => f.id === active.id);
      const newIndex = sortedFields.findIndex(f => f.id === over.id);
      
      // Verifica che entrambi gli indici siano validi
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(sortedFields, oldIndex, newIndex);
        onFieldsReorder(section.id, newFields.map(f => f.id));
      }
    }
  };

  return (
    <SortableItem id={section.id} disabled={isAdminLocked && !isAdmin}>
      <Box sx={{ position: 'relative' }}>
        <Accordion defaultExpanded>
          <Box sx={{ position: 'relative' }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ 
                bgcolor: isHidden ? 'error.light' : 'primary.light',
                '& .MuiAccordionSummary-content': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pr: 6 // Spazio per i controlli esterni
                }
              }}
              aria-controls={`section-${section.id}-content`}
              id={`section-${section.id}-header`}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 per permettere text truncation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: isAdminLocked && !isAdmin ? 'text.secondary' : 'text.primary'
                  }}>
                    {section.label}
                  </Typography>
                  {/* Indicatore di admin lock sempre visibile quando necessario */}
                  {isAdminLocked && (
                    <Tooltip title={
                      isAdmin 
                        ? "Sezione bloccata per gli utenti non-admin" 
                        : "Sezione bloccata dall'amministratore - Personalizzazione limitata"
                    }>
                      <Lock 
                        fontSize="small" 
                        sx={{ 
                          color: isAdmin ? 'info.main' : 'warning.main', 
                          flexShrink: 0 
                        }} 
                      />
                    </Tooltip>
                  )}
                </Box>
                {section.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {section.description}
                    {isAdminLocked && !isAdmin && (
                      <Typography component="span" color="warning.main" sx={{ ml: 1, fontSize: 'inherit' }}>
                        • Limitazioni attive
                      </Typography>
                    )}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            
            {/* Controlli posizionati fuori dall'AccordionSummary per evitare button nesting */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 24,
                right: 48, // Spazio per la freccia di expand
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
                zIndex: 1
              }}
            >
              <Tooltip title={
                isAdminLocked && !isAdmin 
                  ? "Sezione bloccata dall'amministratore" 
                  : (isHidden ? "Mostra sezione" : "Nascondi sezione")
              }>
                <span> {/* span wrapper necessario per tooltip su componente disabilitato */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSectionVisibility(section.id);
                    }}
                    color={isHidden ? "error" : "success"}
                    disabled={isAdminLocked && !isAdmin}
                  >
                    {isHidden ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </span>
              </Tooltip>

              {isAdmin && (
                <Tooltip title={isAdminLocked ? "Sblocca per agenti" : "Blocca per agenti"}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSectionAdminLock(section.id);
                    }}
                    color={isAdminLocked ? "error" : "default"}
                  >
                    <AdminPanelSettings />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        
          <AccordionDetails id={`section-${section.id}-content`}>
            {isSectionModifiable ? (
              <>
                <Typography variant="subtitle2" gutterBottom>
                  Trascina i campi per riorganizzarli:
                </Typography>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleFieldDragEnd}
                >
                  <SortableContext
                    items={sortedFields.map(f => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedFields.map((field) => (
                      <SortableField
                        key={field.id}
                        field={field}
                        sectionId={section.id}
                        config={config}
                        onToggleVisibility={onToggleFieldVisibility}
                        onToggleRequired={onToggleFieldRequired}
                        onToggleAdminLock={onToggleFieldAdminLock}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Sezione bloccata dall'amministratore - Solo visualizzazione
                </Typography>
                
                {sortedFields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    sectionId={section.id}
                    config={config}
                    onToggleVisibility={onToggleFieldVisibility}
                    onToggleRequired={onToggleFieldRequired}
                    onToggleAdminLock={onToggleFieldAdminLock}
                    isAdmin={isAdmin}
                  />
                ))}
              </>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </SortableItem>
  );
}

export function UnifiedCustomizationDialog({
  open,
  onClose,
  formId,
  sections,
  currentConfig = {},
  adminConfig,
  createdBy,
  onSave,
  onInheritAdminLocks
}: UnifiedCustomizationDialogProps) {
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.role === 'admin';
  const currentUserId = authContext?.user?.id;
  
  const [activeTab, setActiveTab] = useState(0);
  const [tempConfig, setTempConfig] = useState<FormCustomization>(currentConfig ?? {});
  const [hasInheritedAdminLocks, setHasInheritedAdminLocks] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Funzione per mostrare notifiche
  const showNotification = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Funzione per ereditare i lock dell'admin
  const inheritAdminLocks = useMemo(() => {
    if (!adminConfig || isAdmin) return currentConfig ?? {};
    
    // Log dettagliato per utenti non admin
    console.log('🔒 Non-Admin User - Inheriting Admin Locks:', {
      originalAdminConfig: adminConfig,
      currentUserConfig: currentConfig,
      sectionsWithAdminLocks: adminConfig.sections?.filter(s => s.adminLocked),
      fieldsWithAdminLocks: adminConfig.fields?.filter(f => f.adminLocked),
      adminCreatedBy: createdBy
    });
    
    const inheritedConfig = { ...currentConfig };
    
    // Eredita admin locks per sezioni
    if (adminConfig.sections) {
      inheritedConfig.sections = inheritedConfig.sections?.map(section => {
        const adminSection = adminConfig.sections?.find(s => s.id === section.id);
        if (adminSection?.adminLocked) {
          return { ...section, adminLocked: true };
        }
        return section;
      }) || adminConfig.sections.filter(s => s.adminLocked);
    }
    
    // Eredita admin locks per campi
    if (adminConfig.fields) {
      inheritedConfig.fields = inheritedConfig.fields?.map(field => {
        const adminField = adminConfig.fields?.find(f => f.id === field.id);
        if (adminField?.adminLocked) {
          return { 
            ...field, 
            adminLocked: true,
            // Eredita anche altre proprietà dell'admin se il campo è locked
            required: adminField.required ?? field.required,
            hidden: adminField.hidden ?? field.hidden
          };
        }
        return field;
      }) || adminConfig.fields.filter(f => f.adminLocked);
    }
    
    // Log del risultato finale dell'eredità
    console.log('✅ Admin Locks Inheritance Complete:', {
      finalInheritedConfig: inheritedConfig,
      lockedSections: inheritedConfig.sections?.filter(s => s.adminLocked)?.length || 0,
      lockedFields: inheritedConfig.fields?.filter(f => f.adminLocked)?.length || 0
    });
    
    return inheritedConfig;
  }, [adminConfig, currentConfig, isAdmin]);

  useEffect(() => {
    if (!isAdmin && adminConfig && !hasInheritedAdminLocks) {
      // Log della configurazione admin quando l'utente non è admin
      console.log('📋 User is not admin - Admin Config Details:', {
        adminConfig,
        createdBy,
        formId,
        currentUserId,
        timestamp: new Date().toISOString()
      });
      
      const configWithAdminLocks = inheritAdminLocks;
      setTempConfig(configWithAdminLocks);
      setHasInheritedAdminLocks(true);
      
      // Notifica il parent component dell'eredità
      if (onInheritAdminLocks) {
        onInheritAdminLocks(configWithAdminLocks);
      }
    } else {
      setTempConfig(currentConfig ?? {});
    }
  }, [currentConfig, open, adminConfig, isAdmin, inheritAdminLocks, hasInheritedAdminLocks, onInheritAdminLocks]);

  // Ordina le sezioni secondo la configurazione
  const sortedSections = [...sections].sort((a, b) => {
    const aConfig = tempConfig.sections?.find(s => s.id === a.id);
    const bConfig = tempConfig.sections?.find(s => s.id === b.id);
    const aOrder = aConfig?.order ?? a.defaultOrder ?? 0;
    const bOrder = bConfig?.order ?? b.defaultOrder ?? 0;
    return aOrder - bOrder;
  });

  // Calcola elementi admin-locked per il banner (ottimizzato con useMemo)
  const adminLockStats = useMemo(() => {
    if (isAdmin) return { lockedSections: [], lockedFields: 0, hasAdminRestrictions: false };
    
    const lockedSections = sections.filter(s => {
      const configSection = tempConfig.sections?.find(cs => cs.id === s.id);
      const baseAdminLocked = s.adminLocked ?? false;
      const configAdminLocked = configSection?.adminLocked ?? false;
      return baseAdminLocked || configAdminLocked;
    });
    
    const lockedFields = sections.reduce((acc, s) => {
      const sectionLockedFields = s.fields.filter(f => {
        const configField = tempConfig.fields?.find(cf => cf.id === f.id);
        const baseAdminLocked = f.adminLocked ?? false;
        const configAdminLocked = configField?.adminLocked ?? false;
        return baseAdminLocked || configAdminLocked;
      });
      return acc + sectionLockedFields.length;
    }, 0);
    
    const hasAdminRestrictions = lockedSections.length > 0 || lockedFields > 0;
    
    return { lockedSections, lockedFields, hasAdminRestrictions, createdBy };
  }, [isAdmin, sections, tempConfig.sections, tempConfig.fields, createdBy]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handler per riordinare le sezioni
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Controlla se la sezione che viene mossa è admin-locked
      const activeSection = sortedSections.find(s => s.id === active.id);
      const activeSectionConfig = tempConfig.sections?.find(s => s.id === active.id);
      const isActiveSectionAdminLocked = activeSectionConfig?.adminLocked ?? activeSection?.adminLocked ?? false;
      
      // Impedisci il movimento se l'utente non è admin e la sezione è admin-locked
      if (isActiveSectionAdminLocked && !isAdmin) {
        showNotification('Impossibile riordinare sezione bloccata dall\'amministratore');
        return;
      }
      
      const oldIndex = sortedSections.findIndex(s => s.id === active.id);
      const newIndex = sortedSections.findIndex(s => s.id === over.id);
      
      // Verifica che entrambi gli indici siano validi
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sortedSections, oldIndex, newIndex);
        
        const newSectionConfigs = newSections.map((section, index) => ({
          id: section.id,
          order: index,
          hidden: tempConfig.sections?.find(s => s.id === section.id)?.hidden ?? false,
          collapsed: tempConfig.sections?.find(s => s.id === section.id)?.collapsed ?? false,
          adminLocked: tempConfig.sections?.find(s => s.id === section.id)?.adminLocked ?? false,
        }));

        setTempConfig(prev => ({
          ...prev,
          sections: newSectionConfigs,
        }));
      }
    }
  };

  // Handler per riordinare i campi
  const handleFieldsReorder = (sectionId: string, fieldIds: string[]) => {
    // Controlla se la sezione è admin-locked per utenti non-admin
    const section = sections.find(s => s.id === sectionId);
    const sectionConfig = tempConfig.sections?.find(s => s.id === sectionId);
    const isSectionAdminLocked = sectionConfig?.adminLocked ?? section?.adminLocked ?? false;
    
    if (isSectionAdminLocked && !isAdmin) {
      showNotification('Impossibile riordinare campi in sezione bloccata dall\'amministratore');
      return;
    }
    
    const newFieldConfigs = fieldIds.map((fieldId, index) => {
      const existingConfig = tempConfig.fields?.find(f => f.id === fieldId);
      const field = sections.flatMap(s => s.fields).find(f => f.id === fieldId);
      const isFieldAdminLocked = existingConfig?.adminLocked ?? field?.adminLocked ?? false;
      
      // Verifica anche che il singolo campo non sia admin-locked per utenti non-admin
      if (isFieldAdminLocked && !isAdmin) {
        console.warn(`Campo admin-locked ${fieldId} non può essere riordinato da utente non-admin`);
        // Mantieni l'ordine originale per i campi admin-locked
        return existingConfig || {
          id: fieldId,
          order: field?.defaultOrder ?? index,
          hidden: false,
          required: field?.required ?? false,
          adminLocked: isFieldAdminLocked,
        };
      }
      
      return {
        id: fieldId,
        order: index,
        hidden: existingConfig?.hidden ?? false,
        required: existingConfig?.required ?? false,
        adminLocked: existingConfig?.adminLocked ?? false,
      };
    });

    // Mantieni le configurazioni degli altri campi
    const otherFieldConfigs = tempConfig.fields?.filter(
      f => !fieldIds.includes(f.id)
    ) ?? [];

    setTempConfig(prev => ({
      ...prev,
      fields: [...newFieldConfigs, ...otherFieldConfigs],
    }));
  };

  // Toggle handlers con controllo admin lock
  const toggleSectionVisibility = (sectionId: string) => {
    // Controlla se la sezione è admin-locked e l'utente non è admin
    const sectionConfig = tempConfig.sections?.find(s => s.id === sectionId);
    const section = sections.find(s => s.id === sectionId);
    const isAdminLocked = sectionConfig?.adminLocked ?? section?.adminLocked ?? false;
    
    if (isAdminLocked && !isAdmin) {
      showNotification('Impossibile modificare sezione bloccata dall\'amministratore');
      return;
    }
    
    const existingConfig = tempConfig.sections?.find(s => s.id === sectionId);
    const newSections = tempConfig.sections?.filter(s => s.id !== sectionId) ?? [];
    
    setTempConfig(prev => ({
      ...prev,
      sections: [
        ...newSections,
        {
          id: sectionId,
          order: existingConfig?.order ?? 0,
          hidden: !(existingConfig?.hidden ?? false),
          collapsed: existingConfig?.collapsed ?? false,
          adminLocked: existingConfig?.adminLocked ?? false,
        }
      ]
    }));
  };

  const toggleSectionAdminLock = (sectionId: string) => {
    if (!isAdmin) return;
    
    const existingConfig = tempConfig.sections?.find(s => s.id === sectionId);
    const newSections = tempConfig.sections?.filter(s => s.id !== sectionId) ?? [];
    
    setTempConfig(prev => ({
      ...prev,
      sections: [
        ...newSections,
        {
          id: sectionId,
          order: existingConfig?.order ?? 0,
          hidden: existingConfig?.hidden ?? false,
          collapsed: existingConfig?.collapsed ?? false,
          adminLocked: !(existingConfig?.adminLocked ?? false),
        }
      ]
    }));
  };

  const toggleFieldProperty = (fieldId: string, property: 'hidden' | 'required' | 'adminLocked') => {
    // Controlla se il campo è admin-locked e l'utente non è admin (eccetto per adminLocked stesso)
    if (property !== 'adminLocked') {
      const fieldConfig = tempConfig.fields?.find(f => f.id === fieldId);
      const field = sections.flatMap(s => s.fields).find(f => f.id === fieldId);
      const isAdminLocked = fieldConfig?.adminLocked ?? field?.adminLocked ?? false;
      
      if (isAdminLocked && !isAdmin) {
        showNotification('Impossibile modificare campo bloccato dall\'amministratore');
        return;
      }
    }
    
    // Solo admin può modificare adminLocked
    if (property === 'adminLocked' && !isAdmin) {
      showNotification('Solo gli amministratori possono modificare i blocchi');
      return;
    }
    
    const existingConfig = tempConfig.fields?.find(f => f.id === fieldId);
    const newFields = tempConfig.fields?.filter(f => f.id !== fieldId) ?? [];
    
    setTempConfig(prev => ({
      ...prev,
      fields: [
        ...newFields,
        {
          id: fieldId,
          order: existingConfig?.order ?? 0,
          hidden: property === 'hidden' ? !(existingConfig?.hidden ?? false) : (existingConfig?.hidden ?? false),
          required: property === 'required' ? !(existingConfig?.required ?? false) : (existingConfig?.required ?? false),
          adminLocked: property === 'adminLocked' ? !(existingConfig?.adminLocked ?? false) : (existingConfig?.adminLocked ?? false),
        }
      ]
    }));
  };

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig({});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{ '& .MuiDialog-paper': { minHeight: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          minWidth: 0 
        }}>
          <Settings sx={{ color: 'primary.main', flexShrink: 0 }} />
          <Typography variant="h6" sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            Personalizza Form: {formId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue: number) => setActiveTab(newValue)} 
          sx={{ mb: 2 }}
        >
          <Tab 
            label="Struttura e Ordine" 
            icon={<ViewModule />} 
            iconPosition="start"
          />
          <Tab 
            label="Layout Globale" 
            icon={<Settings />} 
            iconPosition="start"
          />
        </Tabs>

        {/* Banner informativo per utenti non-admin sui blocchi admin */}
        {!isAdmin && adminLockStats.hasAdminRestrictions && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: 'warning.light', 
              borderLeft: 4, 
              borderColor: 'warning.main' 
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Lock fontSize="small" color="warning" />
              <Typography variant="subtitle2" color="warning.dark">
                Restrizioni Amministratore
                {createdBy && (
                  <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                    (da {createdBy})
                  </Typography>
                )}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              L'amministratore ha bloccato{' '}
              {adminLockStats.lockedSections.length > 0 && `${adminLockStats.lockedSections.length} sezione${adminLockStats.lockedSections.length > 1 ? 'i' : ''}`}
              {adminLockStats.lockedSections.length > 0 && adminLockStats.lockedFields > 0 && ' e '}
              {adminLockStats.lockedFields > 0 && `${adminLockStats.lockedFields} campo${adminLockStats.lockedFields > 1 ? 'i' : ''}`}.
              {' '}Questi elementi sono contrassegnati con <Lock fontSize="inherit" sx={{ mx: 0.5 }} /> e hanno personalizzazione limitata.
            </Typography>
            {hasInheritedAdminLocks && (
              <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                ⚡ Le restrizioni dell'admin sono state applicate automaticamente alla tua configurazione.
              </Typography>
            )}
          </Paper>
        )}

        {activeTab === 0 && (
          <Box>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">
                Trascina le sezioni per riorganizzarle:
              </Typography>
              <Chip
                label={`${sortedSections.length} sezioni • ${sections.reduce((acc, s) => acc + s.fields.length, 0)} campi`}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sortedSections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedSections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    config={tempConfig}
                    onToggleSectionVisibility={toggleSectionVisibility}
                    onToggleSectionAdminLock={toggleSectionAdminLock}
                    onToggleFieldVisibility={(fieldId) => toggleFieldProperty(fieldId, 'hidden')}
                    onToggleFieldRequired={(fieldId) => toggleFieldProperty(fieldId, 'required')}
                    onToggleFieldAdminLock={(fieldId) => toggleFieldProperty(fieldId, 'adminLocked')}
                    onFieldsReorder={handleFieldsReorder}
                    isAdmin={isAdmin}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configurazioni Layout Globale
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="layout-select-label">Layout Form</InputLabel>
              <Select
                labelId="layout-select-label"
                value={tempConfig.layout || 'vertical'}
                onChange={(e) => setTempConfig(prev => ({ 
                  ...prev, 
                  layout: e.target.value as 'vertical' | 'horizontal' | 'grid'
                }))}
                label="Layout Form"
              >
                <MenuItem value="vertical">Verticale</MenuItem>
                <MenuItem value="horizontal">Orizzontale</MenuItem>
                <MenuItem value="grid">Griglia</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={tempConfig.compactMode ?? false}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, compactMode: e.target.checked }))}
                />
              }
              label="Modalità Compatta"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={onClose}>
          Annulla
        </Button>
        <Button onClick={handleSave} variant="contained">
          Salva Personalizzazioni
        </Button>
      </DialogActions>

      {/* Snackbar per notifiche */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
