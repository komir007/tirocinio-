"use client";
import React, { useState, useContext, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Divider,
  Tooltip,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";

import { AuthContext } from "../../components/Authcontext";
import { TNode, Meta } from "./MagicWrapper";

export default function MagicSettingsDialog({ tree, ovr, setOvr }: any) {
  const authContext = useContext(AuthContext);
  const fetchWithAuth = authContext?.fetchWithAuth;
  const userId = authContext?.user?.id;
  const role = authContext?.user?.role;

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [open, setOpen] = useState(false);

  // internal saved state and dirty tracking

  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  /*const storageKey = (uid?: string, formKey?: string) =>
    `magic_ovr:${uid || "anon"}:${formKey || "global"}`;*/
  // form-specific setting name: use parentId and formKey as requested

  const formKey = useMemo(() => {
    const find = (nodes: TNode[]): string | null => {
      for (const n of nodes) {
        const k = (n.key || "").toLowerCase();
        if (k.startsWith("form")) return n.key;
        if (n.children?.length) {
          const c = find(n.children);
          if (c) return c;
        }
      }
      return null;
    };
    return find(tree) || "global";
  }, [tree]);

  const settingName = formKey;
  //console.log("settingName:", settingName, typeof settingName);

  React.useEffect(() => {
    loadFromServer();
  }, [userId, formKey]);

  React.useEffect(() => {
    const cur = JSON.stringify(ovr);
    setIsSaved(savedSnapshot === cur && savedSnapshot !== null);
  }, [ovr, savedSnapshot]);

  // Rimuove flag interni e (se admin) anche i campi che sono default per ridurre rumore lato server
  const sanitizeOverrides = (
    raw: Record<string, Meta>,
    isAdmin: boolean
  ): Record<string, any> => {
    const out: Record<string, any> = {};
    Object.entries(raw).forEach(([k, v]) => {
      const clone: any = { ...v };
      delete clone._adminVisible;
      delete clone._adminDisabled;
      delete clone._adminOrder;
      delete clone._adminsezione;
      if (isAdmin) {
        if (clone.visible === true) delete clone.visible;
        if (clone.disabled === false) delete clone.disabled;
        if (clone.adminlock === false) delete clone.adminlock;
        if (clone.sezione === undefined) delete clone.sezione;
      }
      if (Object.keys(clone).length > 0) out[k] = clone;
    });
    return out;
  };

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
      const url = `${API_BASE_URL}/user-settings/my-settings`;
      // Sempre ripulisci i flag interni; per admin anche campi default
      const toSend = sanitizeOverrides(ovr, true);

      const body: any = {
        customizationConfig: { ovr: toSend },
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
      setSnackbarMessage("Impostazioni salvate");
      setOpenSnackbar(true);
    } catch (e) {
      console.error("Error saving overrides to server:", e);
      setSnackbarMessage("Errore nel salvataggio delle impostazioni");
      setOpenSnackbar(true);
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
        }
        */
        console.error("No fetchWithAuth available");
        return;
      }
      if (role == "admin") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        const url = `${API_BASE_URL}/user-settings/my-settings$${""}`.replace(
          "$",
          settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
        );
        const res = await fetchWithAuth(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          setSnackbarMessage("Errore nel caricamento delle impostazioni");
          setOpenSnackbar(true);
          throw new Error("Load failed");
        }
        const data = await res.json();
        const cfg = data?.customizationConfig;
        if (cfg && cfg.ovr) {
          console.log("url server admin", url);
          // Admin: i dati dal server non dovrebbero contenere flag, ma sanitizziamo comunque
          const clean = sanitizeOverrides(cfg.ovr, false);
          setOvr(clean);
          setSavedSnapshot(JSON.stringify(clean));
          setIsSaved(true);
          setSnackbarMessage("Impostazioni caricate dall'admin");
          setOpenSnackbar(true);
        }
      }

      if (role === "agent") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        // pass settingname as query param;
        const url_admin =
          `${API_BASE_URL}/user-settings/my-admin-setting$${""}`.replace(
            "$",
            settingName ? `?settingname=${encodeURIComponent(settingName)}` : ""
          );
        console.log("URL used:", url_admin);
        const res_admin = await fetchWithAuth(url_admin, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res_admin.ok) {
          setSnackbarMessage(
            "Errore nel caricamento merge delle impostazioni parte admin"
          );
          setOpenSnackbar(true);
          throw new Error("Load failed");
        }
        const data = await res_admin.json();
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
        if (!res_agent.ok) {
          setSnackbarMessage(
            "Errore nel caricamento merge delle impostazioni parte agent"
          );
          setOpenSnackbar(true);
          throw new Error("Load failed");
        }
        const data_agent = await res_agent.json();
        const cfg_agent = data_agent?.customizationConfig;

        const adminOverrides: Record<string, Meta> | null =
          cfg_admin?.ovr || null;
        const agentOverrides: Record<string, Meta> | null =
          cfg_agent?.ovr || null;
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
          allKeys.forEach((k) => {
            const a = adminO[k];
            const b = agentO[k];
            if (a && b) {
              const merged: Meta = { ...b } as Meta;
              // Solo proprietà realmente presenti nell'override admin (dopo pulizia) generano blocco
              if (Object.prototype.hasOwnProperty.call(a, "visible")) {
                merged.visible = b.visible ?? a.visible;
                merged._adminVisible = true;
              }
              if (Object.prototype.hasOwnProperty.call(a, "disabled")) {
                merged.disabled = b.disabled ?? a.disabled;
                merged._adminDisabled = true;
              }
              if (Object.prototype.hasOwnProperty.call(a, "order")) {
                merged.order = b.order ?? a.order;
                merged._adminOrder = true;
              }
              if (Object.prototype.hasOwnProperty.call(a, "sezione")) {
                merged.sezione = b.sezione ?? a.sezione;
                merged._adminsezione = true;
              }
              if (a.adminlock) merged.adminlock = a.adminlock; // legacy
              merged_ovr[k] = merged;
            } else if (a) {
              const merged: Meta = { ...a } as Meta;
              if (Object.prototype.hasOwnProperty.call(a, "visible"))
                merged._adminVisible = true;
              if (Object.prototype.hasOwnProperty.call(a, "disabled"))
                merged._adminDisabled = true;
              if (Object.prototype.hasOwnProperty.call(a, "order"))
                merged._adminOrder = true;
              if (Object.prototype.hasOwnProperty.call(a, "sezione"))
                merged._adminsezione = true;
              merged_ovr[k] = merged;
            } else if (b) {
              merged_ovr[k] = { ...b } as Meta; // solo agent
            }
          });
          console.log(
            "[MagicSettingsDialog] merged admin+agent overrides",
            merged_ovr
          );
          setOvr(merged_ovr);
          setSavedSnapshot(JSON.stringify(merged_ovr));
          setIsSaved(true);
          setSnackbarMessage("Impostazioni caricate con merge admin/agent");
          setOpenSnackbar(true);
          return;
        } else if (adminOverrides && !agentOverrides) {
          console.log("[MagicSettingsDialog] only admin overrides present");
          const withFlags: Record<string, Meta> = {};
          Object.entries(adminOverrides).forEach(([k, v]) => {
            const clone: Meta = { ...v } as Meta;
            if (Object.prototype.hasOwnProperty.call(v, "visible"))
              clone._adminVisible = true;
            if (Object.prototype.hasOwnProperty.call(v, "disabled"))
              clone._adminDisabled = true;
            if (Object.prototype.hasOwnProperty.call(v, "order"))
              clone._adminOrder = true;
            if (Object.prototype.hasOwnProperty.call(v, "sezione"))
              clone._adminsezione = true;
            withFlags[k] = clone;
          });
          // Flags aggiunti solo runtime, ma memorizziamo snapshot senza alterare i dati originali
          setOvr(withFlags);
          setSavedSnapshot(JSON.stringify(withFlags));
          setIsSaved(true);
          setSnackbarMessage("Impostazioni caricate dal admin nel merge");
          setOpenSnackbar(true);
          return;
        } else if (agentOverrides && !adminOverrides) {
          console.log("[MagicSettingsDialog] only agent overrides present");
          const cleaned: Record<string, Meta> = {};
          Object.entries(agentOverrides).forEach(([k, v]: [string, Meta]) => {
            cleaned[k] = { ...v };
            if (cleaned[k].adminlock) cleaned[k].adminlock = false; // keep previous behaviour
          });
          setOvr(cleaned);
          setSavedSnapshot(JSON.stringify(cleaned));
          setIsSaved(true);
          setSnackbarMessage("Impostazioni caricate dall'agent cleaned");
          setOpenSnackbar(true);
          return;
        } else {
          console.log(
            "[MagicSettingsDialog] no overrides found for agent/admin"
          );
          setSnackbarMessage("Nessuna impostazione trovata per admin/agent");
          setOpenSnackbar(true);
          return;
        }
      }

      if (role === "client") {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
        // pass settingname as query param;
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
        if (!res.ok) {
          setSnackbarMessage("Errore nel caricamento delle impostazioni");
          setOpenSnackbar(true);
          throw new Error("Load failed");
        }
        const data = await res.json();
        // server stores customizationConfig as a full object;
        const cfg = data?.customizationConfig;
        if (cfg && cfg.ovr) {
          setOvr(cfg.ovr);
          setSavedSnapshot(JSON.stringify(cfg.ovr));
          setIsSaved(true);
          setSnackbarMessage("Impostazioni caricate dal dal admin(agent)");
          setOpenSnackbar(true);
        }
      }
    } catch (e) {
      console.error("Error loading overrides from server:", e);
    }
  };

  const resetOnServer = async () => {
    try {
      if (!fetchWithAuth) {
        try {
          /*localStorage.removeItem(storageKey(userId, formKey));*/
        } catch (e) {}
        /*setOvr({});
        setSavedSnapshot(null);
        setIsSaved(false);*/
        console.error("No fetchWithAuth available");
        return;
      }
      const newOvr: Record<string, Meta> = {};

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
      const url = `${API_BASE_URL}/user-settings/my-settings`;
      const body: any = {
        customizationConfig: { ovr: newOvr },
        settingname: settingName,
      };
      console.log("Saving to server URL:", newOvr, url, body);
      const res = await fetchWithAuth(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSnackbarMessage("Errore nel reset delle impostazioni res");
        setOpenSnackbar(true);
        throw new Error("Save failed");
      }
      setOvr({});
      setSavedSnapshot(JSON.stringify(newOvr));
      setIsSaved(true);
      setSnackbarMessage("Impostazioni ressettate");
      setOpenSnackbar(true);
    } catch (e) {
      console.error("Error resetting overrides to server:", e);
      setSnackbarMessage("Errore nel reset delle impostazioni al server");
      setOpenSnackbar(true);
    }
  };

  const list = useMemo(() => {
    const out: Array<{ key: string; depth: number; meta: Meta }> = [];
    const walk = (nodes: TNode[], depth: number) => {
      nodes.forEach((n) => {
        // include only element nodes whose key starts with the specified prefixes
        const keyLower = (n.key || "").toLowerCase();
        if (
          n.isEl &&
          (keyLower.startsWith("form") ||
            keyLower.startsWith("sezione") ||
            keyLower.startsWith("field"))
        ) {
          out.push({ key: n.key, depth, meta: n.meta });
        }
        if (n.children?.length) walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return out;
  }, [tree]);

  // collect available section keys for sezione assignment
  const sectionKeys = useMemo(
    () =>
      list
        .filter((i) => i.key.toLowerCase().startsWith("sezione"))
        .map((i) => i.key),
    [list]
  );

  const update = (key: string, patch: Partial<Meta>) => {
    if (
      typeof patch.visible !== "undefined" &&
      patch.visible === false &&
      key.toLowerCase().startsWith("sezione")
    ) {
      // Trova il nodo sezione nel tree
      const findNode = (nodes: TNode[]): TNode | null => {
      for (const n of nodes) {
        if (n.key === key) return n;
        if (n.children) {
        const f = findNode(n.children);
        if (f) return f;
        }
      }
      return null;
      };

      const sectionNode = findNode(tree);

      if (sectionNode) {
      // Raccoglie tutti i discendenti con key che inizia per "field"
      const fieldKeys: string[] = [];
      const collect = (n: TNode) => {
        n.children?.forEach((c) => {
        if ((c.key || "").toLowerCase().startsWith("field")) {
          fieldKeys.push(c.key);
        }
        collect(c);
        });
      };
      collect(sectionNode);

      setOvr((prev: Record<string, Meta>) => {
        const next = { ...prev };
        // Set sezione stessa
        next[key] = { ...(next[key] ?? {}), ...patch };
        // Set visibile false a tutti i field discendenti
        fieldKeys.forEach((fk) => {
        next[fk] = { ...(next[fk] ?? {}), visible: false };
        });
        return next;
      });
      return; // Evita la setOvr standard sotto
      }
    }
    setOvr((prevOvr: Record<string, Meta>) => ({
      ...prevOvr,
      [key]: { ...(prevOvr[key] ?? {}), ...patch },
    }));
  };

  return (
    <Box sx={{ display: "flex", gap: 0, marginLeft: 0, alignItems: "center" }}>
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
        slotProps={{
          paper: { sx: { width: "min(640px, 92vw)", maxHeight: "90vh" } },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "center",
          },
        }}
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
          <Box sx={{ maxHeight: "80vh", overflow: "auto", mt: 1 }}>
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
                      primary={String(r.key).replace(/[-_]/g, " ")}
                      sx={{ mr: 2, wordBreak: "break-all" }}
                    />

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      {(() => {
                        const isAgent = role === "agent";
                        const lockVisibility = isAgent && r.meta._adminVisible;
                        const lockDisabled = isAgent && r.meta._adminDisabled;
                        const faded = (cond: boolean) =>
                          cond ? { opacity: 0.4 } : {};
                        return (
                          <>
                            {(() => {
                              // UI controllo sezione solo per field*
                              const isField = r.key
                                .toLowerCase()
                                .startsWith("field");
                              if (!isField) return null;
                              const isAgent = role === "agent";
                              const lockSezione =
                                isAgent && r.meta._adminsezione;
                              return (
                                <FormControl
                                  size="small"
                                  sx={{
                                    minWidth: 120,
                                    opacity: lockSezione ? 0.4 : 1,
                                  }}
                                >
                                  <InputLabel id={`sezione-label-${r.key}`}>
                                    Sezione
                                  </InputLabel>
                                  <Select
                                    labelId={`sezione-label-${r.key}`}
                                    label="Sezione"
                                    value={r.meta.sezione || ""}
                                    disabled={lockSezione}
                                    onChange={(e) =>
                                      !lockSezione &&
                                      update(r.key, {
                                        sezione: e.target.value || undefined,
                                      })
                                    }
                                  >
                                    <MenuItem value="">
                                      <em>(Default)</em>
                                    </MenuItem>
                                    {sectionKeys.map((sk) => (
                                      <MenuItem key={sk} value={sk}>
                                        {sk.replace(/[-_]/g, " ")}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              );
                            })()}

                            <Tooltip
                              title={r.meta.visible ? "Nascondi" : "Mostra"}
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={lockVisibility}
                                  onClick={() =>
                                    !lockVisibility &&
                                    update(r.key, { visible: !r.meta.visible })
                                  }
                                  sx={faded(lockVisibility)}
                                >
                                  {r.meta.visible ? (
                                    <VisibilityIcon
                                      fontSize="small"
                                      color={
                                        lockVisibility ? undefined : "primary"
                                      }
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
                                  disabled={lockDisabled}
                                  onClick={() =>
                                    !lockDisabled &&
                                    update(r.key, {
                                      disabled: !r.meta.disabled,
                                    })
                                  }
                                  sx={faded(lockDisabled)}
                                >
                                  {r.meta.disabled ? (
                                    <LockIcon
                                      fontSize="small"
                                      color={
                                        lockDisabled ? undefined : "primary"
                                      }
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

                      {/*role === "admin" && (
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
                      )*/}

                      {/* Removed old adminlock indicator for agents per new requirements */}

                      {(() => {
                        const isAgent = role === "agent";
                        const lockOrder = isAgent && r.meta._adminOrder;
                        return (
                          <TextField
                            size="small"
                            type="number"
                            value={
                              Number.isFinite(r.meta.order) ? r.meta.order : 0
                            }
                            onChange={(e) =>
                              !lockOrder &&
                              update(r.key, {
                                order: parseInt(e.target.value || "0", 10),
                              })
                            }
                            sx={{ width: 96, opacity: lockOrder ? 0.4 : 1 }}
                            disabled={lockOrder}
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
        <Snackbar
          open={openSnackbar}
          autoHideDuration={2000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
        />
      </Dialog>
    </Box>
  );
}
