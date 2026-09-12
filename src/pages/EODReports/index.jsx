import CustomTable from "../../Component/CustomTable";
import CustomPageHeader from "../../Component/CustomPageHeader";
import ReusableInput from "../../Component/ReusableInput";
import { Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
const fields = [
  "employeeId",
  "date",
  "completedTasks",
  "inProgressTasks",
  "totalMinutes",
  "blockers",
  "tomorrowPlan",
  "status",
];
const formatMinutes = (minutes) =>
  `${Math.floor((Number(minutes) || 0) / 60)}h ${Math.round((Number(minutes) || 0) % 60)}m`;
export default function EODReports() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const load = useCallback(() =>
    ApiService.getEODReports({ search }).then((r) =>
      setRows((r.data?.data || r.data).items || []),
    ), [search]);
  useEffect(() => { load(); }, [load]);
  const modal = (record, view = false) =>
    dispatch(
      openModal({
        title: (view ? "View" : record ? "Edit" : "Create") + " EOD Reports",
        component: view ? "EOD_REPORTS_VIEW" : "EOD_REPORTS_FORM",
        props: { resource: "eod-reports", fields, record, onSaved: load },
      }),
    );
  return (
    <Box>
      <CustomPageHeader
        title="EODReports"
        subtitle="Manage eodreports."
        buttonText="Create EODReports"
        buttonIcon={<AddIcon />}
        onButtonClick={() => modal()}
      />
      <ReusableInput
        name="search"
        placeholder="Search EODReports"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2, maxWidth: 567 }}
      />
      <CustomTable
        columns={[
          ...fields.map((field) => ({
            field,
            headerName:
              field === "employeeId"
                ? "Employee"
                : field === "completedTasks"
                  ? "Completed Tasks"
                  : field === "inProgressTasks"
                    ? "In-progress Tasks"
                    : field === "totalMinutes"
                      ? "Total Work Time"
                      : field,
            render: (row) => {
              const value = row[field];
              if (field === "totalMinutes") return formatMinutes(value);
              return Array.isArray(value)
                ? value
                    .map(
                      (item) => item?.title || item?.name || item?._id || item,
                    )
                    .join(", ") || "—"
                : value && typeof value === "object"
                  ? value.name || value.email || value._id || "—"
                  : value || "—";
            },
          })),
          {
            field: "actions",
            headerName: "Actions",
            render: (row) => (
              <Box sx={{ display: "flex" }}>
                <IconButton onClick={() => modal(row, true)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton onClick={() => modal(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={async () => {
                    if (confirm("Delete this record?")) {
                      await ApiService.deleteRecord("eod-reports", row._id);
                      load();
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ),
          },
        ]}
        rows={rows}
        emptyMessage="No records found"
        showSerialNumber
      />
    </Box>
  );
}
