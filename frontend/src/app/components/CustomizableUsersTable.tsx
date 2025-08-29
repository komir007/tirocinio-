"use client";
import React, { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./Authcontext";
import { useDebounce } from "./hooks/useDebounce";
import { CustomizableGrid } from "./Customization/components/CustomizableGrid";
import { useUserCustomization } from "./Customization/hooks/useUsercustomization";
import { DEFAULT_GRID_CONFIGS } from "./Customization/config/defaultGridConfigs"; // CORRETTO: rimosso /forms/
import { GridColumn } from "./Customization/types/customization.types";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Settings as SettingsIcon } from '@mui/icons-material/Settings';

interface UserRow {
  id: string | number;
  name: string;
  role: string;
  email: string;
  createdBy: string;
  data_di_creazione: string;
}

const formatDateOnly = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
};

// Componente per le azioni della riga
const UserRowActions = memo(({ 
  user, 
  onEdit, 
  onDelete 
}: {
  user: UserRow;
  onEdit: (user: UserRow) => void;
  onDelete: (user: UserRow) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(user);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(user);
    handleMenuClose();
  };

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        size="small"
        sx={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 2,
          p: 0.5,
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 2,
            p: 1,
            minWidth: 180,
          },
        }}
        transformOrigin={{
          horizontal: "right",
          vertical: "top",
        }}
        anchorOrigin={{
          horizontal: "right",
          vertical: "bottom",
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Modifica
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Elimina
        </MenuItem>
      </Menu>
    </>
  );
});

UserRowActions.displayName = 'UserRowActions';

export default function CustomizableUsersTable() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const isAgent = authContext?.user?.role?.toLowerCase() === "agent";
  
  // Customization hooks
  const {
    getUsersGridConfig,
    updateUsersGridCustomization,
    loading: customizationLoading
  } = useUserCustomization();

  // State per i dati degli utenti
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Configurazione colonne
  const gridColumns = useMemo(() => {
    const baseColumns = DEFAULT_GRID_CONFIGS['users-table']?.columns || []; // CORRETTO: gestione null/undefined
    
    // Filtra le colonne per gli agenti (rimuovi role)
    const filteredColumns = isAgent 
      ? baseColumns.filter(column => column.id !== 'role')
      : baseColumns;
    
    // Aggiungi render personalizzati
    return filteredColumns.map(column => ({
      ...column,
      render: (value: any, row: UserRow) => {
        switch (column.id) {
          case 'name':
            return (
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 36, height: 36, mr: 1 }}>
                  {row.name?.slice(0, 2).toUpperCase() || '??'} {/* CORRETTO: gestione caso name undefined */}
                </Avatar>
                {value || ''} {/* CORRETTO: gestione caso value undefined */}
              </Box>
            );
          case 'data_di_creazione':
            return formatDateOnly(value);
          default:
            return value || ''; // CORRETTO: gestione caso value undefined
        }
      }
    }));
  }, [isAgent]);

  // Carica utenti
  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Errore nel caricamento utenti');
      
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []); // CORRETTO: assicurati che data sia un array
    } catch (error) {
      console.error('Errore:', error);
      setSnackbar({
        open: true,
        message: 'Errore nel caricamento degli utenti',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filtro dati
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    
    const term = debouncedSearchTerm.toLowerCase();
    return users.filter(user =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term) // CORRETTO: gestione campi undefined
    );
  }, [users, debouncedSearchTerm]);

  // Handlers
  const handleEditUser = useCallback((user: UserRow) => {
    const params = new URLSearchParams({
      id: String(user.id),
      name: user.name || '',
      role: user.role || '',
      email: user.email || '',
      data_di_creazione: user.data_di_creazione || '',
    }).toString();
    router.push(`/user/edit_user?page=edit&${params}`);
  }, [router]);

  const handleDeleteUser = useCallback(async (user: UserRow) => {
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) throw new Error('Errore nell\'eliminazione');

      setSnackbar({
        open: true,
        message: 'Utente eliminato con successo',
        severity: 'success'
      });
      
      // Ricarica la lista
      loadUsers();
    } catch (error) {
      console.error('Errore:', error);
      setSnackbar({
        open: true,
        message: 'Errore nell\'eliminazione dell\'utente',
        severity: 'error'
      });
    }
  }, [loadUsers]);

  const handleAddUser = useCallback(() => {
    router.push('/user/registration');
  }, [router]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Render azioni per ogni riga (memoized con dipendenze corrette)
  const renderActions = useCallback((row: UserRow) => (
    <UserRowActions
      user={row}
      onEdit={handleEditUser}
      onDelete={handleDeleteUser}
    />
  ), [handleEditUser, handleDeleteUser]);

  if (customizationLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
        Caricamento configurazione...
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ maxWidth: "100vw", pt: 2, px: 1, borderRadius: 4 }}>
        {/* Header con ricerca, pulsante aggiungi e settings */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} px={1}>
          <Box display="flex" alignItems="center" flex={1}>
            <TextField
              label="Cerca utente"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{
                flex: 1,
                mr: 2,
                maxWidth: "100%",
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <Button

              variant="contained"
              color="primary"
              onClick={handleAddUser}
              sx={{ borderRadius: 2, mr: 1 }}
              startIcon={<AddIcon />}
            >
              Aggiungi utente
            </Button>
          </Box>
        </Box>

        {/* Griglia customizzabile */}
        <CustomizableGrid
          gridId="users-table"
          columns={gridColumns}
          data={filteredData}
          customization={getUsersGridConfig() || {}} // CORRETTO: gestione null
          onCustomizationChange={updateUsersGridCustomization}
          loading={loading}
          actions={renderActions}
          // hideHeader={false} // RIMOSSO: non necessario se default è false
        />
      </Paper>

      {/* Snackbar per notifiche */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
