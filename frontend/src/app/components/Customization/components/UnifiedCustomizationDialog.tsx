import React, { useState, useEffect, useContext } from 'react';
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
  Card,
  CardContent,
  Chip,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
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
  onSave: (config: FormCustomization) => void;
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
        <Box display="flex" alignItems="center">
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
          <Box flex={1}>{children}</Box>
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
  onToggleReadOnly: (fieldId: string) => void;
  onToggleRequired: (fieldId: string) => void;
  onToggleAdminLock: (fieldId: string) => void;
  isAdmin: boolean;
}

function SortableField({
  field,
  sectionId,
  config,
  onToggleVisibility,
  onToggleReadOnly,
  onToggleRequired,
  onToggleAdminLock,
  isAdmin,
}: SortableFieldProps) {
  const fieldConfig = config.fields?.find(f => f.id === field.id);
  const isHidden = fieldConfig?.hidden ?? false;
  const isReadOnly = fieldConfig?.readOnly ?? field.readOnly ?? false;
  const isRequired = fieldConfig?.required ?? field.required ?? false;
  const isAdminLocked = fieldConfig?.adminLocked ?? field.adminLocked ?? false;

  return (
    <SortableItem id={field.id}>
      <Box p={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {field.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {field.type} • {field.id}
            </Typography>
          </Box>
          
          <Box display="flex" gap={0.5} alignItems="center">
            <Chip
              size="small"
              label={field.type}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            
            <Tooltip title={isHidden ? "Mostra campo" : "Nascondi campo"}>
              <IconButton
                size="small"
                onClick={() => onToggleVisibility(field.id)}
                color={isHidden ? "error" : "success"}
              >
                {isHidden ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>

            <Tooltip title={isReadOnly ? "Rendi editabile" : "Rendi solo lettura"}>
              <IconButton
                size="small"
                onClick={() => onToggleReadOnly(field.id)}
                color={isReadOnly ? "warning" : "default"}
              >
                {isReadOnly ? <Lock /> : <LockOpen />}
              </IconButton>
            </Tooltip>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={isRequired}
                  onChange={() => onToggleRequired(field.id)}
                />
              }
              label="Richiesto"
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
  onToggleSectionReadOnly: (sectionId: string) => void;
  onToggleSectionAdminLock: (sectionId: string) => void;
  onToggleFieldVisibility: (fieldId: string) => void;
  onToggleFieldReadOnly: (fieldId: string) => void;
  onToggleFieldRequired: (fieldId: string) => void;
  onToggleFieldAdminLock: (fieldId: string) => void;
  onFieldsReorder: (sectionId: string, fieldIds: string[]) => void;
  isAdmin: boolean;
}

function SortableSection({
  section,
  config,
  onToggleSectionVisibility,
  onToggleSectionReadOnly,
  onToggleSectionAdminLock,
  onToggleFieldVisibility,
  onToggleFieldReadOnly,
  onToggleFieldRequired,
  onToggleFieldAdminLock,
  onFieldsReorder,
  isAdmin,
}: SortableSectionProps) {
  const sectionConfig = config.sections?.find(s => s.id === section.id);
  const isHidden = sectionConfig?.hidden ?? false;
  const isReadOnly = sectionConfig?.readOnly ?? section.readOnly ?? false;
  const isAdminLocked = sectionConfig?.adminLocked ?? section.adminLocked ?? false;

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
      
      const newFields = arrayMove(sortedFields, oldIndex, newIndex);
      onFieldsReorder(section.id, newFields.map(f => f.id));
    }
  };

  return (
    <SortableItem id={section.id}>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ bgcolor: isHidden ? 'error.light' : isReadOnly ? 'warning.light' : 'primary.light' }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Box>
              <Typography variant="h6">{section.label}</Typography>
              {section.description && (
                <Typography variant="caption" color="text.secondary">
                  {section.description}
                </Typography>
              )}
            </Box>
            
            <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
              <Tooltip title={isHidden ? "Mostra sezione" : "Nascondi sezione"}>
                <IconButton
                  size="small"
                  onClick={() => onToggleSectionVisibility(section.id)}
                  color={isHidden ? "error" : "success"}
                >
                  {isHidden ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>

              <Tooltip title={isReadOnly ? "Rendi editabile" : "Rendi solo lettura"}>
                <IconButton
                  size="small"
                  onClick={() => onToggleSectionReadOnly(section.id)}
                  color={isReadOnly ? "warning" : "default"}
                >
                  {isReadOnly ? <Lock /> : <LockOpen />}
                </IconButton>
              </Tooltip>

              {isAdmin && (
                <Tooltip title={isAdminLocked ? "Sblocca per agenti" : "Blocca per agenti"}>
                  <IconButton
                    size="small"
                    onClick={() => onToggleSectionAdminLock(section.id)}
                    color={isAdminLocked ? "error" : "default"}
                  >
                    <AdminPanelSettings />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </AccordionSummary>
        
        <AccordionDetails>
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
                  onToggleReadOnly={onToggleFieldReadOnly}
                  onToggleRequired={onToggleFieldRequired}
                  onToggleAdminLock={onToggleFieldAdminLock}
                  isAdmin={isAdmin}
                />
              ))}
            </SortableContext>
          </DndContext>
        </AccordionDetails>
      </Accordion>
    </SortableItem>
  );
}

