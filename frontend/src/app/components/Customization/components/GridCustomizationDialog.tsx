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
  ListItemSecondaryAction,
  Switch,
  TextField,
  Box,
  Typography,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DragIndicator, Visibility, VisibilityOff } from '@mui/icons-material';
import { GridColumn, GridCustomization } from '../types/customization.types';

interface GridCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  gridId: string;
  columns: GridColumn[];
  currentConfig?: GridCustomization;
  onSave: (config: GridCustomization) => void;
}

export function GridCustomizationDialog({
  open,
  onClose,
  gridId,
  columns,
  currentConfig = {},
  onSave
}: GridCustomizationDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [tempConfig, setTempConfig] = useState<GridCustomization>(currentConfig);

  // Reset config quando si apre il dialog
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
      columns: [],
      pageSize: 10,
      sortBy: undefined,
      sortOrder: 'asc',
      filters: {}
    });
  };

  const toggleColumnVisibility = (columnId: string) => {
    const columns = tempConfig.columns || [];
    const existingIndex = columns.findIndex(c => c.id === columnId);
    
    let updatedColumns;
    if (existingIndex >= 0) {
      updatedColumns = [...columns];
      updatedColumns[existingIndex] = {
        ...updatedColumns[existingIndex],
        hidden: !updatedColumns[existingIndex].hidden,
      };
    } else {
      updatedColumns = [...columns, { id: columnId, hidden: true }];
    }
    
    setTempConfig({ ...tempConfig, columns: updatedColumns });
  };

  const updateColumnWidth = (columnId: string, width: number) => {
    const columns = tempConfig.columns || [];
    const existingIndex = columns.findIndex(c => c.id === columnId);
    
    let updatedColumns;
    if (existingIndex >= 0) {
      updatedColumns = [...columns];
      updatedColumns[existingIndex] = {
        ...updatedColumns[existingIndex],
        width,
      };
    } else {
      updatedColumns = [...columns, { id: columnId, width }];
    }
    
    setTempConfig({ ...tempConfig, columns: updatedColumns });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Aggiorna ordini
    const updatedColumns = items.map((column, index) => ({
      id: column.id,
      order: index + 1
    }));

    setTempConfig({
      ...tempConfig,
      columns: updatedColumns
    });
  };

  const getColumnConfig = (columnId: string) => {
    return tempConfig.columns?.find(c => c.id === columnId) || {};
  };

  const isColumnVisible = (columnId: string) => {
    const config = getColumnConfig(columnId);
    return !config.hidden;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Personalizza Griglia: {gridId}
          </Typography>
          <Chip 
            label={`${columns.filter(c => isColumnVisible(c.id)).length}/${columns.length} colonne visibili`}
            color="primary"
            size="small"
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Colonne" />
          <Tab label="Ordinamento" />
          <Tab label="Paginazione" />
        </Tabs>

        {/* Tab Colonne */}
        {activeTab === 0 && (
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Trascina per riordinare, clicca per mostrare/nascondere
            </Typography>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <List {...provided.droppableProps} ref={provided.innerRef}>
                    {columns.map((column, index) => {
                      const config = getColumnConfig(column.id);
                      const isVisible = isColumnVisible(column.id);
                      
                      return (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                border: snapshot.isDragging ? '1px dashed primary.main' : 'none',
                                borderRadius: 1,
                                mb: 1,
                              }}
                            >
                              <Box
                                {...provided.dragHandleProps}
                                display="flex"
                                alignItems="center"
                                mr={2}
                              >
                                <DragIndicator color="action" />
                              </Box>
                              
                              <ListItemText
                                primary={column.label}
                                secondary={`ID: ${column.id}`}
                                sx={{
                                  opacity: isVisible ? 1 : 0.5
                                }}
                              />
                              
                              <Box display="flex" alignItems="center" gap={1}>
                                <TextField
                                  label="Larghezza"
                                  type="number"
                                  size="small"
                                  value={config.width || column.minWidth || 100}
                                  onChange={(e) => updateColumnWidth(column.id, parseInt(e.target.value))}
                                  sx={{ width: 100 }}
                                />
                                
                                <IconButton
                                  onClick={() => toggleColumnVisibility(column.id)}
                                  color={isVisible ? 'primary' : 'default'}
                                >
                                  {isVisible ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </Box>
                            </ListItem>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        )}

        {/* Tab Ordinamento */}
        {activeTab === 1 && (
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Ordina per</InputLabel>
              <Select
                value={tempConfig.sortBy || ''}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  sortBy: e.target.value
                })}
              >
                <MenuItem value="">Nessun ordinamento</MenuItem>
                {columns.map(column => (
                  <MenuItem key={column.id} value={column.id}>
                    {column.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Direzione</InputLabel>
              <Select
                value={tempConfig.sortOrder || 'asc'}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  sortOrder: e.target.value as 'asc' | 'desc'
                })}
              >
                <MenuItem value="asc">Crescente</MenuItem>
                <MenuItem value="desc">Decrescente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Tab Paginazione */}
        {activeTab === 2 && (
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Righe per pagina</InputLabel>
              <Select
                value={tempConfig.pageSize || 10}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  pageSize: e.target.value as number
                })}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
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