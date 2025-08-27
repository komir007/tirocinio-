"use client";
import React, { useContext, useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../components/Authcontext";
import { useDebounce } from "./hooks/useDebounce";
import { useSortedAndFilteredData, SortOrder } from "./hooks/useSortedAndFilteredData";
import { usePerformanceMonitor } from "./hooks/usePerformanceMonitor";
import { useTablePerformance } from "./hooks/useTablePerformance";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Button,
  Divider,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TableSortLabel from "@mui/material/TableSortLabel";
import AddIcon from "@mui/icons-material/Add";

interface UserRow {
  id: string | number;
  name: string;
  role: string;
  email: string;
  createdBy: string;
  data_di_creazione: string;
}

const allcolumns: {
  id: keyof UserRow;
  label: string;
  minWidth: number;
  align?: "left" | "right" | "center";
}[] = [
  { id: "name", label: "Name", minWidth: 50 },
  { id: "role", label: "Role", minWidth: 50 },
  { id: "email", label: "Email", minWidth: 50 },
  { id: "data_di_creazione", label: "Data di Creazione", minWidth: 50 },
];

const formatDateOnly = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("it-IT");
};

const parseItalianDate = (s?: string): number => {
  if (!s) return 0;
  const parts = s.split("/");
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

// Componente memoizzato per le righe della tabella (OTTIMIZZATO)
const UserTableRow = memo(({ 
  row, 
  isAgent, 
  onMenuOpen
}: {
  row: UserRow;
  isAgent: boolean;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, rowKey: string) => void;
}) => {
  const handleMenuClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    onMenuOpen(e, row.email);
  }, [row.email, onMenuOpen]);

  return (
    <TableRow hover role="checkbox" tabIndex={-1} key={row.email}>
      <TableCell sx={{fontWeight: 600}} padding="normal">
        <Box display="flex" alignItems="center">
          <Avatar sx={{ width: 36, height: 36, mr: 1 }}>
            {row.name.slice(0, 2).toUpperCase()}
          </Avatar>
          {row.name}
        </Box>
      </TableCell>
      {!isAgent && (
        <TableCell padding="normal">{row.role}</TableCell>
      )}
      <TableCell padding="normal">{row.email}</TableCell>
      <TableCell padding="normal">
        {row.data_di_creazione}
      </TableCell>
      <TableCell align="right">
        <IconButton
          onClick={handleMenuClick}
          aria-label="more"
          sx={{
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 2,
            p: 0.5,
            ml: 1,
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

UserTableRow.displayName = 'UserTableRow';

// Componente separato per il Menu Globale (render solo quando necessario)
const GlobalUserMenu = memo(({
  anchorEl,
  open,
  onClose,
  selectedRow,
  onEdit,
  onDelete
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedRow: UserRow | null;
  onEdit: (row: UserRow) => void;
  onDelete: (row: UserRow) => void;
}) => {
  const handleEditClick = useCallback(() => {
    if (selectedRow) {
      onClose();
      onEdit(selectedRow);
    }
  }, [selectedRow, onClose, onEdit]);

  const handleDeleteClick = useCallback(() => {
    if (selectedRow) {
      onClose();
      onDelete(selectedRow);
    }
  }, [selectedRow, onClose, onDelete]);

  if (!open || !selectedRow) return null;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
      <MenuItem onClick={handleEditClick}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} /> Modifica
      </MenuItem>
      <MenuItem
        onClick={handleDeleteClick}
        sx={{ color: "error.main" }}
      >
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Elimina
      </MenuItem>
    </Menu>
  );
});

GlobalUserMenu.displayName = 'GlobalUserMenu';

// Componente memoizzato per la barra di ricerca
const SearchBar = memo(({ 
  search, 
  onSearchChange 
}: { 
  search: string; 
  onSearchChange: (value: string) => void; 
}) => {
  return (
    <Box display="flex" alignItems="center" mb={2} px={1}>
      <TextField
        label="Cerca utente"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          flex: 1,
          mr: 2,
          "& .MuiOutlinedInput-root": { borderRadius: 2 },
        }}
      />
      <Button
        component={Link}
        href="/user/registration"
        variant="contained"
        color="primary"
        sx={{ borderRadius: 2 }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Aggiungi utente
      </Button>
    </Box>
  );
});

SearchBar.displayName = 'SearchBar';

// Componente per mostrare info sulle performance (solo per dataset grandi)
const PerformanceInfo = memo(({ 
  stats, 
  isVisible 
}: { 
  stats: any; 
  isVisible: boolean; 
}) => {
  if ( !isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <Box 
      sx={{ 
        p: 1, 
        mb: 1, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        fontSize: '0.75rem',
        color: '#666'
      }}
    >
      📊 Performance: {stats.totalItems} items, Page {stats.currentPage}/{stats.totalPages}, 
      Optimization: {stats.renderOptimization}
    </Box>
  );
});

PerformanceInfo.displayName = 'PerformanceInfo';

