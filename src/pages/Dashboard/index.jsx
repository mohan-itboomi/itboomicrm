import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import { ApiService } from "../../Api/ApiService";
import CustomPageHeader from "../../Component/CustomPageHeader";

const formatMinutes = (minutes) =>
  `${Math.floor((minutes || 0) / 60)}h ${Math.round((minutes || 0) % 60)}m`;
// const getDeliveryStatus = (endDate) => {
//   if (!endDate)
//     return {
//       label: "No delivery date",
//       color: "#64748b",
//       background: "#f1f5f9",
//     };
//   const today = new Date();
//   const delivery = new Date(endDate);
//   today.setHours(0, 0, 0, 0);
//   delivery.setHours(0, 0, 0, 0);
//   const days = Math.round((delivery - today) / 86400000);
//   if (days < 0)
//     return {
//       label: `Delayed by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`,
//       color: "#b42318",
//       background: "#fff1f1",
//     };
//   if (days === 0)
//     return { label: "Due today", color: "#b54708", background: "#fff7e6" };
//   return {
//     label: `${days} day${days === 1 ? "" : "s"} remaining`,
//     color: "#087f5b",
//     background: "#eafbf5",
//   };
// };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () =>
      ApiService.getDashboardSummary()
        .then((response) => setData(response.data?.data || {}))
        .catch(() => setError("Dashboard data could not be loaded."));
    load();
    const refresh = window.setInterval(load, 15000);
    return () => window.clearInterval(refresh);
  }, []);

  if (!data && !error) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
        <CircularProgress />
      </Box>
    );
  }

  const counts = data?.counts || {};
  const cards = [
    [
      "Active employees",
      counts.activeEmployees,
      GroupsRoundedIcon,
      "people online in the workspace",
    ],
    [
      "Onboard projects",
      counts.onboardProjects,
      FolderRoundedIcon,
      "projects ready for delivery tracking",
    ],
    [
      "Open tasks",
      counts.tasks,
      AssignmentRoundedIcon,
      `${counts.overdueTasks || 0} overdue`,
    ],
    [
      "Total bugs",
      counts.bugs,
      BugReportRoundedIcon,
      "reported across projects",
    ],
    [
      "Tracked today",
      formatMinutes(data?.workingHours?.taskMinutes),
      AccessTimeRoundedIcon,
      `${counts.activeTimers || 0} active timers`,
    ],
  ];
  const statuses = data?.taskStatus || [];
  const maxProjectTime = Math.max(
    ...(data?.projectTime || []).map((item) => item.minutes || 0),
    1,
  );
  const sessions = data?.activeWork || [];
  const taskBreakdown = (data?.taskBreakdown || []).reduce((result, item) => {
    const category = item._id?.category;
    const status = item._id?.status;
    if (category === "Project Implementation") result.implementation += item.count;
    if (status === "Testing") result.testing += item.count;
    if (category === "Bug Fixing" && ["Completed", "Testing"].includes(status)) result.bugFixed += item.count;
    return result;
  }, { implementation: 0, testing: 0, bugFixed: 0 });
  const chartTotal = Object.values(taskBreakdown).reduce((sum, value) => sum + value, 0) || 1;
  const chartGradient = `conic-gradient(#1976d2 0 ${(taskBreakdown.implementation / chartTotal) * 360}deg, #ed6c02 ${(taskBreakdown.implementation / chartTotal) * 360}deg ${((taskBreakdown.implementation + taskBreakdown.testing) / chartTotal) * 360}deg, #d32f2f ${((taskBreakdown.implementation + taskBreakdown.testing) / chartTotal) * 360}deg 360deg)`;
  const activeWork = (data?.employeeDirectory || []).flatMap((employee) => {
    const employeeSessions = sessions.filter(
      (item) => String(item.employeeId) === String(employee._id),
    );
    if (!employeeSessions.length) {
      return [{
        ...employee,
        _id: employee._id,
        employeeName: employee.name || employee.email,
        workStatus: "Unassigned",
      }];
    }
    return employeeSessions.map((session) => ({
      ...employee,
      ...session,
      _id: `${employee._id}-${session._id}`,
      employeeName: employee.name || employee.email,
      workStatus: session.status,
    }));
  });

  return (
    <Stack spacing={3}>
      <CustomPageHeader
        title="Good morning"
        subtitle="A live view of people, projects, and work in motion."
      />
      {error && <Alert severity="warning">{error}</Alert>}

      <Grid container spacing={2.5}>
        {cards.map(([label, value, Icon, caption]) => (
          <Grid item xs={12} sm={6} lg={3} key={label}>
            <Card
              sx={{
                height: "100%",
                bgcolor: "#f7f9fc",
                border: "1px solid #e0e6ef",
                borderRadius: 3,
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        mt: 1.1,
                        letterSpacing: "-0.05em",
                        color: "#1d2a39",
                      }}
                    >
                      {value ?? "-"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      bgcolor: "#edf3ff",
                      color: "#1b5fe5",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(27,95,229,0.10)",
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 2, fontSize: "0.76rem" }}
                >
                  {caption}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* <Card
        sx={{
          bgcolor: "#f7f9fc",
          border: "1px solid #e0e6ef",
          borderRadius: 3,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={800}>
            Onboard projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Delivery schedule for projects currently onboarded.
          </Typography>
          {(data?.onboardProjects || []).length ? (
            <Stack spacing={1.2}>
              {data.onboardProjects.map((project) => {
                const delivery = getDeliveryStatus(project.endDate);
                return (
                  <Stack
                    key={project._id}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      p: 1.4,
                      bgcolor: "#fff",
                      border: "1px solid #e7edf4",
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={750}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery:{" "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "Not set"}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: delivery.color,
                        bgcolor: delivery.background,
                        p: 0.7,
                        borderRadius: 2,
                        fontWeight: 750,
                      }}
                    >
                      {delivery.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No onboard projects found.
            </Typography>
          )}
        </CardContent>
      </Card> */}

      <Card
        sx={{
          bgcolor: "#f7f9fc",
          border: "1px solid #e0e6ef",
          borderRadius: 3,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.7 }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ color: "#1d2a39" }}>
              People working now
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeWork.length} active
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.2 }}>
            See who started a task and what they are working on.
          </Typography>
          {activeWork.length ? (
            <Stack spacing={1.2}>
              {activeWork.map((item) => {
                const isRunning = item.workStatus === "Running";
                const isPaused = item.workStatus === "Paused";
                const isBugFixing = item.taskCategory === "Bug Fixing";
                const cardColor = isBugFixing
                  ? "#fff1f2"
                  : isRunning ? "#eef6f1" : "#fff8e1";
                const borderColor = isBugFixing
                  ? "#f3b6bd"
                  : isRunning ? "#d8ebdf" : "#f3df9b";
                return (
                  <Stack
                    key={item._id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{
                      p: 1.3,
                      bgcolor: cardColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 2,
                    }}
                  >
                    <PlayCircleOutlineRoundedIcon
                      sx={{ color: isBugFixing ? "#d32f2f" : isRunning ? "#2e7d32" : "#b7791f" }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {item.employeeName || "Unknown employee"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {item.taskTitle || "No task currently assigned"}
                        {item.projectName ? ` · ${item.projectName}` : ""}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isBugFixing ? "#d32f2f" : isRunning ? "#2e7d32" : "#b7791f",
                        fontWeight: 700,
                      }}
                    >
                      {isRunning ? "Working" : isPaused ? "Paused" : "No task"}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No active employees found.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #e0e6ef", borderRadius: 3, boxShadow: "none" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={800}>All projects work summary</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Implementation, testing, and fixed bug tasks across all projects.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <Box sx={{ width: 170, height: 170, borderRadius: "50%", background: chartGradient, display: "grid", placeItems: "center" }}>
              <Box sx={{ width: 92, height: 92, borderRadius: "50%", bgcolor: "background.paper", display: "grid", placeItems: "center" }}>
                <Typography fontWeight={800}>{chartTotal === 1 && !Object.values(taskBreakdown).some(Boolean) ? 0 : chartTotal}</Typography>
              </Box>
            </Box>
            <Stack spacing={1}>
              {[['Project Implementation', taskBreakdown.implementation, '#1976d2'], ['Testing', taskBreakdown.testing, '#ed6c02'], ['Bug Fixed', taskBreakdown.bugFixed, '#d32f2f']].map(([label, value, color]) => (
                <Stack direction="row" spacing={1} alignItems="center" key={label}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color }} />
                  <Typography>{label}: <b>{value}</b></Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        sx={{
          bgcolor: "#f7f9fc",
          border: "1px solid #e0e6ef",
          borderRadius: 3,
          boxShadow: "none",
        }}
      >
        {/* <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={800}>
            Onboard projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Delivery schedule for projects currently onboarded.
          </Typography>
          {(data?.onboardProjects || []).length ? (
            <Stack spacing={1.2}>
              {data.onboardProjects.map((project) => {
                const delivery = getDeliveryStatus(project.endDate);
                return (
                  <Stack
                    key={project._id}
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      p: 1.4,
                      bgcolor: "#fff",
                      border: "1px solid #e7edf4",
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={750}>{project.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Delivery:{" "}
                        {project.endDate
                          ? new Date(project.endDate).toLocaleDateString()
                          : "Not set"}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: delivery.color,
                        bgcolor: delivery.background,
                        p: 0.7,
                        borderRadius: 2,
                        fontWeight: 750,
                      }}
                    >
                      {delivery.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Typography color="text.secondary">
              No onboard projects found.
            </Typography>
          )}
        </CardContent> */}
      </Card>

      <Card
        sx={{
          bgcolor: "#f7f9fc",
          border: "1px solid #e0e6ef",
          borderRadius: 3,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#1d2a39" }}>
            Bugs by project
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Find which projects need the most retesting.
          </Typography>
          <Stack spacing={1.2}>
            {(data?.bugsByProject || []).length ? (
              data.bugsByProject.map((item) => (
                <Stack
                  key={item._id}
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    p: 1.2,
                    bgcolor: "#fff1f1",
                    border: "1px solid #f6dada",
                    borderRadius: 2,
                  }}
                >
                  <Typography>{item.name || "Unknown project"}</Typography>
                  <Typography fontWeight={800} color="error.main">
                    {item.count}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">
                No bugs reported yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              bgcolor: "#f7f9fc",
              border: "1px solid #e0e6ef",
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: "#1d2a39" }}
              >
                Project time today
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, mt: 0.7 }}
              >
                Completed work sessions by project.
              </Typography>

              <Stack spacing={2.2}>
                {(data?.projectTime || []).length ? (
                  data.projectTime.map((item) => (
                    <Box key={item._id}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mb: 0.8 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "#2f3d4f", fontWeight: 500 }}
                        >
                          {item.name || "Unassigned project"}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ color: "#1d2a39" }}
                        >
                          {formatMinutes(item.minutes)}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          ((item.minutes || 0) / maxProjectTime) * 100,
                        )}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: "#e7ecf3",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg, #6ea8fe 0%, #3b82f6 100%)",
                          },
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No tracked project time yet.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              bgcolor: "#f7f9fc",
              border: "1px solid #e0e6ef",
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{ color: "#1d2a39" }}
              >
                Task flow
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5, mt: 0.7 }}
              >
                Current task distribution.
              </Typography>

              <Stack spacing={1.3}>
                {statuses.map((item) => (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    key={item._id}
                    sx={{
                      p: 1.3,
                      bgcolor: "#f1f4f8",
                      borderRadius: 2,
                      border: "1px solid #e7edf4",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "#46556d" }}>
                      {item._id}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={800}
                      sx={{ color: "#1d2a39" }}
                    >
                      {item.count}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
