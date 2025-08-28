import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
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
} from '@mui/material';
import { ExpandMore, Visibility, VisibilityOff, Lock, Edit } from '@mui/icons-material';
import { FormSection, FormCustomization } from '../types/customization.types';

interface FormCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  formId: string;
  sections: FormSection[];
  currentConfig?: FormCustomization;
  onSave: (config: FormCustomization) => void;
}

export function FormCustomizationDialog({
  open,
  onClose,
  formId,
  sections,
  currentConfig = {},
  onSave
}: FormCustomizationDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [tempConfig, setTempConfig] = useState<FormCustomization>(currentConfig);

  useEffect(() => {
    if (open) {
      setTempConfig(currentConfig);
    }
  }, [open, currentConfig]);

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig({
      sections: [],
      fields: [],
      layout: 'vertical'
    });
  };

  const getSectionConfig = (sectionId: string) => {
    return tempConfig.sections?.find(s => s.id === sectionId) || {};
  };

  const getFieldConfig = (fieldId: string) => {
    return tempConfig.fields?.find(f => f.id === fieldId) || {};
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const sections = tempConfig.sections || [];
    const existingIndex = sections.findIndex(s => s.id === sectionId);
    
    let updatedSections;
    if (existingIndex >= 0) {
      updatedSections = [...sections];
      updatedSections[existingIndex] = {
        ...updatedSections[existingIndex],
        hidden: !updatedSections[existingIndex].hidden,
      };
    } else {
      updatedSections = [...sections, { id: sectionId, hidden: true }];
    }
    
    setTempConfig({ ...tempConfig, sections: updatedSections });
  };

  const toggleSectionReadOnly = (sectionId: string) => {
    const sections = tempConfig.sections || [];
    const existingIndex = sections.findIndex(s => s.id === sectionId);
    
    let updatedSections;
    if (existingIndex >= 0) {
      updatedSections = [...sections];
      updatedSections[existingIndex] = {
        ...updatedSections[existingIndex],
        readOnly: !updatedSections[existingIndex].readOnly,
      };
    } else {
      updatedSections = [...sections, { id: sectionId, readOnly: true }];
    }
    
    setTempConfig({ ...tempConfig, sections: updatedSections });
  };

  const toggleFieldVisibility = (fieldId: string) => {
    const fields = tempConfig.fields || [];
    const existingIndex = fields.findIndex(f => f.id === fieldId);
    
    let updatedFields;
    if (existingIndex >= 0) {
      updatedFields = [...fields];
      updatedFields[existingIndex] = {
        ...updatedFields[existingIndex],
        hidden: !updatedFields[existingIndex].hidden,
      };
    } else {
      updatedFields = [...fields, { id: fieldId, hidden: true }];
    }
    
    setTempConfig({ ...tempConfig, fields: updatedFields });
  };

  const toggleFieldReadOnly = (fieldId: string) => {
    const fields = tempConfig.fields || [];
    const existingIndex = fields.findIndex(f => f.id === fieldId);
    
    let updatedFields;
    if (existingIndex >= 0) {
      updatedFields = [...fields];
      updatedFields[existingIndex] = {
        ...updatedFields[existingIndex],
        readOnly: !updatedFields[existingIndex].readOnly,
      };
    } else {
      updatedFields = [...fields, { id: fieldId, readOnly: true }];
    }
    
    setTempConfig({ ...tempConfig, fields: updatedFields });
  };

  const isSectionVisible = (sectionId: string) => {
    const config = getSectionConfig(sectionId);
    return !config.hidden;
  };

  const isSectionReadOnly = (sectionId: string) => {
    const config = getSectionConfig(sectionId);
    return config.readOnly || false;
  };

  const isFieldVisible = (fieldId: string) => {
    const config = getFieldConfig(fieldId);
    return !config.hidden;
  };

  const isFieldReadOnly = (fieldId: string) => {
    const config = getFieldConfig(fieldId);
    return config.readOnly || false;
  };

  const visibleSections = sections.filter(s => isSectionVisible(s.id));
  const hiddenSections = sections.filter(s => !isSectionVisible(s.id));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Personalizza Form: {formId}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip 
              label={`${visibleSections.length}/${sections.length} sezioni`}
              color="primary"
              size="small"
            />
            <Chip 
              label={`Layout: ${tempConfig.layout || 'vertical'}`}
              color="secondary"
              size="small"
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Sezioni" />
          <Tab label="Campi" />
          <Tab label="Layout" />
        </Tabs>

        {/* Tab Sezioni */}
        {activeTab === 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Gestisci la visibilità e le proprietà delle sezioni
            </Typography>
            
            <List>
              {sections.map((section) => {
                const isVisible = isSectionVisible(section.id);
                const isReadOnly = isSectionReadOnly(section.id);
                
                return (
                  <ListItem 
                    key={section.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      opacity: isVisible ? 1 : 0.5
                    }}
                  >
                    <ListItemText
                      primary={section.label}
                      secondary={`${section.fields.length} campi • ID: ${section.id}`}
                    />
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        onClick={() => toggleSectionVisibility(section.id)}
                        color={isVisible ? 'primary' : 'default'}
                        title={isVisible ? 'Nascondi sezione' : 'Mostra sezione'}
                      >
                        {isVisible ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                      
                      <IconButton
                        onClick={() => toggleSectionReadOnly(section.id)}
                        color={isReadOnly ? 'warning' : 'default'}
                        title={isReadOnly ? 'Rendi modificabile' : 'Rendi solo lettura'}
                        disabled={!isVisible}
                      >
                        {isReadOnly ? <Lock /> : <Edit />}
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}

        {/* Tab Campi */}
        {activeTab === 1 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Gestisci i campi per sezione
            </Typography>
            
            {sections.map((section) => (
              <Accordion key={section.id} defaultExpanded={section.defaultOrder === 1}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Typography variant="subtitle1">
                      {section.label}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${section.fields.filter(f => isFieldVisible(f.id)).length}/${section.fields.length}`}
                      color={isSectionVisible(section.id) ? 'primary' : 'default'}
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <List dense>
                    {section.fields.map((field) => {
                      const isVisible = isFieldVisible(field.id);
                      const isReadOnly = isFieldReadOnly(field.id);
                      
                      return (
                        <ListItem 
                          key={field.id}
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 1,
                            mb: 0.5,
                            opacity: isVisible ? 1 : 0.5
                          }}
                        >
                          <ListItemText
                            primary={field.label}
                            secondary={
                              <Box display="flex" gap={1} mt={0.5}>
                                <Chip size="small" label={field.type} />
                                {field.required && (
                                  <Chip size="small" label="Obbligatorio" color="error" />
                                )}
                                <Chip 
                                  size="small" 
                                  label={isVisible ? 'Visibile' : 'Nascosto'}
                                  color={isVisible ? 'success' : 'default'}
                                />
                                {isReadOnly && (
                                  <Chip size="small" label="Solo lettura" color="warning" />
                                )}
                              </Box>
                            }
                          />
                          
                          <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                              onClick={() => toggleFieldVisibility(field.id)}
                              color={isVisible ? 'primary' : 'default'}
                              size="small"
                            >
                              {isVisible ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                            
                            <IconButton
                              onClick={() => toggleFieldReadOnly(field.id)}
                              color={isReadOnly ? 'warning' : 'default'}
                              size="small"
                              disabled={!isVisible}
                            >
                              {isReadOnly ? <Lock /> : <Edit />}
                            </IconButton>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Tab Layout */}
        {activeTab === 2 && (
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Layout del Form</InputLabel>
              <Select
                value={tempConfig.layout || 'vertical'}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  layout: e.target.value as 'vertical' | 'horizontal' | 'grid'
                })}
              >
                <MenuItem value="vertical">Verticale (Una colonna)</MenuItem>
                <MenuItem value="horizontal">Orizzontale (Campi affiancati)</MenuItem>
                <MenuItem value="grid">Griglia (Layout adattivo)</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="textSecondary" mt={2}>
              <strong>Verticale:</strong> Tutti i campi disposti in una colonna<br />
              <strong>Orizzontale:</strong> Campi della stessa sezione affiancati<br />
              <strong>Griglia:</strong> Layout responsive che si adatta alla dimensione dello schermo
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} color="warning">
          Reset
        </Button>
        <Button onClick={onClose}>
          Annulla
        </Button>
        <Button onClick={handleSave} variant="contained">
          Salva Configurazione
        </Button>
      </DialogActions>
    </Dialog>
  );
}