export default function UsersTable() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [sortBy, setSortBy] = useState<keyof UserRow>("name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(7);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState<UserRow | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const authContext = useContext(AuthContext);
  const userlogged = authContext?.user;
  const router = useRouter();

  // Monitoraggio performance (solo in development)
  usePerformanceMonitor('UsersTable', [rows.length, search, sortBy, order, page]);

  // Utilizza il custom hook per il debounce
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (authContext && !authContext.user) router.push("/login");
  }, [authContext, router]);

  const isAgent = (role?: string | null) => role?.toLowerCase() === "agent";
  
  // Memoizza le colonne per evitare ricreazioni
  const columns = useMemo(() => {
    return isAgent(authContext?.user?.role)
      ? allcolumns.filter((col) => col.id !== "role")
      : allcolumns;
  }, [authContext?.user?.role]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
          }/users/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Errore nel recupero utenti");
        const data = await res.json();
        // annotate u as any because shape comes from external API
        setRows(
          (data as any[]).map((u: any) => ({
            id: u.id,
            name: u.name ?? "",
            role: u.role ?? "",
            email: u.email ?? "",
            data_di_creazione: formatDateOnly(u.createdAt),
            createdBy: u.createdBy ?? "",
          }))
        );
      } catch (err) {
        console.error("Errore fetch utenti:", err);
      }
    };
    fetchUsers();
  }, []);

  // Custom comparator per le date italiane
  const customComparator = useCallback((a: UserRow, b: UserRow, key: keyof UserRow): number => {
    if (key === "data_di_creazione") {
      return parseItalianDate(a[key]) - parseItalianDate(b[key]);
    }
    const as = String(a[key] ?? "").toLowerCase();
    const bs = String(b[key] ?? "").toLowerCase();
    return as < bs ? -1 : as > bs ? 1 : 0;
  }, []);

  // Utilizza il custom hook per sorting e filtri
  const filteredAndSortedRows = useSortedAndFilteredData(
    rows,
    debouncedSearch,
    sortBy,
    order,
    ['name', 'email', 'role'], // campi su cui effettuare la ricerca
    customComparator
  );

  // Memoizza le righe visibili per la paginazione
  const visibleRows = useMemo(() => {
    return filteredAndSortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredAndSortedRows, page, rowsPerPage]);

  // Hook per ottimizzazioni avanzate delle performance
  const { stats, isLargeDataset, shouldOptimize } = useTablePerformance(
    filteredAndSortedRows,
    rowsPerPage,
    page
  );

  // Log delle performance per dataset grandi (solo in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isLargeDataset) {
      console.log('📊 Table Performance Stats:', stats);
      if (stats.totalItems > 100) {
        console.warn('⚠️ Large dataset detected. Consider implementing server-side pagination.');
      }
    }
  }, [stats, isLargeDataset]);

  const handleRequestSort = useCallback((property: keyof UserRow): void => {
    const newOrder = sortBy === property && order === "asc" ? "desc" : "asc";
    
    // Debug log per capire cosa succede
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Sort Request:', {
        property,
        currentSortBy: sortBy,
        currentOrder: order,
        newOrder,
        isSameProperty: sortBy === property
      });
    }
    
    setOrder(newOrder);
    setSortBy(property);
  }, [sortBy, order]);

  const handleMenuOpen = useCallback((
    e: React.MouseEvent<HTMLElement>,
    rowKey: string
  ): void => {
    const selectedRow = filteredAndSortedRows.find(row => row.email === rowKey);
    if (selectedRow) {
      setMenuAnchorEl(e.currentTarget);
      setSelectedRowForMenu(selectedRow);
    }
  }, [filteredAndSortedRows]);
  
  const handleMenuClose = useCallback((): void => {
    setMenuAnchorEl(null);
    setSelectedRowForMenu(null);
  }, []);

  const handleEditUser = useCallback((row: UserRow): void => {
    const params = new URLSearchParams({
      id: String(row.id),
      name: row.name,
      role: row.role,
      email: row.email,
      data_di_creazione: row.data_di_creazione,
    }).toString();
    router.push(`/user/edit_user?page=edit&${params}`);
  }, [router]);

  const handleDeleteUser = useCallback(async (user: UserRow): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    //if (!window.confirm(`Sei sicuro di voler eliminare l'utente ${user.name}?`))
    //  return;
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
        }/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Errore nella cancellazione utente");
      setRows((prev) => prev.filter((u) => u.email !== user.email));
      setSnackbarMsg("Utente eliminato correttamente");
      setSnackbarOpen(true);
    } catch (err) {
      alert("Errore durante la cancellazione utente");
      console.error(err);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0); // Reset della pagina quando cambia la ricerca
  }, []);

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  }, []);

  return (
    <Paper sx={{ maxWidth: "100vw", pt: 2, px: 1, borderRadius: 4 }}>
      <SearchBar search={search} onSearchChange={handleSearchChange} />
      {/*<PerformanceInfo stats={stats} isVisible={isLargeDataset} />*/}
      <Box display="flex" flexDirection="column" sx={{ width: "100%" }}>
        <TableContainer sx={{ maxHeight: "60vh", overflow: "auto" }}>
          <Table
            stickyHeader
            aria-label="sticky table"
            sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f5f5f5",
                  "& th:first-of-type": {
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  },
                  "& th:last-of-type": {
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  },
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F4F6F8",
                      cursor: column.id === "email" ? "default" : "pointer",
                      color: '#637381', // Colore del testo per tutte le label
                    }}
                  >
                    {column.id === "email" ? (
                      <Box sx={{ color: '#637381' }}>{column.label}</Box>
                    ) : (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                        sx={{
                          color: '#637381',
                          fontWeight: 600,
                          "& .MuiTableSortLabel-icon": { color: '#637381 !important' },
                          
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
                <TableCell
                  sx={{ backgroundColor: "#f5f5f5", borderTopRightRadius: 12 }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row) => (
                <UserTableRow
                  key={row.email}
                  row={row}
                  isAgent={isAgent(authContext?.user?.role)}
                  onMenuOpen={handleMenuOpen}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 0, px: -1 }} />
        <TablePagination
          rowsPerPageOptions={[7, 25, 100, 300, 1000, 10000]}
          component="div"
          count={filteredAndSortedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
        
        {/* Menu Globale - Solo un'istanza per tutta la tabella */}
        <GlobalUserMenu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl && selectedRowForMenu)}
          onClose={handleMenuClose}
          selectedRow={selectedRowForMenu}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Box>
    </Paper>
  );
}