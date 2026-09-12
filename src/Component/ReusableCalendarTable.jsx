import dayjs from "dayjs";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Skeleton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const borderColor = "#E2E8F0";

/**
 * Reusable month calendar displayed as a table.
 *
 * `getCellValue` receives (row, day, dayIndex). Use `renderCell` when a cell
 * needs custom UI. Both callbacks receive a Day.js date for `day`.
 */
const ReusableCalendarTable = ({
  month = dayjs(),
  onMonthChange,
  rows = [],
  rowKey = "id",
  rowHeader = "Name",
  getRowLabel = (row) => row?.name,
  getCellValue = () => "",
  renderCell,
  onCellClick,
  loading = false,
  emptyMessage = "No records found",
  minCellWidth = 52,
}) => {
  const activeMonth = dayjs(month).startOf("month");
  const days = Array.from({ length: activeMonth.daysInMonth() }, (_, index) =>
    activeMonth.add(index, "day"),
  );

  const changeMonth = (amount) => {
    onMonthChange?.(activeMonth.add(amount, "month"));
  };

  const stickyCell = {
    position: "sticky",
    left: 0,
    zIndex: 2,
    minWidth: 180,
    maxWidth: 240,
    borderRight: `1px solid ${borderColor}`,
  };

  return (
    <Paper
      sx={{
        overflow: "hidden",
        border: `1px solid ${borderColor}`,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="#1E293B">
          {activeMonth.format("MMMM YYYY")}
        </Typography>
        <Box>
          <Tooltip title="Previous month">
            <span>
              <IconButton
                size="small"
                onClick={() => changeMonth(-1)}
                disabled={!onMonthChange}
                aria-label="Previous month"
              >
                <ChevronLeftIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next month">
            <span>
              <IconButton
                size="small"
                onClick={() => changeMonth(1)}
                disabled={!onMonthChange}
                aria-label="Next month"
              >
                <ChevronRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small" aria-label="Monthly calendar table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...stickyCell,
                  zIndex: 4,
                  backgroundColor: "#F8FAFC",
                  fontWeight: 700,
                }}
              >
                {rowHeader}
              </TableCell>
              {days.map((day) => {
                const isToday = day.isSame(dayjs(), "day");
                const isWeekend = day.day() === 0 || day.day() === 6;
                return (
                  <TableCell
                    key={day.format("YYYY-MM-DD")}
                    align="center"
                    sx={{
                      minWidth: minCellWidth,
                      px: 0.5,
                      py: 1,
                      backgroundColor: isToday
                        ? "#DBEAFE"
                        : isWeekend
                          ? "#F8FAFC"
                          : "#fff",
                      color: isToday ? "#1D4ED8" : "#475569",
                      borderBottom: `1px solid ${borderColor}`,
                    }}
                  >
                    <Typography component="div" variant="caption" fontWeight={600}>
                      {day.format("ddd")}
                    </Typography>
                    <Typography component="div" variant="body2" fontWeight={700}>
                      {day.format("D")}
                    </Typography>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              Array.from({ length: 6 }, (_, rowIndex) => (
                <TableRow key={`calendar-skeleton-${rowIndex}`}>
                  <TableCell
                    sx={{
                      ...stickyCell,
                      backgroundColor: rowIndex % 2 ? "#FAFAFA" : "#fff",
                    }}
                  >
                    <Skeleton variant="text" width={`${55 + (rowIndex % 3) * 12}%`} />
                  </TableCell>
                  {days.map((day) => (
                    <TableCell
                      key={day.format("YYYY-MM-DD")}
                      align="center"
                      sx={{ minWidth: minCellWidth, height: 48, p: 0.5 }}
                    >
                      <Skeleton variant="rounded" width={24} height={20} sx={{ mx: "auto" }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={days.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={row[rowKey] ?? rowIndex} hover>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      ...stickyCell,
                      backgroundColor: rowIndex % 2 ? "#FAFAFA" : "#fff",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    {getRowLabel(row)}
                  </TableCell>
                  {days.map((day, dayIndex) => {
                    const value = getCellValue(row, day, dayIndex);
                    const clickable = Boolean(onCellClick);
                    return (
                      <TableCell
                        key={day.format("YYYY-MM-DD")}
                        align="center"
                        onClick={() => onCellClick?.(row, day, value)}
                        sx={{
                          minWidth: minCellWidth,
                          height: 48,
                          p: 0.5,
                          color: "#475569",
                          cursor: clickable ? "pointer" : "default",
                          borderBottom: `1px solid #F1F5F9`,
                          backgroundColor:
                            day.day() === 0 || day.day() === 6
                              ? "rgba(248, 250, 252, 0.7)"
                              : "inherit",
                          "&:hover": clickable
                            ? { backgroundColor: "#EFF6FF" }
                            : undefined,
                        }}
                      >
                        {renderCell
                          ? renderCell({ row, day, dayIndex, value })
                          : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReusableCalendarTable;
