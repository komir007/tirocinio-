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
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

export default function MagicSettingsDialog({
  ovr,
  setOvr,
  formKey,
  update,
  list,
  userId,
  role,
  parentId,
}: any) {
  
  const [open, setOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // internal saved state and dirty tracking
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const storageKey = (uid?: string, formKey?: string) =>`magic_ovr:${uid || "anon"}:${formKey || "global"}`;

  const saveToLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const payload = { ovr, savedAt: Date.now() };
      const key = storageKey(userId, formKey);
      // prefer formKey passed via props (we'll accept userId as second arg),
      // but callers will call without args, so try to read from attributes
      // if not present, fall back to 'global'
      // Since TS can't access outer formKey prop here (not provided), we allow callers to pass it.
      localStorage.setItem(key, JSON.stringify(payload));
      const s = JSON.stringify(ovr);
      setSavedSnapshot(s);
      setIsSaved(true);
      // eslint-disable-next-line no-console
      console.log(
        "save:--->",
        key,
        JSON.stringify(payload)
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error saving overrides:", e);
    }
  };

  const loadFromLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const key = storageKey(userId, formKey);
      const raw = localStorage.getItem(key);
      if (!raw) {
        // eslint-disable-next-line no-console
        console.log("No saved overrides found for key", key);
        return;
      }
      const data = JSON.parse(raw);
      if (data && typeof data.ovr === "object") {
        setOvr(data.ovr);
        const s = JSON.stringify(data.ovr);
        setSavedSnapshot(s);
        setIsSaved(true);
        // eslint-disable-next-line no-console
        console.log(
          "MagicSettingsDialog: loaded overrides from localStorage",
          key
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error loading overrides:", e);
    }
  };

  // track dirty state when overrides change
  React.useEffect(() => {
    const cur = JSON.stringify(ovr);
    setIsSaved(savedSnapshot === cur && savedSnapshot !== null);
  }, [ovr, savedSnapshot]);

  // auto-load when userId or (optional) formKey change: attempt to load saved if present
  React.useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const key = storageKey(userId, formKey);
      const raw = localStorage.getItem(key);
      if (raw) {
        loadFromLocal();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error checking saved overrides:", e);
    }
  }, [userId]);

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
            color={isSaved ? "success" : "default"}
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
          <Button onClick={saveToLocal} variant="contained" color="primary">
            Salva
          </Button>
          <Button onClick={loadFromLocal} variant="outlined">
            Carica
          </Button>
          <Button onClick={onReset} color="error" variant="outlined">
            Reset
          </Button>
          <Button onClick={() => setOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
