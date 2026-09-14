import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { ApiService } from "../../Api/ApiService";
import CustomDropdown from "../../Component/CustomDropdown";
import CustomDatePicker from "../../Component/CustomDatePicker";
import CustomTable from "../../Component/CustomTable";

const formatMinutes = minutes => `${Math.floor((minutes || 0) / 60)}h ${Math.round((minutes || 0) % 60)}m`;
const formatDateTime = value => value ? new Date(value).toLocaleString() : "-";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [paging, setPaging] = useState({ page: 1, totalPages: 1, total: 0 });
  const [bugAnalytics, setBugAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "", projectId: "", from: "", to: "", page: 1, limit: 20 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const role = String(JSON.parse(localStorage.getItem("adminUser") || "{}").role || "employee").toLowerCase();
  const canFilterAll = ["admin", "project-coordinator", "team-lead"].includes(role);
  useEffect(() => {
    if (!canFilterAll) return;
    Promise.all([ApiService.getEmployeeDropdown(), ApiService.getProjects({ limit: 100 })])
      .then(([employeeResponse, projectResponse]) => {
        const employeeData = employeeResponse.data?.data || employeeResponse.data || [];
        const projectData = projectResponse.data?.data || projectResponse.data || [];
        setEmployees((Array.isArray(employeeData) ? employeeData : []).map(item => ({ value: item.value || item._id, label: item.label || item.name || item.email })));
        setProjects((projectData.items || projectData).map(item => ({ value: item._id, label: item.name })));
      })
      .catch(() => { setEmployees([]); setProjects([]); });
  }, [canFilterAll]);
  useEffect(() => {
    setLoading(true);
    Promise.all([ApiService.getTimesheets(filters), ApiService.getBugAnalytics({ projectId: filters.projectId })])
      .then(([timesheetResponse, bugResponse]) => { const result = timesheetResponse.data?.data || {}; setRows(result.items || []); setPaging(result); setBugAnalytics(bugResponse.data?.data || null); })
      .catch(() => setError("Reports could not be loaded."))
      .finally(() => setLoading(false));
  }, [filters.employeeId, filters.projectId, filters.from, filters.to, filters.page]);
  const download = async () => {
    const response = await ApiService.exportTimesheets(filters);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a"); link.href = url; link.download = "timesheet.csv"; link.click(); URL.revokeObjectURL(url);
  };
  const projectTotals = Object.values(rows.reduce((result, row) => {
    const key = row.projectId?._id || row.projectId?.name || "unknown";
    const item = result[key] || { name: row.projectId?.name || "Unknown project", implementation: 0, testing: 0, bugFixing: 0 };
    const minutes = Number(row.durationMinutes) || 0;
    if (row.taskId?.category === "Bug Fixing") item.bugFixing += minutes;
    else if (row.taskId?.category === "Testing" || row.taskId?.status === "Testing") item.testing += minutes;
    else item.implementation += minutes;
    result[key] = item;
    return result;
  }, {}));
  projectTotals.forEach(item => { item.total = item.implementation + item.testing + item.bugFixing; });
  return <Stack spacing={3}>
    <Card><CardContent><Typography variant="h6" fontWeight={850}>Project total work hours</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Implementation, testing, bug fixing, and total tracked time.</Typography><CustomTable columns={[{ field: "name", headerName: "Project" }, { field: "implementation", headerName: "Implementation", render: row => formatMinutes(row.implementation) }, { field: "testing", headerName: "Testing", render: row => formatMinutes(row.testing) }, { field: "bugFixing", headerName: "Bug Fixing", render: row => formatMinutes(row.bugFixing) }, { field: "total", headerName: "Total", render: row => <b>{formatMinutes(row.total)}</b> }]} rows={projectTotals} emptyMessage="No project time recorded yet." showSerialNumber={false} /></CardContent></Card>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h4" fontWeight={850}>Reports</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Review tracked work across employees and projects.</Typography></Box><Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={download}>Export CSV</Button></Stack>
    {error && <Alert severity="warning">{error}</Alert>}
    <Card><CardContent><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Box sx={{ flex: 1 }}><CustomDatePicker label="From date" value={filters.from} onChange={value => setFilters(current => ({ ...current, from: value?.format("YYYY-MM-DD") || "", page: 1 }))} /></Box><Box sx={{ flex: 1 }}><CustomDatePicker label="To date" value={filters.to} onChange={value => setFilters(current => ({ ...current, to: value?.format("YYYY-MM-DD") || "", page: 1 }))} /></Box></Stack></CardContent></Card>
    {canFilterAll && <Card><CardContent><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><CustomDropdown label="Employee" name="employeeId" value={filters.employeeId} options={employees} onChange={value => setFilters(current => ({ ...current, employeeId: value }))} placeholder="All employees" /><CustomDropdown label="Project" name="projectId" value={filters.projectId} options={projects} onChange={value => setFilters(current => ({ ...current, projectId: value }))} placeholder="All projects" /></Stack></CardContent></Card>}
    {bugAnalytics && <Card><CardContent><Typography variant="h6" fontWeight={850}>Bug analytics</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Total bugs: {bugAnalytics.total} · Time on bug-linked tasks: {formatMinutes(bugAnalytics.bugWorkMinutes)}</Typography><Stack spacing={1}>{(bugAnalytics.byProject || []).map(item => <Typography key={item._id}>Project <b>{item.name || "Unknown"}</b>: {item.count} bug(s)</Typography>)}{(bugAnalytics.byReporter || []).map(item => <Typography key={`reporter-${item._id}`}>Reported by <b>{item.name || "Unknown"}</b>: {item.count}</Typography>)}{(bugAnalytics.byAssignee || []).map(item => <Typography key={`assignee-${item._id}`}>Assigned to <b>{item.name || "Unknown"}</b>: {item.count}</Typography>)}</Stack></CardContent></Card>}
    <Card><CardContent sx={{ p: 0 }}><CustomTable loading={loading} columns={[{ field: "employeeId", headerName: "Employee", render: row => row.employeeId?.name || "-" }, { field: "taskId", headerName: "Task", render: row => row.taskId?.title || "-", wrap: true }, { field: "projectId", headerName: "Project", render: row => row.projectId?.name || "-" }, { field: "startTime", headerName: "Start time", render: row => formatDateTime(row.startTime || row.startedAt) }, { field: "endTime", headerName: "End time", render: row => formatDateTime(row.endTime || row.endedAt) }, { field: "pauseMinutes", headerName: "Pause time", render: row => formatMinutes(row.pauseMinutes) }, { field: "durationMinutes", headerName: "Duration", render: row => formatMinutes(row.durationMinutes) }, { field: "status", headerName: "Status" }]} rows={rows} totalRows={paging.total} page={filters.page} onPageChange={page => setFilters(current => ({ ...current, page }))} emptyMessage="No timesheet entries yet." /></CardContent></Card>
  </Stack>;
}
