import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { ApiService } from "../../Api/ApiService";
import CustomDropdown from "../../Component/CustomDropdown";

const formatMinutes = minutes => `${Math.floor((minutes || 0) / 60)}h ${Math.round((minutes || 0) % 60)}m`;
const formatDateTime = value => value ? new Date(value).toLocaleString() : "-";

export default function Reports() {
  const [rows, setRows] = useState([]);
  const [bugAnalytics, setBugAnalytics] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ employeeId: "", projectId: "" });
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
      .then(([timesheetResponse, bugResponse]) => { setRows(timesheetResponse.data?.data || []); setBugAnalytics(bugResponse.data?.data || null); })
      .catch(() => setError("Reports could not be loaded."))
      .finally(() => setLoading(false));
  }, [filters.employeeId, filters.projectId]);
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
    else if (row.taskId?.status === "Testing") item.testing += minutes;
    else item.implementation += minutes;
    result[key] = item;
    return result;
  }, {}));
  projectTotals.forEach(item => { item.total = item.implementation + item.testing + item.bugFixing; });
  return <Stack spacing={3}>
    <Card><CardContent><Typography variant="h6" fontWeight={850}>Project total work hours</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Implementation, testing, bug fixing, and total tracked time.</Typography><Box sx={{ overflowX: "auto" }}><Table><TableHead><TableRow><TableCell>Project</TableCell><TableCell>Implementation</TableCell><TableCell>Testing</TableCell><TableCell>Bug Fixing</TableCell><TableCell>Total</TableCell></TableRow></TableHead><TableBody>{projectTotals.length ? projectTotals.map(item => <TableRow key={item.name}><TableCell>{item.name}</TableCell><TableCell>{formatMinutes(item.implementation)}</TableCell><TableCell>{formatMinutes(item.testing)}</TableCell><TableCell sx={{ color: "error.main", fontWeight: 700 }}>{formatMinutes(item.bugFixing)}</TableCell><TableCell><b>{formatMinutes(item.total)}</b></TableCell></TableRow>) : <TableRow><TableCell colSpan={5}>No project time recorded yet.</TableCell></TableRow>}</TableBody></Table></Box></CardContent></Card>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}><Box><Typography variant="h4" fontWeight={850}>Reports</Typography><Typography color="text.secondary" sx={{ mt: .5 }}>Review tracked work across employees and projects.</Typography></Box><Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={download}>Export CSV</Button></Stack>
    {error && <Alert severity="warning">{error}</Alert>}
    {canFilterAll && <Card><CardContent><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><CustomDropdown label="Employee" name="employeeId" value={filters.employeeId} options={employees} onChange={value => setFilters(current => ({ ...current, employeeId: value }))} placeholder="All employees" /><CustomDropdown label="Project" name="projectId" value={filters.projectId} options={projects} onChange={value => setFilters(current => ({ ...current, projectId: value }))} placeholder="All projects" /></Stack></CardContent></Card>}
    {bugAnalytics && <Card><CardContent><Typography variant="h6" fontWeight={850}>Bug analytics</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Total bugs: {bugAnalytics.total} · Time on bug-linked tasks: {formatMinutes(bugAnalytics.bugWorkMinutes)}</Typography><Stack spacing={1}>{(bugAnalytics.byProject || []).map(item => <Typography key={item._id}>Project <b>{item.name || "Unknown"}</b>: {item.count} bug(s)</Typography>)}{(bugAnalytics.byReporter || []).map(item => <Typography key={`reporter-${item._id}`}>Reported by <b>{item.name || "Unknown"}</b>: {item.count}</Typography>)}{(bugAnalytics.byAssignee || []).map(item => <Typography key={`assignee-${item._id}`}>Assigned to <b>{item.name || "Unknown"}</b>: {item.count}</Typography>)}</Stack></CardContent></Card>}
    <Card><CardContent sx={{ p: 0 }}><Box sx={{ overflowX: "auto" }}>{loading ? <CircularProgress sx={{ m: 3 }} /> : <Table><TableHead><TableRow><TableCell>Employee</TableCell><TableCell>Task</TableCell><TableCell>Project</TableCell><TableCell>Start time</TableCell><TableCell>End time</TableCell><TableCell>Pause time</TableCell><TableCell>Duration</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{rows.length ? rows.map(row => <TableRow key={row._id}><TableCell>{row.employeeId?.name || "-"}</TableCell><TableCell>{row.taskId?.title || "-"}</TableCell><TableCell>{row.projectId?.name || "-"}</TableCell><TableCell>{formatDateTime(row.startTime || row.startedAt)}</TableCell><TableCell>{formatDateTime(row.endTime || row.endedAt)}</TableCell><TableCell>{formatMinutes(row.pauseMinutes)}</TableCell><TableCell>{formatMinutes(row.durationMinutes)}</TableCell><TableCell>{row.status}</TableCell></TableRow>) : <TableRow><TableCell colSpan={8}><Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>No timesheet entries yet.</Typography></TableCell></TableRow>}</TableBody></Table>}</Box></CardContent></Card>
  </Stack>;
}