export function UnifiedCustomizationDialog({
  open,
  onClose,
  formId,
  sections,
  currentConfig = {},
  onSave
}: UnifiedCustomizationDialogProps) {
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState(0);
  const [tempConfig, setTempConfig] = useState<FormCustomization>(currentConfig);

  useEffect(() => {
    setTempConfig(currentConfig);
  }, [currentConfig, open]);

  // Ordina le sezioni secondo la configurazione
  const sortedSections = [...sections].sort((a, b) => {
    const aConfig = tempConfig.sections?.find(s => s.id === a.id);
    const bConfig = tempConfig.sections?.find(s => s.id === b.id);
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

  // Handler per riordinare le sezioni
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSections.findIndex(s => s.id === active.id);
      const newIndex = sortedSections.findIndex(s => s.id === over.id);
      
      const newSections = arrayMove(sortedSections, oldIndex, newIndex);
      
      const newSectionConfigs = newSections.map((section, index) => ({
        id: section.id,
        order: index,
        hidden: tempConfig.sections?.find(s => s.id === section.id)?.hidden ?? false,
        readOnly: tempConfig.sections?.find(s => s.id === section.id)?.readOnly ?? false,
        collapsed: tempConfig.sections?.find(s => s.id === section.id)?.collapsed ?? false,
        adminLocked: tempConfig.sections?.find(s => s.id === section.id)?.adminLocked ?? false,
      }));

      setTempConfig(prev => ({
        ...prev,
        sections: newSectionConfigs,
      }));
    }
  };

  // Handler per riordinare i campi
  const handleFieldsReorder = (sectionId: string, fieldIds: string[]) => {
    const newFieldConfigs = fieldIds.map((fieldId, index) => {
      const existingConfig = tempConfig.fields?.find(f => f.id === fieldId);
      return {
        id: fieldId,
        order: index,
        hidden: existingConfig?.hidden ?? false,
        readOnly: existingConfig?.readOnly ?? false,
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

  // Toggle handlers
  const toggleSectionVisibility = (sectionId: string) => {
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
          readOnly: existingConfig?.readOnly ?? false,
          collapsed: existingConfig?.collapsed ?? false,
          adminLocked: existingConfig?.adminLocked ?? false,
        }
      ]
    }));
  };

  const toggleSectionReadOnly = (sectionId: string) => {
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
          readOnly: !(existingConfig?.readOnly ?? false),
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
          readOnly: existingConfig?.readOnly ?? false,
          collapsed: existingConfig?.collapsed ?? false,
          adminLocked: !(existingConfig?.adminLocked ?? false),
        }
      ]
    }));
  };

  const toggleFieldProperty = (fieldId: string, property: 'hidden' | 'readOnly' | 'required' | 'adminLocked') => {
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
          readOnly: property === 'readOnly' ? !(existingConfig?.readOnly ?? false) : (existingConfig?.readOnly ?? false),
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
        <Box display="flex" alignItems="center" gap={1}>
          <Settings color="primary" />
          <Typography variant="h6">
            Personalizza Form: {formId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Struttura e Ordine" icon={<ViewModule />} />
          <Tab label="Layout Globale" icon={<Settings />} />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                    onToggleSectionReadOnly={toggleSectionReadOnly}
                    onToggleSectionAdminLock={toggleSectionAdminLock}
                    onToggleFieldVisibility={(fieldId) => toggleFieldProperty(fieldId, 'hidden')}
                    onToggleFieldReadOnly={(fieldId) => toggleFieldProperty(fieldId, 'readOnly')}
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
              <InputLabel>Layout Form</InputLabel>
              <Select
                value={tempConfig.layout || 'vertical'}
                onChange={(e) => setTempConfig(prev => ({ ...prev, layout: e.target.value as any }))}
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
    </Dialog>
  );
}
