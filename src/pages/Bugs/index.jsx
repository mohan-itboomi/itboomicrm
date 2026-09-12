import CustomTable from "../../Component/CustomTable";
import CustomDropdown from "../../Component/CustomDropdown";
import { Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
import ReusableInput from "../../Component/ReusableInput";
import ReusableButton from "../../Component/ReusableButton";

const fields = [
  "bugCode",
  "title",
  "projectId",
  "taskId",
  "assignedTo",
  "status",
  "severity",
  "startedAt",
  "completedAt",
  "duration",
];
const displayValue = (value) =>
  value && typeof value === "object"
    ? value.name || value.title || value.email || value._id || "—"
    : value || "—";
const formatValue = (field, value, row) => {
  if (["startedAt", "completedAt"].includes(field))
    return value ? new Date(value).toLocaleString() : "—";
  if (field === "duration") {
    if (!row.startedAt || !row.completedAt) return "—";
    const minutes = Math.max(
      0,
      Math.round((new Date(row.completedAt) - new Date(row.startedAt)) / 60000),
    );
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }
  return displayValue(value);
};

export default function Bugs() {
  const dispatch = useDispatch();
  const role = String(
    JSON.parse(localStorage.getItem("adminUser") || "{}").role || "",
  ).toLowerCase();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const load = useCallback(() =>
    ApiService.getBugs({ search, projectId, assignedTo, status, severity }).then((response) => {
      const data = response.data?.data || response.data;
      setRows(data.items || []);
    }),
    [search, projectId, assignedTo, status, severity],
  );

  useEffect(() => {
    Promise.all([ApiService.getProjects(), ApiService.getEmployeeDropdown()])
      .then(([projectResponse, employeeResponse]) => {
        const projectData =
          projectResponse.data?.data || projectResponse.data || [];
        const employeeData =
          employeeResponse.data?.data || employeeResponse.data || [];
        setProjects(
          (projectData.items || projectData).map((item) => ({
            value: item._id,
            label: item.name,
          })),
        );
        setEmployees(
          (Array.isArray(employeeData) ? employeeData : []).map((item) => ({
            value: item.value || item._id,
            label: item.label || item.name || item.email || "Unnamed employee",
          })),
        );
      })
      .catch(() => {
        setProjects([]);
        setEmployees([]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const modal = (record, view = false) =>
    dispatch(
      openModal({
        title: (view ? "View" : record ? "Edit" : "Create") + " Bugs",
        component: view ? "BUGS_VIEW" : "BUGS_FORM",
        props: { resource: "bugs", fields, record, onSaved: load },
      }),
    );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Bugs
          </Typography>
          <Typography color="text.secondary">Manage bugs.</Typography>
        </Box>
        {role === "tester" && (
          <ReusableButton
            title="Create"
            startIcon={<AddIcon />}
            onClick={() => modal()}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(220px, 1.4fr) repeat(4, minmax(160px, 1fr))",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <ReusableInput
          name="bug-search"
		  label="Bug Name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search bugs"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              minHeight: "46px",
            },
          }}
        />
        <CustomDropdown
          label="Project"
          name="projectFilter"
          value={projectId}
          options={projects}
          onChange={setProjectId}
          placeholder="All projects"
        />
        <CustomDropdown
          label="Assigned To"
          name="assignedFilter"
          value={assignedTo}
          options={employees}
          onChange={setAssignedTo}
          placeholder="All assignees"
        />
        <CustomDropdown
          label="Status"
          name="statusFilter"
          value={status}
          options={["Open", "Assigned", "In Progress", "Fixed", "Retest", "Passed", "Rejected", "Closed"].map((value) => ({ value, label: value }))}
          onChange={setStatus}
          placeholder="All statuses"
        />
        <CustomDropdown
          label="Severity"
          name="severityFilter"
          value={severity}
          options={["Low", "Medium", "High", "Critical"].map((value) => ({ value, label: value }))}
          onChange={setSeverity}
          placeholder="All severities"
        />
      </Box>

      <CustomTable
        columns={[
          ...fields.map((field) => ({
            field,
            headerName:
              field === "startedAt"
                ? "Started"
                : field === "completedAt"
                  ? "Completed"
                  : field === "duration"
                    ? "Time Taken"
                    : field,
            render: (row) => formatValue(field, row[field], row),
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
                      await ApiService.deleteRecord("bugs", row._id);
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


