/**
 * GridCustomizationDialog - Dialog per personalizzare colonne della griglia
 * 
 * Funzionalità principali:
 * - Riordinamento colonne con drag & drop
 * - Controllo visibilità colonne
 * - Regolazione larghezza colonne
 * - Sistema admin lock per restrizioni
 * - Ereditarietà configurazioni admin per utenti non-admin
 */

import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
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
  Tabs,
  Tab,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DragIndicator, 
  Visibility, 
  VisibilityOff, 
  Lock,
  LockOpen,
  AdminPanelSettings 
} from '@mui/icons-material';
import { GridColumn, GridCustomization } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';

// Props principali del dialog di customizzazione
interface GridCustomizationDialogProps {
  open: boolean;
  onClose: () => void;
  gridId: string;
  columns: GridColumn[];
  currentConfig?: GridCustomization;
  onSave: (config: GridCustomization) => void;
  // Sistema admin lock - configurazioni e callback
  adminConfig?: GridCustomization;
  createdBy?: string;
  onInheritAdminLocks?: (config: GridCustomization) => void;
}

// Configurazione specifica per ogni colonna
interface ColumnConfig {
  id: string;
  order: number;
  hidden: boolean;
  width: number;
  pinned?: 'left' | 'right' | null;
  adminLock?: boolean; // Blocco admin: solo admin possono modificare
}

// Props per il componente di riga trascinabile
interface SortableItemProps {
  id: string;
  column: GridColumn;
  isVisible: boolean;
  config: ColumnConfig;
  isAdmin: boolean;
  onVisibilityChange: (columnId: string) => void;
  onWidthChange: (columnId: string, width: number) => void;
  onAdminLockToggle?: (columnId: string) => void;
}

/**
 * SortableItem - Componente per singola riga di colonna trascinabile
 * Gestisce: visibilità, larghezza, drag&drop, admin lock
 */
const SortableItem = React.memo(({ 
  id, 
  column, 
  isVisible, 
  config, 
  isAdmin,
  onVisibilityChange, 
  onWidthChange,
  onAdminLockToggle 
}: SortableItemProps) => {
  // Hook per drag & drop di dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  // Stili per animazione trascinamento
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Logica controllo permessi
  const isAdminLocked = config.adminLock || column.adminLock;
  const canModify = isAdmin || !isAdminLocked;

  // Handler ottimizzati con useCallback per performance
  const handleWidthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 100;
    onWidthChange(column.id, Math.max(50, Math.min(500, value)));
  }, [column.id, onWidthChange]);

  const handleVisibilityToggle = useCallback(() => {
    onVisibilityChange(column.id);
  }, [column.id, onVisibilityChange]);

  const handleAdminLockToggle = useCallback(() => {
    if (onAdminLockToggle) {
      onAdminLockToggle(column.id);
    }
  }, [column.id, onAdminLockToggle]);

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...(canModify ? attributes : {})}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        mb: 1,
        backgroundColor: isAdminLocked ? '#f5f5f5' : (isVisible ? 'background.paper' : 'action.disabled'),
        opacity: isAdminLocked && !isAdmin ? 0.6 : (isVisible ? 1 : 0.7),
      }}
    >
      {/* Drag Handle - solo se può modificare */}
      <IconButton 
        {...(canModify ? listeners : {})} 
        size="small" 
        sx={{ 
          cursor: canModify ? 'grab' : 'not-allowed',
          color: canModify ? 'action.active' : 'action.disabled'
        }}
        disabled={!canModify}
      >
        <DragIndicator />
      </IconButton>

      {/* Admin Lock Indicator */}
      {isAdminLocked && (
        <Tooltip title={isAdmin ? "Colonna bloccata dall'admin (puoi modificare)" : "Colonna bloccata dall'admin"}>
          <Lock 
            sx={{ 
              color: isAdmin ? 'warning.main' : 'error.main',
              fontSize: '1rem',
              mr: 1
            }} 
          />
        </Tooltip>
      )}
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: isAdminLocked ? 'bold' : 'normal',
                color: isAdminLocked && !isAdmin ? 'text.disabled' : 'text.primary'
              }}
            >
              {column.label}
            </Typography>
            {isAdmin && (
              <Chip 
                size="small" 
                label="Admin" 
                icon={<AdminPanelSettings />}
                sx={{ height: 20 }}
              />
            )}
          </Box>
        }
        secondary={`ID: ${column.id}`}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          label="Larghezza"
          type="number"
          sx={{ width: 100 }}
          value={config.width}
          onChange={handleWidthChange}
          inputProps={{ min: 50, max: 500 }}
          disabled={!canModify}
        />
        
        <Tooltip title={canModify ? (isVisible ? "Nascondi colonna" : "Mostra colonna") : "Non puoi modificare questa colonna"}>
          <span>
            <Switch
              checked={isVisible}
              onChange={handleVisibilityToggle}
              icon={<VisibilityOff />}
              checkedIcon={<Visibility />}
              disabled={!canModify}
            />
          </span>
        </Tooltip>

        {/* Admin Lock Toggle (solo per admin) */}
        {isAdmin && onAdminLockToggle && (
          <Tooltip title={isAdminLocked ? "Rimuovi blocco admin" : "Blocca per admin"}>
            <IconButton
              onClick={handleAdminLockToggle}
              size="small"
              color={isAdminLocked ? "error" : "default"}
            >
              {isAdminLocked ? <Lock /> : <LockOpen />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </ListItem>
  );
});

