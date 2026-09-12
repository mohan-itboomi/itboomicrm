import { Box, Divider, Typography } from "@mui/material";

const fields = ["date", "completedTasks", "inProgressTasks", "blockers", "tomorrowPlan", "totalMinutes", "status"];
const labels = { completedTasks: "Completed Tasks", inProgressTasks: "In-progress Tasks", tomorrowPlan: "Tomorrow's Plan", totalMinutes: "Total Minutes" };
const valueOf = (value, field) => {
	if (Array.isArray(value)) return value.map((item) => item?.title || item?.name || item?._id || item).join(", ") || "—";
	if (field === "date" && value) return new Date(value).toLocaleDateString();
	return value && typeof value === "object" ? value.name || value._id || "—" : value || "—";
};

export default function EODReportsViewModal({ record }) {
	return <Box sx={{ p: 1 }}><Typography variant="h6">EOD Report Information</Typography><Divider sx={{ my: 2 }} />{fields.map((field) => <Box key={field} sx={{ display: "grid", gridTemplateColumns: "minmax(120px, 0.4fr) 1fr", gap: 2, py: 1 }}><Typography color="text.secondary">{labels[field] || field}</Typography><Typography sx={{ wordBreak: "break-word" }}>{valueOf(record?.[field], field)}</Typography></Box>)}</Box>;
}
