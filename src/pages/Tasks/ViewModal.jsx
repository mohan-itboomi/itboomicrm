import { Box, Button, Divider, Typography } from "@mui/material";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import { useDispatch } from "react-redux";
import { openModal } from "../../Api/Redux/Reducers/modalSlice";

const fields = ["taskCode", "projectId", "moduleId", "title", "description", "assignedTo", "priority", "status", "estimatedMinutes", "actualMinutes", "dueDate", "completionPercentage", "expectedWork", "startDate", "completedDescription", "challengesNotes", "completedAt"];
const labels = { projectId: "Project", moduleId: "Module", assignedTo: "Assigned To", estimatedMinutes: "Estimated Time", actualMinutes: "Time Taken", completionPercentage: "Completion", completedDescription: "Completed Description", challengesNotes: "Challenges", dueDate: "Due Date", startDate: "Started At", completedAt: "Completed At" };
const valueOf = (value, field) => { if (value && typeof value === "object") return value.name || value.email || value._id || "—"; if (["estimatedMinutes", "actualMinutes"].includes(field)) { const minutes = Number(value) || 0; return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; } if (["dueDate", "startDate", "completedAt"].includes(field)) return value ? new Date(value).toLocaleString() : "—"; if (field === "completionPercentage") return `${value || 0}%`; return value || "—"; };
export default function TasksViewModal({ record }) {
	const dispatch = useDispatch();
	const role = String(JSON.parse(localStorage.getItem("adminUser") || "{}").role || "").toLowerCase();
	const createBug = () => dispatch(openModal({ title: "Create Bug", component: "BUGS_FORM", props: { resource: "bugs", record: { projectId: record?.projectId, taskId: record?._id, status: "Open" } } }));
	return <Box sx={{ p: 1 }}><Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}><Typography variant="h6">Task information</Typography>{role === "tester" && !["Completed", "Cancelled"].includes(record?.status) && <Button size="small" variant="outlined" color="error" startIcon={<BugReportRoundedIcon />} onClick={createBug}>Report bug</Button>}</Box><Divider sx={{ my: 2 }} />{fields.map((field) => <Box key={field} sx={{ display: "grid", gridTemplateColumns: "minmax(150px, 0.45fr) 1fr", gap: 2, py: 1 }}><Typography color="text.secondary" sx={{ fontWeight: 600 }}>{labels[field] || field}</Typography><Typography sx={{ wordBreak: "break-word" }}>{valueOf(record?.[field], field)}</Typography></Box>)}</Box>;
}