SortableItem.displayName = 'SortableItem';

/**
 * GridCustomizationDialog - Componente principale
 * 
 * Gestisce:
 * - Configurazione colonne griglia
 * - Sistema admin lock e ereditarietà
 * - Salvataggio configurazioni
 * - UI con tabs per diverse opzioni
 */
export function GridCustomizationDialog({
  open,
  onClose,
  gridId,
  columns,
  currentConfig,
  onSave,
  adminConfig,
  createdBy,
  onInheritAdminLocks
}: GridCustomizationDialogProps) {
  // State per gestione UI
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);

  // Determina ruolo utente per controlli admin
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.role === 'admin';

  /**
   * Sistema ereditarietà admin lock
   * Non-admin utenti automaticamente ereditano restrizioni admin
   */
  const inheritAdminLocks = useMemo(() => {
    if (!adminConfig || isAdmin) return currentConfig || {};
    
    const inheritedConfig = { ...currentConfig };
    
    // Applica admin locks dalle configurazioni admin
    if (adminConfig.columns) {
      inheritedConfig.columns = inheritedConfig.columns?.map(column => {
        const adminColumn = adminConfig.columns?.find(c => c.id === column.id);
        if (adminColumn?.adminLock) {
          return { 
            ...column, 
            adminLock: true,
            // Eredita proprietà se bloccate dall'admin
            hidden: adminColumn.hidden ?? column.hidden,
            width: adminColumn.width ?? column.width,
            pinned: adminColumn.pinned ?? column.pinned
          };
        }
        return column;
      }) || adminConfig.columns.filter(c => c.adminLock);
    }
    
    return inheritedConfig;
  }, [adminConfig, currentConfig, isAdmin]);

  /**
   * Inizializza configurazione colonne con merge tra default e esistenti
   * Applica ereditarietà admin lock se necessario
   */
  const initializeConfig = useCallback((): GridCustomization => {
    // Usa config ereditata per non-admin, altrimenti config corrente
    const configToUse = !isAdmin && adminConfig ? inheritAdminLocks : currentConfig;
    
    // Configurazione default per ogni colonna
    const defaultColumns: ColumnConfig[] = columns.map((col, index) => ({
      id: col.id,
      order: index + 1,
      hidden: false,
      width: col.minWidth || col.width || 100,
      pinned: null,
      adminLock: col.adminLock || false
    }));

    // Se esiste configurazione, merge con default
    if (configToUse?.columns) {
      const existingMap = new Map(configToUse.columns.map(col => [col.id, col]));
      
      const mergedColumns = columns.map((col, index) => {
        const existing = existingMap.get(col.id);
        return {
          id: col.id,
          order: existing?.order ?? index + 1,
          hidden: existing?.hidden ?? false,
          width: existing?.width ?? col.minWidth ?? col.width ?? 100,
          pinned: existing?.pinned ?? null,
          adminLock: existing?.adminLock ?? col.adminLock ?? false
        };
      });

      return {
        pageSize: configToUse.pageSize || 10,
        sortBy: configToUse.sortBy,
        sortOrder: configToUse.sortOrder || 'asc',
        filters: configToUse.filters,
        columns: mergedColumns,
        adminLock: configToUse.adminLock || false
      };
    }

    return {
      columns: defaultColumns,
      pageSize: 10,
      sortOrder: 'asc',
      adminLock: false
    };
  }, [columns, currentConfig, inheritAdminLocks, isAdmin, adminConfig]);

  const [tempConfig, setTempConfig] = useState<GridCustomization>(initializeConfig);
  const [hasInheritedAdminLocks, setHasInheritedAdminLocks] = useState(false);

  // Gestione ereditarietà admin locks
  useEffect(() => {
    if (!isAdmin && adminConfig && !hasInheritedAdminLocks) {
      const configWithAdminLocks = inheritAdminLocks;
      setTempConfig(configWithAdminLocks);
      setHasInheritedAdminLocks(true);
      
      // Notifica il parent component dell'eredità
      if (onInheritAdminLocks) {
        onInheritAdminLocks(configWithAdminLocks);
      }
    } else {
      setTempConfig(initializeConfig());
    }
  }, [isAdmin, adminConfig, hasInheritedAdminLocks, inheritAdminLocks, initializeConfig, onInheritAdminLocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset configurazione quando il dialog si apre
  useEffect(() => {
    if (open) {
      setTempConfig(initializeConfig());
      setError(null);
    }
  }, [open, initializeConfig]);

  /**
   * Helper: ottiene configurazione per una colonna specifica
   */
  const getColumnConfig = useCallback((columnId: string): ColumnConfig => {
    const config = tempConfig.columns?.find(col => col.id === columnId);
    if (config) return config as ColumnConfig;
    
    // Fallback alla configurazione default
    const column = columns.find(col => col.id === columnId);
    return {
      id: columnId,
      order: 0,
      hidden: false,
      width: column?.minWidth || column?.width || 100,
      pinned: null,
      adminLock: column?.adminLock || false
    };
  }, [tempConfig.columns, columns]);

  /**
   * Helper: controlla se colonna è visibile
   */
  const isColumnVisible = useCallback((columnId: string): boolean => {
    return !getColumnConfig(columnId).hidden;
  }, [getColumnConfig]);

  // Colonne ordinate secondo configurazione
  const sortedColumns = useMemo(() => {
    return [...columns].sort((a, b) => {
      const aConfig = getColumnConfig(a.id);
      const bConfig = getColumnConfig(b.id);
      return aConfig.order - bConfig.order;
    });
  }, [columns, getColumnConfig]);

  // Conteggio colonne visibili
  const visibleColumnsCount = useMemo(() => {
    return columns.filter(c => isColumnVisible(c.id)).length;
  }, [columns, isColumnVisible]);

  /**
   * Handler drag & drop con validazione admin lock
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && over?.id) {
      // Controllo permessi globali
      if (tempConfig.adminLock && !isAdmin) {
        setError('Non puoi riordinare le colonne: configurazione bloccata dall\'admin');
        return;
      }

      // Verifica se le colonne coinvolte sono bloccate
      const activeConfig = getColumnConfig(active.id as string);
      const overConfig = getColumnConfig(over.id as string);
      
      if ((activeConfig.adminLock || overConfig.adminLock) && !isAdmin) {
        setError('Non puoi riordinare colonne bloccate dall\'admin');
        return;
      }

      setTempConfig(prev => {
        const sortedColumns = [...(prev.columns || [])].sort((a, b) => a.order! - b.order!);
        
        const oldIndex = sortedColumns.findIndex((item) => item.id === active.id);
        const newIndex = sortedColumns.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prev;

        const newColumns = arrayMove(sortedColumns, oldIndex, newIndex);
        
        const updatedColumns = newColumns.map((column, index) => ({
          ...column,
          order: index + 1
        }));

        return {
          ...prev,
          columns: updatedColumns
        };
      });
    }
  }, [tempConfig.adminLock, isAdmin, getColumnConfig]);

  // CORRETTO: Handler per visibilità con rispetto admin lock
  const handleVisibilityChange = useCallback((columnId: string) => {
    // Verifica se la configurazione globale è bloccata
    if (tempConfig.adminLock && !isAdmin) {
      setError('Non puoi modificare la visibilità: la configurazione è bloccata dall\'admin');
      return;
    }

    // Verifica se la colonna specifica è bloccata
    const config = getColumnConfig(columnId);
    if (config.adminLock && !isAdmin) {
      setError('Non puoi modificare questa colonna: è bloccata dall\'admin');
      return;
    }

    setTempConfig(prev => {
      const updatedColumns = (prev.columns || []).map(col => 
        col.id === columnId 
          ? { ...col, hidden: !col.hidden }
          : col
      );

      return {
        ...prev,
        columns: updatedColumns
      };
    });
  }, [tempConfig.adminLock, isAdmin, getColumnConfig]);

  // CORRETTO: Handler per larghezza con rispetto admin lock
  const handleWidthChange = useCallback((columnId: string, width: number) => {
    // Verifica se la configurazione globale è bloccata
    if (tempConfig.adminLock && !isAdmin) {
      setError('Non puoi modificare la larghezza: la configurazione è bloccata dall\'admin');
      return;
    }

    // Verifica se la colonna specifica è bloccata
    const config = getColumnConfig(columnId);
    if (config.adminLock && !isAdmin) {
      setError('Non puoi modificare questa colonna: è bloccata dall\'admin');
      return;
    }

    setTempConfig(prev => {
      const updatedColumns = (prev.columns || []).map(col => 
        col.id === columnId 
          ? { ...col, width: Math.max(50, Math.min(500, width)) }
          : col
      );

      return {
        ...prev,
        columns: updatedColumns
      };
    });
  }, [tempConfig.adminLock, isAdmin, getColumnConfig]);

  // NUOVO: Handler per toggle admin lock (solo per admin)
  const handleAdminLockToggle = useCallback((columnId: string) => {
    if (!isAdmin) return; // Solo gli admin possono modificare i lock
    
    setTempConfig(prev => {
      const updatedColumns = (prev.columns || []).map(col => 
        col.id === columnId 
          ? { ...col, adminLock: !col.adminLock }
          : col
      );

      return {
        ...prev,
        columns: updatedColumns
      };
    });
  }, [isAdmin]);

  // CORRETTO: Handler del salvataggio
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      
      if (!tempConfig.columns || tempConfig.columns.length === 0) {
        setError('Configurazione colonne non valida');
        return;
      }

      // Validazione: almeno una colonna deve essere visibile
      const visibleColumns = tempConfig.columns.filter(col => !col.hidden);
      if (visibleColumns.length === 0) {
        setError('Almeno una colonna deve essere visibile');
        return;
      }

      console.log('Saving grid configuration:', {
        gridId,
        config: tempConfig
      });

      await onSave(tempConfig);
      onClose();
    } catch (error) {
      console.error('Error saving grid configuration:', error);
      setError('Errore durante il salvataggio della configurazione');
    } finally {
      setSaving(false);
    }
  }, [tempConfig, gridId, onSave, onClose]);

  // CORRETTO: Reset
  const handleReset = useCallback(() => {
    const defaultConfig = initializeConfig();
    setTempConfig(defaultConfig);
    setError(null);
  }, [initializeConfig]);

  // CORRETTO: Handler per tab
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6">
            Personalizza Grid: {gridId}
          </Typography>
          {isAdmin && (
            <Chip 
              icon={<AdminPanelSettings />}
              label="Admin"
              color="primary"
              size="small"
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            size="small" 
            label={`${visibleColumnsCount}/${columns.length} colonne visibili`} 
            color={visibleColumnsCount === 0 ? 'error' : 'default'}
          />
          {(() => {
            const lockedColumns = tempConfig.columns?.filter(col => col.adminLock) || [];
            if (lockedColumns.length > 0) {
              return (
                <Chip 
                  size="small" 
                  icon={<Lock />}
                  label={`${lockedColumns.length} bloccate admin`} 
                  color="warning"
                />
              );
            }
            return null;
          })()}
          {tempConfig.adminLock && (
            <Chip 
              size="small" 
              icon={<Lock />}
              label="Grid bloccata admin" 
              color="error"
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Colonne" />
          <Tab label="Ordinamento" />
          <Tab label="Paginazione" />
          {isAdmin && <Tab label="Admin" icon={<AdminPanelSettings />} />}
        </Tabs>

        {/* Tab Colonne */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Trascina per riordinare, usa lo switch per mostrare/nascondere
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
                <List sx={{ maxHeight: '400px', overflow: 'auto' }}>
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
                        isAdmin={isAdmin}
                        onVisibilityChange={handleVisibilityChange}
                        onWidthChange={handleWidthChange}
                        onAdminLockToggle={handleAdminLockToggle}
                      />
                    );
                  })}
                </List>
              </SortableContext>
            </DndContext>
          </Box>
        )}

        {/* Tab Ordinamento */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ordinamento predefinito della griglia
            </Typography>
            
            {tempConfig.adminLock && !isAdmin && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Le impostazioni di ordinamento sono bloccate dall'admin
              </Alert>
            )}
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Colonna di ordinamento</InputLabel>
              <Select
                value={tempConfig.sortBy || ''}
                onChange={(e) => setTempConfig(prev => ({ ...prev, sortBy: e.target.value || undefined }))}
                disabled={tempConfig.adminLock && !isAdmin}
              >
                <MenuItem value="">Nessun ordinamento</MenuItem>
                {columns
                  .filter(col => isColumnVisible(col.id) && col.sortable !== false)
                  .map(col => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.label}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Direzione ordinamento</InputLabel>
              <Select
                value={tempConfig.sortOrder || 'asc'}
                onChange={(e) => setTempConfig(prev => ({ 
                  ...prev, 
                  sortOrder: e.target.value as 'asc' | 'desc' 
                }))}
                disabled={!tempConfig.sortBy || (tempConfig.adminLock && !isAdmin)}
              >
                <MenuItem value="asc">Crescente (A-Z, 1-9)</MenuItem>
                <MenuItem value="desc">Decrescente (Z-A, 9-1)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Tab Paginazione */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Configurazione paginazione
            </Typography>
            
            {tempConfig.adminLock && !isAdmin && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Le impostazioni di paginazione sono bloccate dall'admin
              </Alert>
            )}
            
            <TextField
              label="Elementi per pagina"
              type="number"
              fullWidth
              value={tempConfig.pageSize || 10}
              onChange={(e) => setTempConfig(prev => ({ 
                ...prev, 
                pageSize: Math.max(5, Math.min(100, parseInt(e.target.value) || 10))
              }))}
              inputProps={{ min: 5, max: 100 }}
              helperText="Numero di righe da mostrare per pagina (5-100)"
              disabled={tempConfig.adminLock && !isAdmin}
            />
          </Box>
        )}

        {/* Tab Admin (solo per admin) */}
        {isAdmin && activeTab === 3 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Controlli Admin - Gestione Blocchi
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Come admin, puoi bloccare elementi specifici impedendo ad altri utenti di modificarli.
            </Alert>

            {/* Lock globale griglia */}
            <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                  Blocco Globale Grid
                </Typography>
                <Switch
                  checked={tempConfig.adminLock || false}
                  onChange={(e) => setTempConfig(prev => ({ 
                    ...prev, 
                    adminLock: e.target.checked 
                  }))}
                  icon={<LockOpen />}
                  checkedIcon={<Lock />}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Quando attivo, solo gli admin possono modificare l'intera configurazione della grid.
              </Typography>
            </Box>

            {/* Statistiche blocchi colonne */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1" fontWeight="bold" gutterBottom>
                Statistiche Blocchi Colonne
              </Typography>
              {(() => {
                const allColumns = tempConfig.columns || [];
                const lockedColumns = allColumns.filter(col => col.adminLock);
                const unlockedColumns = allColumns.filter(col => !col.adminLock);
                
                return (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<Lock />}
                      label={`${lockedColumns.length} Bloccate`}
                      color="error"
                      variant="outlined"
                    />
                    <Chip 
                      icon={<LockOpen />}
                      label={`${unlockedColumns.length} Libere`}
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                );
              })()}
            </Box>

            {/* Lista colonne con controlli admin */}
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Gestione Blocchi per Colonna
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Clicca l'icona del lucchetto per bloccare/sbloccare singole colonne.
            </Typography>
            
            <List sx={{ maxHeight: '300px', overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {columns.map((column) => {
                const config = getColumnConfig(column.id);
                const isLocked = config.adminLock;
                
                return (
                  <ListItem 
                    key={column.id}
                    sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      backgroundColor: isLocked ? 'error.light' : 'background.paper',
                      '&:last-child': { borderBottom: 0 }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {column.label}
                          </Typography>
                          {isLocked && (
                            <Chip 
                              size="small" 
                              label="Bloccata" 
                              color="error"
                              icon={<Lock />}
                            />
                          )}
                        </Box>
                      }
                      secondary={`ID: ${column.id}`}
                    />
                    
                    <Tooltip title={isLocked ? "Rimuovi blocco admin" : "Blocca per admin"}>
                      <IconButton
                        onClick={() => handleAdminLockToggle(column.id)}
                        color={isLocked ? "error" : "default"}
                        size="large"
                      >
                        {isLocked ? <Lock /> : <LockOpen />}
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>

            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Attenzione:</strong> Le colonne bloccate non potranno essere modificate, riordinate o nascoste dagli utenti non admin.
            </Alert>
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
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salva'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
