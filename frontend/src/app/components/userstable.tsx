"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../components/Authcontext";
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

type SortOrder = "asc" | "desc";

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

export default function UsersTable() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<UserRow[]>([]);
  const [sortBy, setSortBy] = useState<keyof UserRow>("name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(7);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuRowKey, setMenuRowKey] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string>("");
  const authContext = useContext(AuthContext);
  const userlogged = authContext?.user;
  const router = useRouter();

  useEffect(() => {
    if (authContext && !authContext.user) router.push("/login");
  }, [authContext, router]);

  const isAgent = (role?: string | null) => role?.toLowerCase() === "agent";
  const columns = isAgent(authContext?.user?.role)
    ? allcolumns.filter((col) => col.id !== "role")
    : allcolumns;

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

  useEffect(() => {
    let temp = rows;

    /* filtro per agent: mostra solo utenti creati da lui
    if (authContext?.user?.role?.toLowerCase() === "agent") {
      const agentEmail = authContext.user.email;
      temp = temp.filter(
        (row) =>
          (row.createdBy ?? "").toLowerCase() === agentEmail.toLowerCase()
      );
    }*/

    // filtro ricerca
    temp = temp.filter((row) =>
      row.name
        .replace(/\s/g, "")
        .toLowerCase()
        .includes(search.replace(/\s/g, "").toLowerCase())
    );

    // sorting
    const comparator = (a: UserRow, b: UserRow): number => {
      const key = sortBy;
      if (key === "data_di_creazione") {
        return parseItalianDate(a[key]) - parseItalianDate(b[key]);
      }
      const as = String(a[key] ?? "").toLowerCase();
      const bs = String(b[key] ?? "").toLowerCase();
      return as < bs ? -1 : as > bs ? 1 : 0;
    };
    temp.sort((a, b) =>
      order === "asc" ? comparator(a, b) : -comparator(a, b)
    );
    setFilteredRows(temp);
  }, [rows, search, sortBy, order, authContext]);

  const handleRequestSort = (property: keyof UserRow): void => {
    setOrder((prev) =>
      sortBy === property && prev === "asc" ? "desc" : "asc"
    );
    setSortBy(property);
  };

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    rowKey: string
  ): void => {
    setMenuAnchorEl(e.currentTarget);
    setMenuRowKey(rowKey);
  };
  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
    setMenuRowKey(null);
  };

  const handleDeleteUser = async (user: UserRow): Promise<void> => {
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
  };

  return (
    <Paper sx={{ maxWidth: "100vw", pt: 2, px: 1, borderRadius: 4 }}>
      <Box display="flex" alignItems="center" mb={2} px={1}>
        <TextField
          label="Cerca utente"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                      backgroundColor: "#f5f5f5",
                      cursor: column.id === "email" ? "default" : "pointer",
                    }}
                  >
                    {column.id === "email" ? (
                      <Box>{column.label}</Box>
                    ) : (
                      <TableSortLabel
                        active={true}
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
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.email}>
                    <TableCell sx={{fontWeight: 600}} padding="normal">
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, mr: 1 }}>
                          {row.name.slice(0, 2).toUpperCase()}
                        </Avatar>
                        {row.name}
                      </Box>
                    </TableCell>
                    {!isAgent(authContext?.user?.role) && (
                      <TableCell padding="normal">{row.role}</TableCell>
                    )}
                    <TableCell padding="normal">{row.email}</TableCell>
                    <TableCell padding="normal">
                      {row.data_di_creazione}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, row.email)}
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
                      <Menu
                        anchorEl={menuAnchorEl}
                        open={menuRowKey === row.email}
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
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            const params = new URLSearchParams({
                              id: String(row.id),
                              name: row.name,
                              role: row.role,
                              email: row.email,
                              data_di_creazione: row.data_di_creazione,
                            }).toString();
                            router.push(`/user/edit_user?page=edit&${params}`);
                          }}
                        >
                          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Modifica
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleMenuClose();
                            handleDeleteUser(row);
                          }}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Elimina
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider sx={{ my: 0, px: -1 }} />
        <TablePagination
          rowsPerPageOptions={[7, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
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
