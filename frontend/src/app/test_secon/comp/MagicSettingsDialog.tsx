"use client";
import React, { useState, useRef, useContext } from "react";
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
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

import { AuthContext } from "../../components/Authcontext";

export default function MagicSettingsDialog({
  Tree,
  ovr,
  setOvr,
  formKey,
  update,
  list,
}: any) {

  const authContext = useContext(AuthContext);
  const fetchWithAuth = authContext?.fetchWithAuth;
  const userId = authContext?.user?.id;
  const role = authContext?.user?.role;
  const parentId = authContext?.user?.parentId;

  const [open, setOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // internal saved state and dirty tracking
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  
  const storageKey = (uid?: string, formKey?: string) =>`magic_ovr:${uid || "anon"}:${formKey || "global"}`;
  // form-specific setting name: use parentId and formKey as requested
  const settingName = (() => {
    if (formKey && parentId) return `${parentId}:${formKey}`;
    if (formKey) return `${formKey}`;
    return `user:${userId}`;
  })();
  
  const saveToServer = async () => {
    try {
      if (!fetchWithAuth) {
        // fallback to localStorage for unauthenticated users
        const key = storageKey(userId, formKey);
        localStorage.setItem(key, JSON.stringify({ ovr, savedAt: Date.now() }));
        setSavedSnapshot(JSON.stringify(ovr));
        setIsSaved(true);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const url = `${API_BASE_URL}/user-settings/my-settings/customization`;
      const body: any = { customizationConfig: { ovr }, settingname: settingName };
      const res = await fetchWithAuth(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedSnapshot(JSON.stringify(ovr));
      setIsSaved(true);
    } catch (e) {
      console.error('Error saving overrides to server:', e);
    }
  };

  const loadFromServer = async () => {
    try {
      if (!fetchWithAuth) {
        const key = storageKey(userId, formKey);
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data.ovr === 'object') {
          setOvr(data.ovr);
          setSavedSnapshot(JSON.stringify(data.ovr));
          setIsSaved(true);
        }
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const url = `${API_BASE_URL}/user-settings/my-settings`;
      const res = await fetchWithAuth(url);
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      // server stores customizationConfig as a full object; we expect { ovr } inside
      const cfg = data?.customizationConfig;
      if (cfg && cfg.ovr) {
        setOvr(cfg.ovr);
        setSavedSnapshot(JSON.stringify(cfg.ovr));
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Error loading overrides from server:', e);
    }
  };

  const resetOnServer = async () => {
    const ok = typeof window !== 'undefined' ? window.confirm('Resettare tutte le personalizzazioni per questo form?') : true;
    if (!ok) return;
    try {
      if (!fetchWithAuth) {
        try { localStorage.removeItem(storageKey(userId, formKey)); } catch (e) {}
        setOvr({});
        setSavedSnapshot(null);
        setIsSaved(false);
        return;
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      const url = `${API_BASE_URL}/user-settings/my-settings`;
      const res = await fetchWithAuth(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Reset failed');
      setOvr({});
      setSavedSnapshot(null);
      setIsSaved(false);
    } catch (e) {
      console.error('Error resetting overrides on server:', e);
    }
  };

  // track dirty state when overrides change
  React.useEffect(() => {
    const cur = JSON.stringify(ovr);
    setIsSaved(savedSnapshot === cur && savedSnapshot !== null);
  }, [ovr, savedSnapshot]);

  // auto-load when userId or (optional) formKey change: attempt to load saved if present
  React.useEffect(() => {
    // try to load from server/local on mount or when userId/formKey change
    loadFromServer();
  }, [userId, formKey]);

  const onReset = () => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm(
            "Resettare tutte le personalizzazioni per questo form?"
          )
        : true;
    if (!ok) return;
    try {
      localStorage.removeItem(storageKey(userId, formKey));
    } catch (e) {
      // ignore
    }
    setOvr({});
    setSavedSnapshot(null);
    setIsSaved(false);
    // eslint-disable-next-line no-console
    console.log(
      "MagicSettingsDialog: reset overrides and removed saved entry",
      storageKey(userId, formKey)
    );
  };

  return (
    <div
      style={{ display: "flex", gap: 8, marginLeft: 8, alignItems: "center" }}
    >
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        aria-label="Impostazioni"
      >
        <SettingsIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth={false}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
        PaperProps={{ sx: { width: "min(640px, 92vw)", maxHeight: "90vh" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>Impostazioni Magic</Box>
          <Chip label={`Ruolo: ${String(role ?? "anon")}`} size="small" />
          <Chip
            label={isSaved ? "Salvato" : "Modifiche non salvate"}
            color={isSaved ? "success" : "warning"}
            size="small"
          />
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={1} sx={{ mb: 1, pt: 0 }}></Stack>
          {importError && (
            <Typography color="error" variant="caption">
              {importError}
            </Typography>
          )}

          <Box sx={{ maxHeight: "50vh", overflow: "auto", mt: 1 }}>
            <List dense>
              {Array.isArray(list) &&
                list.map((r: any) => (
                  <ListItem
                    key={`ctl-${r.key}`}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pl: `${r.depth * 1.2}rem`,
                    }}
                  >
                    <ListItemText
                      primary={r.key}
                      sx={{ mr: 2, wordBreak: "break-all" }}
                    />
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={Number.isFinite(r.meta.order) ? r.meta.order : 0}
                        onChange={(e) =>
                          update(r.key, {
                            order: parseInt(e.target.value || "0", 10),
                          })
                        }
                        sx={{ width: 96 }}
                      />
                      <Tooltip title={r.meta.visible ? "Nascondi" : "Mostra"}>
                        <IconButton
                          size="small"
                          onClick={() =>
                            update(r.key, { visible: !r.meta.visible })
                          }
                        >
                          {r.meta.visible ? (
                            <VisibilityIcon fontSize="small" />
                          ) : (
                            <VisibilityOffIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={r.meta.disabled ? "Sblocca" : "Disabilita"}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            update(r.key, { disabled: !r.meta.disabled })
                          }
                        >
                          {r.meta.disabled ? (
                            <LockIcon fontSize="small" />
                          ) : (
                            <EditIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
            </List>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{ justifyContent: "flex-end", gap: 1, pr: 2, pb: 2 }}
        >
          <Button onClick={saveToServer} variant="contained" color="primary">
            Salva
          </Button>
          <Button onClick={loadFromServer} variant="outlined">
            Carica
          </Button>
          <Button onClick={resetOnServer} color="error" variant="outlined">
            Reset
          </Button>
          <Button onClick={() => setOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
