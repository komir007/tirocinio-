import React, { useMemo, useState } from "react";
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
  Collapse,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import {
  FormSection,
  FormCustomization,
  FormField,
} from "../types/customization.types";
import { UnifiedCustomizationDialog } from "./UnifiedCustomizationDialog";
import { AuthContext } from "../../Authcontext";
import { useContext } from "react";

interface CompactCustomizableFormProps {
  formId: string;
  sections: FormSection[];
  customization?: FormCustomization;
  onCustomizationChange?: (config: FormCustomization) => void;
  onSubmit?: (data: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  submitLabel?: string;
  loading?: boolean;
}

export function CompactCustomizableForm({
  formId,
  sections: defaultSections,
  customization = {},
  onCustomizationChange,
  onSubmit,
  initialValues = {},
  submitLabel = "Salva",
  loading = false,
}: CompactCustomizableFormProps) {
  const authContext = useContext(AuthContext);
  const userRole = authContext?.user?.role;
  const isAdmin = userRole === 'admin';

  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [compactMode, setCompactMode] = useState(customization.compactMode ?? true);

  // Applica customizzazioni alle sezioni
  const processedSections = useMemo(() => {
    let sections = [...defaultSections];

    // Applica customizzazioni sezioni
    if (customization.sections) {
      sections = sections
        .map((section) => {
          const customSection = customization.sections?.find(
            (cs) => cs.id === section.id
          );
          return {
            ...section,
            order: customSection?.order ?? section.defaultOrder ?? 0,
            hidden: customSection?.hidden ?? false,
            readOnly: customSection?.readOnly ?? false,
            collapsed: customSection?.collapsed ?? false,
            adminLocked: customSection?.adminLocked ?? false,
          };
        })
        .filter((section) => !section.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Applica customizzazioni campi
    if (customization.fields) {
      sections = sections.map((section) => ({
        ...section,
        fields: section.fields
          .map((field) => {
            const customField = customization.fields?.find(
              (cf) => cf.id === field.id
            );
            return {
              ...field,
              order: customField?.order ?? field.defaultOrder ?? 0,
              hidden: customField?.hidden ?? false,
              readOnly: customField?.readOnly ?? field.readOnly ?? false,
              required: customField?.required ?? field.required ?? false,
              adminLocked: customField?.adminLocked ?? field.adminLocked ?? false,
            };
          })
          .filter((field) => !field.hidden)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
    }

    return sections;
  }, [defaultSections, customization]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));

    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    processedSections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = formData[field.id];

        if (
          field.required &&
          (!value || (typeof value === "string" && value.trim() === ""))
        ) {
          newErrors[field.id] = `${field.label} è richiesto`;
          return;
        }

        if (value && field.validation) {
          const { min, max, pattern, message } = field.validation;

          if (min && value.length < min) {
            newErrors[field.id] =
              message ||
              `${field.label} deve essere di almeno ${min} caratteri`;
          }

          if (max && value.length > max) {
            newErrors[field.id] =
              message ||
              `${field.label} deve essere di massimo ${max} caratteri`;
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

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderCompactField = (field: FormField, sectionReadOnly: boolean) => {
    const isReadOnly = sectionReadOnly || field.readOnly || (!isAdmin && field.adminLocked);
    const fieldValue = formData[field.id] || "";
    const fieldError = errors[field.id];

    const commonProps = {
      size: "small" as const,
      fullWidth: true,
      value: fieldValue,
      error: !!fieldError,
      helperText: fieldError,
      disabled: isReadOnly || loading,
      variant: "outlined" as const,
    };

    const fieldComponent = (() => {
      switch (field.type) {
        case "text":
        case "email":
        case "password":
          return (
            <TextField
              label={field.label}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          );

        case "number":
          return (
            <TextField
              label={field.label}
              type="number"
              required={field.required}
              placeholder={field.placeholder}
              onChange={(e) =>
                handleFieldChange(field.id, parseFloat(e.target.value) || 0)
              }
              {...commonProps}
            />
          );

        case "textarea":
          return (
            <TextField
              label={field.label}
              multiline
              rows={2}
              required={field.required}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              {...commonProps}
            />
          );

        case "select":
          return (
            <FormControl {...commonProps}>
              <InputLabel size="small">{field.label}</InputLabel>
              <Select
                value={fieldValue}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                label={field.label}
                size="small"
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );

        case "checkbox":
          return (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={!!fieldValue}
                  onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                  disabled={isReadOnly || loading}
                />
              }
              label={field.label}
            />
          );

        case "date":
          return (
            <TextField
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
    })();

    return (
      <Box key={field.id} position="relative">
        {fieldComponent}
        {/* Indicatori di stato del campo */}
        <Box position="absolute" top={0} right={0} display="flex" gap={0.5}>
          {field.adminLocked && (
            <Tooltip title="Campo bloccato dall'amministratore">
              <Lock fontSize="small" color="warning" />
            </Tooltip>
          )}
          {isReadOnly && !field.adminLocked && (
            <Tooltip title="Campo di sola lettura">
              <VisibilityOff fontSize="small" color="disabled" />
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box height="100%" width="100%">
      <Paper 
        elevation={compactMode ? 1 : 3} 
        sx={{ 
          p: compactMode ? 2 : 3,
          maxHeight: compactMode ? '70vh' : 'none',
          overflow: compactMode ? 'auto' : 'visible'
        }}
      >
        {/* Header compatto */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={compactMode ? 1 : 2}
        >
          <Typography variant={compactMode ? "subtitle1" : "h6"}>
            {formId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              size="small"
              icon={compactMode ? <Visibility /> : <VisibilityOff />}
              label={compactMode ? "Compatto" : "Esteso"}
              onClick={() => setCompactMode(!compactMode)}
              variant="outlined"
            />
            <IconButton
              onClick={() => setCustomizationOpen(true)}
              size="small"
              title="Personalizza form"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Form compatto */}
        <Box component="form" onSubmit={handleSubmit}>
          {processedSections.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);
            
            return (
              <Paper
                key={section.id}
                elevation={0}
                variant="outlined"
                sx={{ mb: compactMode ? 1 : 2, overflow: 'hidden' }}
              >
                {/* Header sezione */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={compactMode ? 1 : 1.5}
                  sx={{ cursor: 'pointer', bgcolor: 'grey.50' }}
                  onClick={() => toggleSectionCollapse(section.id)}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant={compactMode ? "subtitle2" : "subtitle1"}>
                      {section.label}
                    </Typography>
                    {section.adminLocked && (
                      <Tooltip title="Sezione bloccata dall'amministratore">
                        <Lock fontSize="small" color="warning" />
                      </Tooltip>
                    )}
                  </Box>
                  <IconButton size="small">
                    {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                </Box>

                {/* Contenuto sezione */}
                <Collapse in={!isCollapsed}>
                  <Box p={compactMode ? 1 : 2}>
                    <Box
                      display="grid"
                      gridTemplateColumns={
                        compactMode
                          ? "repeat(auto-fit, minmax(250px, 1fr))"
                          : "repeat(auto-fit, minmax(400px, 1fr))"
                      }
                      gap={compactMode ? 1 : 2}
                    >
                      {section.fields.map((field) => (
                        <Box key={field.id}>
                          {renderCompactField(field, section.readOnly || false)}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Collapse>
              </Paper>
            );
          })}

          {/* Submit Button compatto */}
          <Box mt={compactMode ? 2 : 3} display="flex" justifyContent="flex-end">
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              size={compactMode ? "small" : "medium"}
            >
              {loading ? "Salvataggio..." : submitLabel}
            </Button>
          </Box>
        </Box>

        {/* Dialog customizzazione */}
        <UnifiedCustomizationDialog
          open={customizationOpen}
          onClose={() => setCustomizationOpen(false)}
          formId={formId}
          sections={defaultSections}
          currentConfig={customization}
          onSave={(config: FormCustomization) => {
            onCustomizationChange?.(config);
            setCustomizationOpen(false);
          }}
        />
      </Paper>
    </Box>
  );
}
