import { useEffect, useState } from "react";
import { Card, CardContent, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { ApiService } from "../../Api/ApiService";

export default function Calendar() {
  const [tasks, setTasks] = useState(null);
  useEffect(() => { ApiService.getTasks({ limit: 100 }).then(response => setTasks(response.data?.data?.items || [])).catch(() => setTasks([])); }, []);
  return <Stack spacing={3}><Stack spacing={.5}><Typography variant="h4" fontWeight={850}>Calendar</Typography><Typography color="text.secondary">Upcoming task deadlines from your assigned work.</Typography></Stack><Card><CardContent><Stack spacing={1.5}>{tasks === null ? <CircularProgress /> : tasks.filter(task => task.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(task => <Stack key={task._id} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ p: 1.5, bgcolor: "#f7f9fc", borderRadius: 1.5 }}><Typography fontWeight={700}>{task.title}</Typography><Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" color="text.secondary">{new Date(task.dueDate).toLocaleDateString()}</Typography><Chip size="small" label={task.status} /></Stack></Stack>)}</Stack></CardContent></Card></Stack>;
}
