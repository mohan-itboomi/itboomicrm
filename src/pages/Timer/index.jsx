import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { ApiService } from "../../Api/ApiService";

export default function TimerPage() {
  const [tasks, setTasks] = useState([]);
  const [pausedSessions, setPausedSessions] = useState([]);
  const [employeeSessions, setEmployeeSessions] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [timer, setTimer] = useState(null);
  const [lastSession, setLastSession] = useState(null);
  const [pauseNote, setPauseNote] = useState("");
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completionDescription, setCompletionDescription] = useState("");
  const [challengesNotes, setChallengesNotes] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const role = String(
    JSON.parse(localStorage.getItem("adminUser") || "{}").role || "employee",
  ).toLowerCase();
  const canViewEmployeeSessions = [
    "admin",
    "team-lead",
    "project-coordinator",
  ].includes(role);
  const load = useCallback(async () => {
    try {
      const [taskResponse, timerResponse, pausedResponse, overviewResponse] =
        await Promise.all([
          ApiService.getTasks({ limit: 100 }),
          ApiService.getCurrentTimer(),
          ApiService.getPausedTimers(),
          canViewEmployeeSessions
            ? ApiService.getTimerOverview()
            : Promise.resolve(null),
        ]);
      setTasks(taskResponse.data?.data?.items || []);
      setTimer(timerResponse.data?.data || null);
      setPausedSessions(pausedResponse.data?.data || []);
      setEmployeeSessions(overviewResponse?.data?.data || []);
    } catch {
      setError("Timer data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [canViewEmployeeSessions]);
  useEffect(() => {
    const request = window.setTimeout(load, 0);
    return () => window.clearTimeout(request);
  }, [load]);
  useEffect(() => {
    if (!timer && !employeeSessions.length) return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [timer, employeeSessions.length]);
  const action = async (callback) => {
    setError("");
    try {
      const response = await callback();
      if (response?.data?.data?.status === "Completed")
        setLastSession(response.data.data);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Timer action failed.");
    }
  };
  const completeTask = async () => {
    if (!activeTask?._id || !completionDescription.trim()) return;
    setError("");
    try {
      const response = await ApiService.completeTimer(activeTask._id, {
        completedDescription: completionDescription.trim(),
        challengesNotes: challengesNotes.trim(),
      });
      if (response.data?.data?.session)
        setLastSession(response.data.data.session);
      setCompleteOpen(false);
      setCompletionDescription("");
      setChallengesNotes("");
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Task could not be completed.",
      );
    }
  };
  if (loading) return <CircularProgress />;
  const activeTask = timer?.session?.taskId;
  const startedAt = timer?.session?.startedAt || timer?.session?.startTime;
  const openPauseSeconds = timer?.pauseSession
    ? Math.max(
        0,
        Math.floor(
          (now - new Date(timer.pauseSession.startTime).getTime()) / 1000,
        ),
      )
    : 0;
  const elapsedSeconds = timer
    ? Math.max(
        0,
        Math.floor((now - new Date(startedAt).getTime()) / 1000) -
          (timer.pausedMinutes || 0) * 60 -
          openPauseSeconds,
      )
    : 0;
  const formatDuration = (totalSeconds) =>
    `${String(Math.floor(totalSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString() : "—";
  const formatMinutes = (minutes) =>
    `${Math.floor((Number(minutes) || 0) / 60)}h ${Math.round((Number(minutes) || 0) % 60)}m`;
  const getEmployeePauseMinutes = pauses => pauses.reduce(
    (total, pause) => total + (Number(pause.durationMinutes) || 0),
    0,
  );
  const getEmployeeRunSeconds = (session, pauses) => {
    const started = new Date(session.startedAt || session.startTime).getTime();
    const openPause = pauses.find(pause => !pause.endTime);
    const end = session.status === "Paused" && openPause
      ? new Date(openPause.startTime).getTime()
      : now;
    return Math.max(0, Math.floor((end - started) / 1000) - getEmployeePauseMinutes(pauses) * 60);
  };
  return (
    <Stack spacing={3}>
      <BoxTitle />
      {error && <Alert severity="error">{error}</Alert>}
      <Card
        sx={{
          border: "1px solid #d9e2ef",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(28,52,84,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3} sx={{ maxWidth: 760 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={800}>
                {timer
                  ? timer.paused
                    ? "Timer paused"
                    : "Timer running"
                  : "Start focused work"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an assigned task, then start tracking your focused work.
              </Typography>
            </Stack>
            {!timer && (
              <FormControl fullWidth>
                <InputLabel id="timer-task-label">Task</InputLabel>
                <Select
                  labelId="timer-task-label"
                  label="Task"
                  value={taskId}
                  onChange={(event) => setTaskId(event.target.value)}
                >
                  {tasks
                    .filter(
                      (task) =>
                        !["Completed", "Cancelled"].includes(task.status),
                    )
                    .map((task) => (
                      <MenuItem key={task._id} value={task._id}>
                        <Stack>
                          <Typography fontWeight={650}>{task.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {task.projectId?.name || "Project not assigned"} ·{" "}
                            {task.status}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            )}
            {timer && (
              <>
                <Typography variant="h2" fontWeight={850}>
                  {formatDuration(elapsedSeconds)}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {activeTask?.title || "Active task"}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Typography variant="body2">
                    Started: {formatDateTime(startedAt)}
                  </Typography>
                  <Typography variant="body2">
                    Current: {formatDateTime(now)}
                  </Typography>
                </Stack>
              </>
            )}
            {timer && !timer.paused && (
              <TextField
                label="Extra time / pause note"
                value={pauseNote}
                onChange={(event) => setPauseNote(event.target.value)}
                placeholder="Why are you pausing?"
                fullWidth
              />
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              {!timer && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  disabled={!taskId}
                  onClick={() => action(() => ApiService.startTimer(taskId))}
                  sx={{
                    minWidth: 150,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Start timer
                </Button>
              )}
              {timer && !timer.paused && (
                <Button
                  variant="outlined"
                  startIcon={<PauseRoundedIcon />}
                  onClick={() =>
                    action(() => {
                      const request = ApiService.pauseTimer(pauseNote);
                      setPauseNote("");
                      return request;
                    })
                  }
                >
                  Pause
                </Button>
              )}
              {timer?.paused && (
                <Button
                  variant="contained"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() =>
                    action(() => ApiService.resumeTimer(timer.session._id))
                  }
                >
                  Resume
                </Button>
              )}
              {timer && (
                <Button
                  color="success"
                  variant="contained"
                  startIcon={<CheckCircleOutlineRoundedIcon />}
                  onClick={() => setCompleteOpen(true)}
                >
                  Complete
                </Button>
              )}
            </Stack>
            {lastSession && (
              <Alert severity="success">
                Task completed. Time taken: {lastSession.durationMinutes || 0}{" "}
                minutes. {formatDateTime(lastSession.startTime)} to{" "}
                {formatDateTime(lastSession.endTime)}.
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
      {!timer && pausedSessions.length > 0 && (
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                Paused tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resume a paused task, or start another task above.
              </Typography>
              {pausedSessions.map((session) => (
                <Stack
                  key={session._id}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                  sx={{ p: 1.5, border: "1px solid #e0e6ef", borderRadius: 2 }}
                >
                  <Box>
                    <Typography fontWeight={700}>
                      {session.taskId?.title || "Paused task"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paused session
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrowRoundedIcon />}
                    onClick={() =>
                      action(() => ApiService.resumeTimer(session._id))
                    }
                  >
                    Resume task
                  </Button>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
      {canViewEmployeeSessions && (
        <Card>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>All employee activity</Typography>
              <Typography variant="body2" color="text.secondary">Active and paused timers across the organization.</Typography>
              {employeeSessions.length ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
                  {employeeSessions.map(({ session, pauses }) => {
                    const isPaused = session.status === "Paused";
                    const runSeconds = getEmployeeRunSeconds(session, pauses);
                    return <Card key={session._id} sx={{ minHeight: 230, border: `1px solid ${isPaused ? "#f2d7a0" : "#cfe5d7"}`, borderRadius: 3, bgcolor: isPaused ? "#fffaf0" : "#f5fbf7", boxShadow: "none" }}>
                      <CardContent sx={{ height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 2 }}>
                        <Stack spacing={0.75}>
                          <Typography variant="overline" sx={{ color: isPaused ? "#a26800" : "#277342", fontWeight: 800, letterSpacing: "0.08em" }}>{isPaused ? "Paused" : "Running"}</Typography>
                          <Typography variant="h6" fontWeight={800} noWrap>{session.employeeId?.name || session.employeeId?.email || "Unknown employee"}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>{session.taskId?.title || "No task"}</Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>{session.projectId?.name || "No project"}</Typography>
                        </Stack>
                        <Stack spacing={0.5}>
                          <Typography variant="h4" fontWeight={850} sx={{ color: isPaused ? "#a26800" : "#277342", fontVariantNumeric: "tabular-nums" }}>{formatDuration(runSeconds)}</Typography>
                          <Typography variant="caption" color="text.secondary">Started {formatDateTime(session.startedAt || session.startTime)}</Typography>
                          <Typography variant="caption" color="text.secondary">Paused {formatMinutes(getEmployeePauseMinutes(pauses))}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>;
                  })}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No employees are currently tracking time.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
      {activeTask && (
        <Typography variant="body2" color="text.secondary">
          The active timer is protected server-side so one employee cannot track
          two tasks at once.
        </Typography>
      )}
      <Dialog
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Complete task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Describe what was completed and mention any difficulty before
              closing this task.
            </Typography>
            <TextField
              label="Completion description"
              value={completionDescription}
              onChange={(event) => setCompletionDescription(event.target.value)}
              multiline
              minRows={3}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Difficulties or challenges"
              value={challengesNotes}
              onChange={(event) => setChallengesNotes(event.target.value)}
              multiline
              minRows={2}
              fullWidth
              placeholder="No difficulties? Leave this blank."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={completeTask}
            disabled={!completionDescription.trim()}
          >
            Complete task
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function BoxTitle() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h4" fontWeight={850} sx={{ color: "#132b57" }}>
        Time tracker
      </Typography>
      <Typography color="text.secondary">
        Track focused work and pauses against an assigned task.
      </Typography>
    </Stack>
  );
}
