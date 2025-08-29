import React, { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
  IconButton,
  Box,
  TableSortLabel,
  Divider,
} from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import { GridColumn, GridCustomization } from "../types/customization.types";
import { GridCustomizationDialog } from "./GridCustomizationDialog";

interface CustomizableGridProps {
  gridId: string;
  columns: GridColumn[];
  data: any[];
  customization?: GridCustomization;
  onCustomizationChange?: (config: GridCustomization) => void;
  loading?: boolean;
  actions?: (row: any) => React.ReactNode;
  hideHeader?: boolean; // Aggiunta questa prop
}

export function CustomizableGrid({
  gridId,
  columns: defaultColumns,
  data,
  customization = {},
  onCustomizationChange,
  loading = false,
  actions,
  hideHeader = false, // Default false per mantenere compatibilità
}: CustomizableGridProps) {
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Applica customizzazioni alle colonne
  const processedColumns = useMemo(() => {
    let columns = [...defaultColumns];

    if (customization.columns) {
      columns = columns
        .map((column) => {
          const customColumn = customization.columns?.find(
            (c) => c.id === column.id
          );
          return {
            ...column,
            order: customColumn?.order ?? column.defaultOrder ?? 0,
            hidden: customColumn?.hidden ?? false,
            width: customColumn?.width ?? column.minWidth,
          };
        })
        .filter((column) => !column.hidden)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return columns;
  }, [defaultColumns, customization.columns]);

  // Applica ordinamento ai dati
  const sortedData = useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue < bValue) {
        return order === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, orderBy, order]);

  // Paginazione
  const rowsPerPage = customization.pageSize || 7;
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleCustomizationSave = (config: GridCustomization) => {
    onCustomizationChange?.(config);
  };

  if (loading) {
    return <Paper sx={{ p: 2, textAlign: "center" }}>Caricamento...</Paper>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header con customizzazione - mostra solo se hideHeader è false */}

      {/* Tabella */}
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
                {processedColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.width }}
                    sortDirection={orderBy === column.id ? order : false}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: "#F4F6F8",
                      cursor: column.sortable === false ? "default" : "pointer",
                      color: "#637381",
                    }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleRequestSort(column.id)}
                        sx={{
                          color: "#637381",
                          fontWeight: 600,
                          "& .MuiTableSortLabel-icon": {
                            color: "#637381 !important",
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      <Box sx={{ color: "#637381" }}>{column.label}</Box>
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: "#F4F6F8",
                      borderTopRightRadius: 12,
                    }}
                  />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={index}
                  sx={{ "& td": { fontWeight: 600 } }}
                >
                  {processedColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      padding="normal"
                    >
                      {column.render
                        ? column.render(row[column.id], row)
                        : row[column.id]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell align="right">{actions(row)}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 0, px: -1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center" px={2} py={1}>
          {!hideHeader && (
            <Box >
              <IconButton
                onClick={() => setCustomizationOpen(true)}
                size="small"
                title="Personalizza griglia"
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          )}
          <TablePagination
            rowsPerPageOptions={[7, 25, 100, 300]}
            component="div"
            count={sortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              const newRowsPerPage = parseInt(e.target.value, 10);
              onCustomizationChange?.({
                ...customization,
                pageSize: newRowsPerPage,
              });
              setPage(0);
            }}
          />
        </Box>
      </Box>

      {/* Dialog customizzazione */}
      <GridCustomizationDialog
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        gridId={gridId}
        columns={defaultColumns}
        currentConfig={customization}
        onSave={handleCustomizationSave}
      />
    </Box>
  );
}
