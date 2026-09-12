import { Box, Divider, Typography } from "@mui/material";
const fields = ['employeeId','name','email','phone','role','department','team','teamLead','designation','joiningDate','status'];
const valueOf = (value) => value && typeof value === "object" ? value.name || value._id || "—" : value || "—";
export default function EmployeesViewModal({ record }) { return <Box sx={{ p: 1 }}><Typography variant="h6">Employees information</Typography><Divider sx={{ my: 2 }} />{fields.map((field) => <Box key={field} sx={{ display: "grid", gridTemplateColumns: "minmax(120px, 0.4fr) 1fr", gap: 2, py: 1 }}><Typography color="text.secondary">{field}</Typography><Typography sx={{ wordBreak: "break-word" }}>{valueOf(record?.[field])}</Typography></Box>)}</Box>; }
