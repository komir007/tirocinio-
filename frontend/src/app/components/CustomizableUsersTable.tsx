"use client";
import React, { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./Authcontext";
import { useDebounce } from "./hooks/useDebounce";
import { CustomizableGrid } from "./Customization/components/CustomizableGrid";
import { useUserCustomization } from "./Customization/hooks/useUsercustomization";
import { DEFAULT_GRID_CONFIGS } from "./Customization/config/forms/defaultGridConfigs";
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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

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
      <IconButton onClick={handleMenuOpen} size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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
    const baseColumns = DEFAULT_GRID_CONFIGS['users-table'].columns;
    
    // Aggiungi render personalizzati
    return baseColumns.map(column => ({
      ...column,
      render: (value: any, row: UserRow) => {
        switch (column.id) {
          case 'name':
            return (
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 36, height: 36, mr: 1 }}>
                  {row.name.slice(0, 2).toUpperCase()}
                </Avatar>
                {value}
              </Box>
            );
          case 'data_di_creazione':
            return formatDateOnly(value);
          default:
            return value;
        }
      }
    }));
  }, []);

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
      setUsers(data);
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
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }, [users, debouncedSearchTerm]);

  // Handlers
  const handleEditUser = useCallback((user: UserRow) => {
    router.push(`/user/edit_user?email=${encodeURIComponent(user.email)}`);
  }, [router]);

  const handleDeleteUser = useCallback(async (user: UserRow) => {
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/users/${user.email}`,
        {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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

  // Render azioni per ogni riga
  const renderActions = useCallback((row: UserRow) => (
    <UserRowActions
      user={row}
      onEdit={handleEditUser}
      onDelete={handleDeleteUser}
    />
  ), [handleEditUser, handleDeleteUser]);

  if (customizationLoading) {
    return <div>Caricamento configurazione...</div>;
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Header con ricerca e pulsante aggiungi */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          placeholder="Cerca utenti..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Nuovo Utente
        </Button>
      </Box>

      {/* Griglia customizzabile */}
      <CustomizableGrid
        gridId="users-table"
        columns={gridColumns}
        data={filteredData}
        customization={getUsersGridConfig() || undefined}
        onCustomizationChange={updateUsersGridCustomization}
        loading={loading}
        actions={renderActions}
      />

      {/* Snackbar per notifiche */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
