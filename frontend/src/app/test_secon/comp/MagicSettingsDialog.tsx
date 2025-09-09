"use client";
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Divider,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestoreIcon from '@mui/icons-material/Restore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

type Meta = {
  visible: boolean;
  order: number;
  disabled: boolean;
};

export default function MagicSettingsDialog({
  ovr,
  setOvr,
  savedSnapshot,
  setSavedSnapshot,
  isSaved,
  setIsSaved,
  saveToLocal,
  loadFromLocal,
  storageKey,
  userId,
  update,
  list,
  role,
}: any) {
  const [open, setOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onReset = () => {
    const ok = typeof window !== 'undefined' ? window.confirm('Resettare tutte le personalizzazioni per questo form?') : true;
    if (!ok) return;
    try {
      localStorage.removeItem(storageKey(userId));
    } catch (e) {
      // ignore
    }
    setOvr({});
    setSavedSnapshot(null);
    setIsSaved(false);
    // eslint-disable-next-line no-console
    console.log('MagicSettingsDialog: reset overrides and removed saved entry', storageKey(userId));
  };

  const onImportFile = (f?: File | null) => {
    setImportError(null);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const txt = String(reader.result || '');
        const data = JSON.parse(txt);
        const newOvr = data && typeof data === 'object' ? (data.ovr ?? data) : null;
        if (!newOvr || typeof newOvr !== 'object') {
          setImportError('Formato file non valido: nessun oggetto overrides trovato');
          return;
        }
        setOvr(newOvr);
        const s = JSON.stringify(newOvr);
        setSavedSnapshot(s);
        setIsSaved(false);
        // eslint-disable-next-line no-console
        console.log('MagicSettingsDialog: imported overrides from file', f.name, newOvr);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Import error', err);
        setImportError(String(err));
      }
    };
    reader.readAsText(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    onImportFile(file);
    if (e.target) e.target.value = '';
  };

  return (
      <div style={{ display: 'flex', gap: 8, marginLeft: 8, alignItems: 'center' }}>
      <IconButton size="small" onClick={() => setOpen(true)} aria-label="Impostazioni">
        <SettingsIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={false}
        sx={{ '& .MuiDialog-container': { alignItems: 'center', justifyContent: 'center' } }}
        PaperProps={{ sx: { width: 'min(640px, 92vw)', maxHeight: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>Impostazioni Magic</Box>
          <Chip label={`Ruolo: ${String(role ?? 'anon')}`} size="small" />
          <Chip label={isSaved ? 'Salvato' : 'Modifiche non salvate'} color={isSaved ? 'success' : 'default'} size="small" />
        </DialogTitle>
          <Divider  />
        <DialogContent>
          <Stack spacing={1} sx={{ mb: 1, pt: 0 }}>
            
            
          </Stack>
          {importError && <Typography color="error" variant="caption">{importError}</Typography>}

          <Box sx={{ maxHeight: '50vh', overflow: 'auto', mt: 1 }}>
            <List dense>
              {Array.isArray(list) && list.map((r: any) => (
                <ListItem
                  key={`ctl-${r.key}`}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: `${r.depth * 1.2}rem` }}
                >
                  <ListItemText primary={r.key} sx={{ mr: 2, wordBreak: 'break-all' }} />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      type="number"
                      value={Number.isFinite(r.meta.order) ? r.meta.order : 0}
                      onChange={(e) => update(r.key, { order: parseInt(e.target.value || '0', 10) })}
                      sx={{ width: 96 }}
                    />
                    <Tooltip title={r.meta.visible ? 'Nascondi' : 'Mostra'}>
                      <IconButton size="small" onClick={() => update(r.key, { visible: !r.meta.visible })}>
                        {r.meta.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={r.meta.disabled ? 'Sblocca' : 'Disabilita'}>
                      <IconButton size="small" onClick={() => update(r.key, { disabled: !r.meta.disabled })}>
                        {r.meta.disabled ? <LockIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              ))}
              
            </List>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, pr: 2, pb: 2 }}>
          <Button onClick={saveToLocal} variant="contained" color="primary">Salva</Button>
          <Button onClick={loadFromLocal} variant="outlined">Carica</Button>
          <Button onClick={onReset} color="error" variant="outlined">Reset</Button>
          <Button onClick={() => setOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
