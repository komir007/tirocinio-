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

interface SortableItemProps {
  id: string;
  column: GridColumn;
  isVisible: boolean;
  config: any;
  onVisibilityChange: (columnId: string) => void;
  onWidthChange: (columnId: string, width: number) => void;
}

function SortableItem({ 
  id, 
  column, 
  isVisible, 
  config, 
  onVisibilityChange, 
  onWidthChange 
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        mb: 1,
        backgroundColor: isVisible ? 'background.paper' : 'action.disabled',
      }}
    >
      <IconButton {...listeners} size="small">
        <DragIndicator />
      </IconButton>
      
      <ListItemText
        primary={column.label}
        secondary={`ID: ${column.id}`}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          label="Larghezza"
          type="number"
          sx={{ width: 100 }}
          value={config?.width || column.minWidth || 100}
          onChange={(e) => onWidthChange(column.id, parseInt(e.target.value))}
        />
        
        <Switch
          checked={isVisible}
          onChange={() => onVisibilityChange(column.id)}
          icon={<VisibilityOff />}
          checkedIcon={<Visibility />}
        />
      </Box>
    </ListItem>
  );
}

export function GridCustomizationDialog({
  open,
  onClose,
  gridId,
  columns,
  currentConfig,
  onSave
}: GridCustomizationDialogProps) {
  const [tempConfig, setTempConfig] = useState<GridCustomization>({
    columns: [],
    pageSize: 10,
    ...currentConfig
  });
  
  const [activeTab, setActiveTab] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (currentConfig) {
      setTempConfig(currentConfig);
    }
  }, [currentConfig]);

  const getColumnConfig = (columnId: string) => {
    return tempConfig.columns?.find(col => col.id === columnId) || {};
  };

  const isColumnVisible = (columnId: string) => {
    const config = getColumnConfig(columnId);
    return !(config as any).hidden;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const sortedColumns = [...columns].sort((a, b) => {
        const aConfig = getColumnConfig(a.id) as any;
        const bConfig = getColumnConfig(b.id) as any;
        return (aConfig.order || 0) - (bConfig.order || 0);
      });

      const oldIndex = sortedColumns.findIndex((item) => item.id === active.id);
      const newIndex = sortedColumns.findIndex((item) => item.id === over?.id);

      const newColumns = arrayMove(sortedColumns, oldIndex, newIndex);
      
      // Aggiorna ordini
      const updatedColumns = newColumns.map((column, index) => ({
        ...(getColumnConfig(column.id) as any),
        id: column.id,
        order: index + 1
      }));

      setTempConfig({
        ...tempConfig,
        columns: updatedColumns
      });
    }
  };

  const handleVisibilityChange = (columnId: string) => {
    const existingColumns = (tempConfig.columns || []).filter(col => col.id !== columnId);
    const config = getColumnConfig(columnId) as any;
    const isCurrentlyVisible = !config.hidden;
    
    const updatedColumn = {
      ...config,
      id: columnId,
      hidden: isCurrentlyVisible
    };
    
    setTempConfig({
      ...tempConfig,
      columns: [...existingColumns, updatedColumn]
    });
  };

  const handleWidthChange = (columnId: string, width: number) => {
    const existingColumns = (tempConfig.columns || []).filter(col => col.id !== columnId);
    const config = getColumnConfig(columnId) as any;
    
    const updatedColumn = {
      ...config,
      id: columnId,
      width
    };
    
    setTempConfig({
      ...tempConfig,
      columns: [...existingColumns, updatedColumn]
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onClose();
  };

  const handleReset = () => {
    setTempConfig({
      columns: [],
      pageSize: 10
    });
  };

  // Ordina le colonne per la visualizzazione
  const sortedColumns = [...columns].sort((a, b) => {
    const aConfig = getColumnConfig(a.id) as any;
    const bConfig = getColumnConfig(b.id) as any;
    return (aConfig.order || 0) - (bConfig.order || 0);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Personalizza Grid: {gridId}
        <Box sx={{ mt: 1 }}>
          <Chip 
            size="small" 
            label={`${columns.filter(c => isColumnVisible(c.id)).length}/${columns.length} colonne visibili`} 
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Colonne" />
          <Tab label="Ordinamento" />
          <Tab label="Paginazione" />
        </Tabs>

        {/* Tab Colonne */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Trascina per riordinare, clicca per mostrare/nascondere
            </Typography>
            
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sortedColumns.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <List>
                  {sortedColumns.map((column) => {
                    const config = getColumnConfig(column.id);
                    const isVisible = isColumnVisible(column.id);
                    
                    return (
                      <SortableItem
                        key={column.id}
                        id={column.id}
                        column={column}
                        isVisible={isVisible}
                        config={config}
                        onVisibilityChange={handleVisibilityChange}
                        onWidthChange={handleWidthChange}
                      />
                    );
                  })}
                </List>
              </SortableContext>
            </DndContext>
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
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Export default per compatibilità
export default GridCustomizationDialog;
