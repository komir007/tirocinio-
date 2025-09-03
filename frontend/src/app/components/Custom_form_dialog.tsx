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
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

// Usa dnd-kit per drag & drop.
// Se non è installato: npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionConfig } from './custom_form_util';

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

type Props = {
  open: boolean;
  onClose: () => void;
  sections: SectionConfig[];
  onChange: (newSections: SectionConfig[]) => void;
};

export default function CustomFormDialog({ open, onClose, sections, onChange }: Props) {
  const [localSections, setLocalSections] = React.useState<SectionConfig[]>(sections || []);
  const [activeTab, setActiveTab] = React.useState(0);

  React.useEffect(() => {
    setLocalSections(sections || []);
  }, [sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Richiede un minimo di movimento per iniziare il drag
      }
    })
  );

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = localSections.findIndex(s => s.id === active.id);
      const newIndex = localSections.findIndex(s => s.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        setLocalSections((items) => {
          const newItems = arrayMove(items, oldIndex, newIndex);
          // Aggiorna l'ordine di tutte le sezioni dopo il riordino
          return newItems.map((section, index) => ({
            ...section,
            order: index
          }));
        });
      }
    }
  };

  const toggleVisibility = (id: string) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const toggleReadOnly = (id: string) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, readOnly: !s.readOnly } : s));
  };

  const toggleAdminLock = (id: string) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, adminLocked: !s.adminLocked } : s));
  };

  const handleSave = () => {
    onChange(localSections);
    console.log("Salvataggio configurazione:", localSections);
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
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab 
            icon={<DragIndicatorIcon />} 
            label="Riordina" 
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
              Trascina per riordinare le sezioni
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
              Trascina gli elementi per riordinarli. Le modifiche si applicheranno quando salvi.
            </Typography>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Gestisci visibilità delle sezioni
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
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
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Imposta sezioni in sola lettura
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
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
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              Blocco amministratore
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Le sezioni bloccate dall'amministratore non possono essere modificate
            </Typography>
            <List sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
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
