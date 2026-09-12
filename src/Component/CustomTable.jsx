import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Typography,
  Box,
  Skeleton,
  Select,
  MenuItem,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomToggleSwitch from "./CustomToggleSwitch";
const formatIndianDateTime = (value) => new Date(value).toLocaleString("en-IN");
const theme = { primarycolor: "#006A9D" }; const appTheme = theme;

const INDEX_WIDTH = 50;
const ACTIONS_WIDTH = 150;
const SKELETON_ROW_COUNT = 6;

const getColumnWidthStyles = (column) => {
  if (!column?.width) return {};

  return {
    width: column?.width,
    minWidth: column?.width,
    maxWidth: column?.width,
  };
};

const CustomTable = ({
  columns = [],
  rows = [],
  emptyMessage = "No data found",
  loading,
  showSerialNumber = true,
  serialNumberLabel = "SNO",
  pageSize = 10,
  page: controlledPage,
  totalRows,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [1,2,10, 20, 50, 100],
}) => {
  const globalLoading = useSelector(
    (state) => state?.loading?.pendingRequests > 0,
  );
  const [initialLoading, setInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);
  const isLoading = loading ?? (initialLoading || globalLoading);
  const [page, setPage] = useState(0);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const rowsPerPage = onPageSizeChange ? pageSize : localPageSize;
  const serverPagination = controlledPage !== undefined && Boolean(onPageChange);
  const activePage = serverPagination ? controlledPage - 1 : page;
  const recordCount = serverPagination ? (totalRows ?? rows.length) : rows.length;

  const pageCount = Math.max(1, Math.ceil(recordCount / rowsPerPage));
  const currentPage = Math.min(activePage, pageCount - 1);

  const paginatedRows = serverPagination
    ? rows
    : rows.slice(
        currentPage * rowsPerPage,
        currentPage * rowsPerPage + rowsPerPage,
      );
  const columnCount = columns.length + (showSerialNumber ? 1 : 0);

  const renderCell = (column, row) => {
    if (column?.render) return column?.render?.(row);
    if (column?.type === "toggle") {
      return (
        <CustomToggleSwitch
          checked={
            typeof row?.[column?.field] === "string"
              ? row?.[column?.field]?.toLowerCase() === "active"
              : Boolean(row?.[column?.field])
          }
          label={column?.getLabel?.(row)}
          disabled={!column?.onToggle}
          onChange={(checked) => column?.onToggle?.(row, checked)}
        />
      );
    }
    const value = row?.[column?.field];
    const isIsoDateTime =
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
    return isIsoDateTime ? formatIndianDateTime(value) : value;
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        backgroundColor: "#fff",
      }}
    >
      <TableContainer
        sx={{
          maxHeight: { xs: "none", md: 600 },
          maxWidth: "100%",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Table
            stickyHeader
            sx={{
              minWidth: { xs: 720, md: 900 },
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-stickyHeader": {
                position: { xs: "static", md: "sticky" },
              },
            }}
          >
            {/* ================= HEADER ================= */}
            <TableHead>
              <TableRow>
                {/* INDEX / SERIAL NUMBER */}
                {showSerialNumber && (
                  <TableCell
                    sx={{
                      position: { xs: "static", md: "sticky" },
                      left: { xs: "auto", md: 0 },
                      zIndex: 6,

                      minWidth: INDEX_WIDTH,
                      width: INDEX_WIDTH,
                      maxWidth: INDEX_WIDTH,
                      boxSizing: "border-box",

                      backgroundColor: `${theme?.primarycolor}`,
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "12px",

                      borderBottom: "1px solid #E2E8F0",

                      boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                    }}
                  >
                    {serialNumberLabel}
                  </TableCell>
                )}

                {/* OTHER COLUMNS */}
                {columns.map((column, columnIndex) => {
                  const isFirstColumn = columnIndex === 0;
                  const isActions = column?.field === "actions";

                  return (
                    <TableCell
                      key={column?.field}
                      sx={{
                        backgroundColor:`${theme?.primarycolor}`,
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "12px",

                        borderBottom: "1px solid #E2E8F0",

                        py: 2,

                        whiteSpace: "nowrap",

                        ...getColumnWidthStyles(column),

                        /* ================= FIRST COLUMN ================= */
                        ...(isFirstColumn && {
                          position: { xs: "static", md: "sticky" },

                          left: { xs: "auto", md: showSerialNumber ? INDEX_WIDTH : 0 },

                          zIndex: 5,

                          // Keep the sticky column only as wide as its content.
                          // An explicit `column.width` can still override this.
                          ...(!column?.width && {
                            width: "1%",
                            minWidth: "max-content",
                          }),
                          boxSizing: "border-box",

                          backgroundColor: `${theme?.primarycolor}`,

                          boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                        }),

                        /* ================= ACTIONS ================= */
                        ...(isActions && {
                          position: { xs: "static", md: "sticky" },

                          right: { xs: "auto", md: 0 },

                          zIndex: 5,

                          minWidth: ACTIONS_WIDTH,
                          width: ACTIONS_WIDTH,
                          maxWidth: ACTIONS_WIDTH,
                          boxSizing: "border-box",

                          backgroundColor: "#006A9D",

                          boxShadow: { xs: "none", md: "-4px 0 8px rgba(15, 23, 42, 0.06)" },
                        }),
                      }}
                    >
                      {column?.headerName}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            {/* ================= BODY ================= */}
            <TableBody>
              {/* ================= LOADING ================= */}
              {isLoading ? (
                Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`}>
                    {showSerialNumber && (
                      <TableCell
                        sx={{
                          position: { xs: "static", md: "sticky" },
                          left: { xs: "auto", md: 0 },
                          zIndex: 4,
                          width: INDEX_WIDTH,
                          minWidth: INDEX_WIDTH,
                          maxWidth: INDEX_WIDTH,
                          py: 1.8,
                          backgroundColor: "#FFFFFF",
                          borderBottom: "1px solid #F1F5F9",
                          boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                        }}
                      >
                        <Skeleton variant="text" width={20} />
                      </TableCell>
                    )}
                    {columns.map((column, columnIndex) => {
                      const isFirstColumn = columnIndex === 0;
                      const isActions = column?.field === "actions";

                      return (
                        <TableCell
                          key={`skeleton-${column?.field}`}
                          sx={{
                            py: 1.8,
                            borderBottom: "1px solid #F1F5F9",
                            ...getColumnWidthStyles(column),
                            ...(isFirstColumn && {
                              position: { xs: "static", md: "sticky" },
                              left: { xs: "auto", md: showSerialNumber ? INDEX_WIDTH : 0 },
                              zIndex: 3,
                              ...(!column?.width && {
                                width: "1%",
                                minWidth: "max-content",
                              }),
                              backgroundColor: "#FFFFFF",
                              fontSize:"10px",
                              boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                            }),
                            ...(isActions && {
                              position: { xs: "static", md: "sticky" },
                              right: { xs: "auto", md: 0 },
                              zIndex: 3,
                              width: ACTIONS_WIDTH,
                              minWidth: ACTIONS_WIDTH,
                              maxWidth: ACTIONS_WIDTH,
                              backgroundColor: "#FFFFFF",
                              boxShadow: { xs: "none", md: "-4px 0 8px rgba(15, 23, 42, 0.06)" },
                            }),
                          }}
                        >
                          <Skeleton
                            variant={isActions ? "rounded" : "text"}
                            width={isActions ? 92 : `${55 + ((rowIndex + columnIndex) % 4) * 10}%`}
                            height={isActions ? 30 : 24}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((row, index) => (
                  <TableRow
                    key={row?.id || index}
                    sx={{
                      transition: "0.2s",

                      "&:nth-of-type(even)": {
                        backgroundColor: "#FAFAFA",
                      },

                      "&:hover": {
                        backgroundColor: "#F1F5F9",
                      },
                    }}
                  >
                    {/* ================= INDEX ================= */}
                    {showSerialNumber && (
                      <TableCell
                        sx={{
                          position: { xs: "static", md: "sticky" },

                          left: { xs: "auto", md: 0 },

                          zIndex: 4,

                          minWidth: INDEX_WIDTH,
                          width: INDEX_WIDTH,
                          maxWidth: INDEX_WIDTH,
                          boxSizing: "border-box",

                          color: "#475569",

                          fontSize: "14px",

                          fontWeight: 600,

                          py: 1.8,

                          backgroundColor: "#FFFFFF",

                          borderBottom: "1px solid #F1F5F9",

                          boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                        }}
                      >
                        {currentPage * rowsPerPage + index + 1}
                      </TableCell>
                    )}
                    {columns.map((column, columnIndex) => {
                      const isFirstColumn = columnIndex === 0;

                      const isActions = column?.field === "actions";

                      return (
                        <TableCell
                          key={column?.field}
                          sx={{
                            color: "#475569",

                            fontSize: "12px",

                            py: 1.8,

                            borderBottom: "1px solid #F1F5F9",

                            whiteSpace: "nowrap",

                            ...getColumnWidthStyles(column),

                            /* ================= FIRST COLUMN ================= */
                            ...(isFirstColumn && {
                              position: { xs: "static", md: "sticky" },

                              left: { xs: "auto", md: showSerialNumber ? INDEX_WIDTH : 0 },

                              zIndex: 3,

                              ...(!column?.width && {
                                width: "1%",
                                minWidth: "max-content",
                              }),

                              boxSizing: "border-box",

                              backgroundColor: "#FFFFFF",

                              boxShadow: { xs: "none", md: "4px 0 8px rgba(15, 23, 42, 0.06)" },
                            }),

                            /* ================= ACTIONS ================= */
                            ...(isActions && {
                              position: { xs: "static", md: "sticky" },

                              right: { xs: "auto", md: 0 },

                              zIndex: 3,

                              minWidth: ACTIONS_WIDTH,

                              width: ACTIONS_WIDTH,

                              maxWidth: ACTIONS_WIDTH,

                              boxSizing: "border-box",

                              backgroundColor: "#FFFFFF",

                              boxShadow: { xs: "none", md: "-4px 0 8px rgba(15, 23, 42, 0.06)" },
                            }),
                          }}
                        >
                          {renderCell(column, row)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                /* ================= EMPTY ================= */
                <TableRow>
                  <TableCell colSpan={columnCount} align="center">
                    <Box
                      sx={{
                        py: 5,
                      }}
                    >
                      <Typography color="text.secondary" fontWeight={500}>
                        {emptyMessage}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          borderTop: "1px solid #E2E8F0",
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography color="text.secondary" fontSize="14px">
            Rows per page:
          </Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value);
              if (onPageSizeChange) {
                onPageSizeChange(nextPageSize);
              } else {
                setLocalPageSize(nextPageSize);
                setPage(0);
              }
            }}
            sx={{ minWidth: 72 }}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <Typography color="text.secondary" fontSize="14px">
            {recordCount === 0
              ? "0 records"
              : `${currentPage * rowsPerPage + 1}-${Math.min(
                  (currentPage + 1) * rowsPerPage,
                  recordCount,
                )} of ${recordCount}`}
          </Typography>
        </Box>

        <Pagination
          count={pageCount}
          page={currentPage + 1}
          onChange={(_event, newPage) =>
            serverPagination ? onPageChange(newPage) : setPage(newPage - 1)
          }
          disabled={isLoading || rows.length === 0}
          color="primary"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": {
              color: appTheme.primarycolor,
            },
            "& .MuiPaginationItem-root.Mui-selected": {
              color: "#FFFFFF",
              backgroundColor: appTheme.primarycolor,
              "&:hover": {
                backgroundColor: appTheme.primarycolor,
              },
            },
          }}
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      </Box>
    </Paper>
  );
};

export default CustomTable;
