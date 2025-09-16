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

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

import { AuthContext } from "../../components/Authcontext";

type Meta = {
  visible: boolean;
  order: number;
  disabled: boolean;
  adminlock?: boolean;
};

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

  /*const storageKey = (uid?: string, formKey?: string) =>
    `magic_ovr:${uid || "anon"}:${formKey || "global"}`;*/
  // form-specific setting name: use parentId and formKey as requested
  const settingName = formKey;
  console.log("settingName:", settingName, typeof settingName);

  const saveToServer = async () => {
    try {
      if (!fetchWithAuth) {
        // fallback to localStorage for unauthenticated users
        /*const key = storageKey(userId, formKey);
        localStorage.setItem(key, JSON.stringify({ ovr, savedAt: Date.now() }));
        setSavedSnapshot(JSON.stringify(ovr));
        setIsSaved(true);*/
        console.error("No fetchWithAuth available");
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      // backend expects PUT /user-settings/my-settings with body
      const url = `${API_BASE_URL}/user-settings/my-settings`;
      const body: any = {
        customizationConfig: { ovr },
        settingname: settingName,
      };
      console.log("Saving to server URL:", ovr, url, body);
      const res = await fetchWithAuth(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setSavedSnapshot(JSON.stringify(ovr));
      setIsSaved(true);
    } catch (e) {
      console.error("Error saving overrides to server:", e);
    }
  };

  const loadFromServer = async () => {
    try {
      if (!fetchWithAuth) {
        /*
        const key = storageKey(userId, formKey);
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && typeof data.ovr === "object") {
          setOvr(data.ovr);
          setSavedSnapshot(JSON.stringify(data.ovr));
          setIsSaved(true);
        }*/
        console.error("No fetchWithAuth available");
        return;
      }
      if (role == "admin") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        // pass settingname as query param; GET cannot have a body
        const url = `${API_BASE_URL}/user-settings/my-settings$${""}`.replace(
          "$",
          settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
        );
        const res = await fetchWithAuth(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();
        // server stores customizationConfig as a full object; we expect { ovr } inside
        const cfg = data?.customizationConfig;
        if (cfg && cfg.ovr) {
          console.log("url server admin", url);
          console.log("fetchWithAuth", fetchWithAuth);
          setOvr(cfg.ovr);
          setSavedSnapshot(JSON.stringify(cfg.ovr));
          setIsSaved(true);
        }
      }

      if (role === "agent") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        // pass settingname as query param; GET cannot have a body
        const url_admin =
          `${API_BASE_URL}/user-settings/my-admin-setting$${""}`.replace(
            "$",
            settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
          );
        console.log("URL used:", url_admin);
        const res = await fetchWithAuth(url_admin, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();
        const cfg_admin = data?.customizationConfig;

        const url_agent =
          `${API_BASE_URL}/user-settings/my-settings$${""}`.replace(
            "$",
            settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
          );
        console.log("URL used:", url_agent);
        const res_agent = await fetchWithAuth(url_agent, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res_agent.ok) throw new Error("Load failed");
        const data_agent = await res_agent.json();
        const cfg_agent = data_agent?.customizationConfig;

        const adminOverrides: Record<string, Meta> | null = cfg_admin?.ovr || null;
        const agentOverrides: Record<string, Meta> | null = cfg_agent?.ovr || null;
        console.log("adminOverrides:", adminOverrides);
        console.log("agentOverrides:", agentOverrides);

        if (adminOverrides && agentOverrides) {
          const merged_ovr: Record<string, Meta> = {};
          const adminO = adminOverrides;
          const agentO = agentOverrides;
          const allKeys = new Set<string>([
            ...Object.keys(adminO),
            ...Object.keys(agentO),
          ]);

          console.log("allKeys:", allKeys);

          allKeys.forEach((k) => {
            console.log("Merging key:", k);
            console.log(" adminO[k]:", adminO[k]);
            console.log(" agentO[k]:", agentO[k]);
            // merge logic: if adminlock is set in admin, take admin fully; else agent can override
            // if only one side has it, take that (but agent cannot enforce adminlock)
            const a = adminO[k];
            const b = agentO[k];
            if (a && b) {
              if (a.adminlock) {
                merged_ovr[k] = { ...a }; // admin locked: take admin settings fully
              } else {
                const agentCopy = { ...b };
                if (agentCopy.adminlock) agentCopy.adminlock = false; // agent cannot enforce adminlock
                merged_ovr[k] = { ...a, ...agentCopy }; // agent overrides admin where present
              }
            } else if (a) {
              merged_ovr[k] = { ...a };
            } else if (b) {
              const agentCopy = { ...b };
              if (agentCopy.adminlock) agentCopy.adminlock = false;
              merged_ovr[k] = agentCopy;
            }
          });
          console.log("[MagicSettingsDialog] merged admin+agent overrides", merged_ovr );
          setOvr(merged_ovr);
          setSavedSnapshot(JSON.stringify(merged_ovr));
          setIsSaved(true);
          return;
        } else if (adminOverrides && !agentOverrides) {
          console.log("[MagicSettingsDialog] only admin overrides present");
          setOvr(adminOverrides);
          setSavedSnapshot(JSON.stringify(adminOverrides));
          setIsSaved(true);
          return;
        } else if (agentOverrides && !adminOverrides) {
          console.log("[MagicSettingsDialog] only agent overrides present");
          const cleaned: Record<string, Meta> = {};
          Object.entries(agentOverrides).forEach(([k, v] : [string, Meta]) => {
            cleaned[k] = { ...v };
            if (cleaned[k].adminlock) cleaned[k].adminlock = false;
          });
          setOvr(cleaned);
          setSavedSnapshot(JSON.stringify(cleaned));
          setIsSaved(true);
          console.log("ovr-----------------", ovr);
          return;
        } else {
          console.log(
            "[MagicSettingsDialog] no overrides found for agent/admin"
          );
        }
      }

      if (role === "client") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        // pass settingname as query param; GET cannot have a body
        const url =
          `${API_BASE_URL}/user-settings/my-admin-setting$${""}`.replace(
            "$",
            settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
          );
        console.log("URL used:", url);
        const res = await fetchWithAuth(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Load failed");
        const data = await res.json();

        // server stores customizationConfig as a full object; we expect { ovr } inside

        const cfg = data?.customizationConfig;
        if (cfg && cfg.ovr) {
          setOvr(cfg.ovr);
          setSavedSnapshot(JSON.stringify(cfg.ovr));
          setIsSaved(true);
        }
      }
    } catch (e) {
      console.error("Error loading overrides from server:", e);
    }
  };

  const resetOnServer = async () => {
    const ok =
      typeof window !== "undefined"
        ? window.confirm(
            "Resettare tutte le personalizzazioni per questo form?"
          )
        : true;
    if (!ok) return;
    try {
      if (!fetchWithAuth) {
        try {
          /*localStorage.removeItem(storageKey(userId, formKey));*/
        } catch (e) {}
        setOvr({});
        setSavedSnapshot(null);
        setIsSaved(false);
        return;
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      // use query param for the optional setting name
      const url = `${API_BASE_URL}/user-settings/my-settings$${""}`.replace(
        "$",
        settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
      );
      const res = await fetchWithAuth(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Reset failed");
      setOvr({});
      setSavedSnapshot(null);
      setIsSaved(false);
    } catch (e) {
      console.error("Error resetting overrides on server:", e);
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
                      {(() => {
                        const locked = !!r.meta.adminlock && role !== "admin";
                        const faded = locked
                          ? { opacity: 0.4, pointerEvents: "none" }
                          : {};
                        return (
                          <>
                            <Tooltip
                              title={r.meta.visible ? "Nascondi" : "Mostra"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={locked}
                                  onClick={() =>
                                    !locked &&
                                    update(r.key, { visible: !r.meta.visible })
                                  }
                                  sx={faded}
                                >
                                  {r.meta.visible ? (
                                    <VisibilityIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  ) : (
                                    <VisibilityOffIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={r.meta.disabled ? "Sblocca" : "Disabilita"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={locked}
                                  onClick={() =>
                                    !locked &&
                                    update(r.key, {
                                      disabled: !r.meta.disabled,
                                    })
                                  }
                                  sx={faded}
                                >
                                  {r.meta.disabled ? (
                                    <LockIcon
                                      fontSize="small"
                                      color="primary"
                                    />
                                  ) : (
                                    <EditIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        );
                      })()}
                      {role === "admin" && (
                        <Tooltip
                          title={
                            r.meta.adminlock
                              ? "Sblocca (admin)"
                              : "Blocca (admin)"
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              update(r.key, { adminlock: !r.meta.adminlock })
                            }
                          >
                            {r.meta.adminlock ? (
                              <AdminPanelSettingsIcon
                                color="primary"
                                fontSize="small"
                              />
                            ) : (
                              <AdminPanelSettingsIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                      {role === "agent" && r.meta.adminlock && (
                        <Tooltip
                          title={
                            r.meta.adminlock
                              ? "Sblocca (admin)"
                              : "Blocca (admin)"
                          }
                        >
                          <AdminPanelSettingsIcon
                            color="warning"
                            fontSize="small"
                          />
                        </Tooltip>
                      )}
                      {(() => {
                        const locked = !!r.meta.adminlock && role !== "admin";
                        return (
                          <TextField
                            size="small"
                            type="number"
                            value={
                              Number.isFinite(r.meta.order) ? r.meta.order : 0
                            }
                            onChange={(e) =>
                              update(r.key, {
                                order: parseInt(e.target.value || "0", 10),
                              })
                            }
                            sx={{ width: 96, opacity: locked ? 0.4 : 1 }}
                            disabled={locked}
                          />
                        );
                      })()}
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
