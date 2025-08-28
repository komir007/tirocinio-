import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import { ExpandMore, Settings as SettingsIcon } from '@mui/icons-material';
import { FormSection, FormCustomization, FormField } from '../types/customization.types';
import { FormCustomizationDialog } from './FormCustomizationDialog';

interface CustomizableFormProps {
  formId: string;
  sections: FormSection[];
  customization?: FormCustomization;
  onCustomizationChange?: (config: FormCustomization) => void;
  onSubmit?: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  loading?: boolean;
}

export function CustomizableForm({
  formId,
  sections: defaultSections,
  customization = {},
  onCustomizationChange,
  onSubmit,
  initialValues = {},
  submitLabel = 'Salva',
  loading = false
}: CustomizableFormProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Applica customizzazioni alle sezioni
  const processedSections = useMemo(() => {
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
  }, [defaultSections, customization]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Rimuovi errore se presente
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    processedSections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.id];
        
        // Validazione required
        if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
          newErrors[field.id] = `${field.label} è richiesto`;
          return;
        }
        
        // Validazioni personalizzate
        if (value && field.validation) {
          const { min, max, pattern, message } = field.validation;
          
          if (min && value.length < min) {
            newErrors[field.id] = message || `${field.label} deve essere di almeno ${min} caratteri`;
          }
          
          if (max && value.length > max) {
            newErrors[field.id] = message || `${field.label} deve essere di massimo ${max} caratteri`;
          }
          
          if (pattern && !new RegExp(pattern).test(value)) {
            newErrors[field.id] = message || `${field.label} non è valido`;
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const renderField = (field: FormField, sectionReadOnly: boolean) => {
    const isReadOnly = sectionReadOnly || field.readOnly;
    const fieldValue = formData[field.id] || '';
    const fieldError = errors[field.id];

    const commonProps = {
      fullWidth: true,
      margin: 'normal' as const,
      value: fieldValue,
      error: !!fieldError,
      helperText: fieldError,
      disabled: isReadOnly || loading,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <TextField
            key={field.id}
            label={field.label}
            type={field.type}
            required={field.required}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.id}
            label={field.label}
            type="number"
            required={field.required}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.id}
            label={field.label}
            multiline
            rows={4}
            required={field.required}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <FormControl key={field.id} {...commonProps}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={fieldValue}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              label={field.label}
            >
              {field.options?.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControlLabel
            key={field.id}
            control={
              <Checkbox
                checked={!!fieldValue}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                disabled={isReadOnly || loading}
              />
            }
            label={field.label}
          />
        );

      case 'date':
        return (
          <TextField
            key={field.id}
            label={field.label}
            type="date"
            required={field.required}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            InputLabelProps={{ shrink: true }}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };



  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      {/* Header con customizzazione */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {formId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Typography>
        <IconButton
          onClick={() => setCustomizationOpen(true)}
          size="small"
          title="Personalizza form"
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {processedSections.map(section => (
          <Accordion key={section.id} defaultExpanded={!section.collapsed}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{section.label}</Typography>
              {section.description && (
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {section.description}
                </Typography>
              )}
            </AccordionSummary>
            <AccordionDetails>
              <Box 
                display="flex" 
                flexDirection={customization.layout === 'horizontal' ? 'row' : 'column'}
                flexWrap="wrap"
                gap={2}
              >
                {section.fields.map(field => (
                  <Box 
                    key={field.id}
                    flex={
                      customization.layout === 'horizontal' ? '1 1 300px' :
                      customization.layout === 'grid' ? '1 1 250px' : '1'
                    }
                    minWidth={
                      customization.layout === 'grid' ? '250px' : 'auto'
                    }
                  >
                    {renderField(field, section.readOnly || false)}
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Submit Button */}
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvataggio...' : submitLabel}
          </Button>
        </Box>
      </Box>

      {/* Dialog customizzazione */}
      <FormCustomizationDialog
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        formId={formId}
        sections={defaultSections}
        currentConfig={customization}
        onSave={(config) => {
          onCustomizationChange?.(config);
          setCustomizationOpen(false);
        }}
      />
    </Paper>
  );
}