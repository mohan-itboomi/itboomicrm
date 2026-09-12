import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

import { ApiService } from "../../Api/ApiService";
import CustomPageHeader from "../../Component/CustomPageHeader";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const scopeFields = [
  ["Summary", "summary"],
  ["Objectives", "objectives"],
  ["Deliverables", "deliverables"],
  ["Exclusions", "exclusions"],
  ["Acceptance Criteria", "acceptanceCriteria"],
];

const formatScope = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.join("\n") : "Not provided";
  }

  return value || "Not provided";
};

const getFrdVersions = (project) => {
  if (Array.isArray(project?.frd)) {
    return project.frd;
  }

  if (project?.frd?.content) {
    return [project.frd];
  }

  return [];
};

const formatDate = (date) => {
  if (!date) return "Not set";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "completed":
      return "success";

    case "in progress":
    case "in-progress":
      return "primary";

    case "on hold":
    case "hold":
      return "warning";

    case "cancelled":
    case "canceled":
      return "error";

    case "planned":
    case "not started":
    default:
      return "default";
  }
};

const getPriorityColor = (priority) => {
  switch (String(priority || "").toLowerCase()) {
    case "high":
      return "error";

    case "medium":
      return "warning";

    case "low":
      return "success";

    default:
      return "default";
  }
};

const getPhaseProgress = (phase) => {
  const value = Number(phase?.completionPercentage);

  if (Number.isNaN(value)) return 0;

  return Math.min(100, Math.max(0, value));
};

const getProjectProgress = (project) => {
  const phases = Array.isArray(project?.phases) ? project.phases : [];

  if (!phases.length) return 0;

  const total = phases.reduce((sum, phase) => sum + getPhaseProgress(phase), 0);

  return Math.round(total / phases.length);
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");
};

/* -------------------------------------------------------------------------- */
/* Small reusable UI components                                               */
/* -------------------------------------------------------------------------- */

function InfoItem({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          backgroundColor: "#f4f7fb",
          color: "#52606d",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "#8a96a3",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={750}
          noWrap
          sx={{ color: "#243447" }}
        >
          {value || "Not set"}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1}
      sx={{ mb: 2 }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            backgroundColor: "#eef7fb",
            color: "#1099c6",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#243447" }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      {action}
    </Stack>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export default function ProjectDocuments() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Load projects                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await ApiService.getProjects({
          limit: 100,
        });

        const items = response?.data?.data?.items || [];

        if (!mounted) return;

        setProjects(items);

        if (items.length) {
          const firstProject = items[0];

          setSelectedId(firstProject._id || "");

          const versions = getFrdVersions(firstProject);

          setSelectedVersion(versions[0]?._id || versions[0]?.version || "");
        }
      } catch (err) {
        if (!mounted) return;

        setError("Project documents could not be loaded.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Selected project                                                         */
  /* ------------------------------------------------------------------------ */

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedId),
    [projects, selectedId],
  );

  const frdVersions = useMemo(
    () => getFrdVersions(selectedProject),
    [selectedProject],
  );

  const selectedFrd = useMemo(() => {
    if (!frdVersions.length) return null;

    return (
      frdVersions.find(
        (document) =>
          document?._id === selectedVersion ||
          document?.version === selectedVersion,
      ) || frdVersions[frdVersions.length - 1]
    );
  }, [frdVersions, selectedVersion]);

  const projectProgress = getProjectProgress(selectedProject);

  const phases = Array.isArray(selectedProject?.phases)
    ? selectedProject.phases
    : [];

  /* ------------------------------------------------------------------------ */
  /* Select project                                                           */
  /* ------------------------------------------------------------------------ */

  const handleProjectSelect = (project) => {
    setSelectedId(project?._id || "");

    const versions = getFrdVersions(project);

    setSelectedVersion(versions[0]?._id || versions[0]?.version || "");
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <Stack spacing={3}>
        <CustomPageHeader
          title="FRD & Project Planning"
          subtitle="Manage project requirements, scope, phases and documentation."
        />

        <Card
          sx={{
            border: "1px solid #e7edf3",
            boxShadow: "0 8px 30px rgba(25, 50, 75, 0.05)",
          }}
        >
          <Box
            sx={{
              minHeight: 320,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress size={34} />
              <Typography color="text.secondary">
                Loading projects...
              </Typography>
            </Stack>
          </Box>
        </Card>
      </Stack>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main UI                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <Stack spacing={3}>
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <CustomPageHeader
        title="FRD & Project Planning"
        subtitle="Manage project requirements, scope, phases and delivery timeline."
      />

      {error && <Alert severity="error">{error}</Alert>}

      {!projects.length ? (
        <Card
          sx={{
            border: "1px solid #e7edf3",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ py: 6 }}>
            <Stack alignItems="center" spacing={1}>
              <FolderRoundedIcon
                sx={{
                  fontSize: 52,
                  color: "#c5ced8",
                }}
              />

              <Typography variant="h6" fontWeight={800}>
                No projects available
              </Typography>

              <Typography color="text.secondary">
                Create a project to view its documentation and planning.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5} alignItems="flex-start">
          {/* ================================================================ */}
          {/* PROJECT SIDEBAR                                                  */}
          {/* ================================================================ */}

          <Grid item xs={12} md={3.5}>
            <Card
              sx={{
                border: "1px solid #e5eaf0",
                boxShadow: "0 8px 30px rgba(25, 50, 75, 0.05)",
                overflow: "hidden",
                position: { md: "sticky" },
                top: { md: 20 },
              }}
            >
              {/* Sidebar header */}

              <Box
                sx={{
                  px: 2,
                  py: 2,
                  background:
                    "linear-gradient(135deg, #f7fbfd 0%, #eef8fb 100%)",
                  borderBottom: "1px solid #e5edf2",
                }}
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      backgroundColor: "#ffffff",
                      color: "#e4a628",
                      boxShadow: "0 4px 12px rgba(0,0,0,.05)",
                    }}
                  >
                    <FolderRoundedIcon />
                  </Box>

                  <Box>
                    <Typography fontWeight={850}>Project Folders</Typography>

                    <Typography variant="caption" color="text.secondary">
                      {projects.length} project
                      {projects.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Projects */}

              <Stack spacing={1} sx={{ p: 1.25 }}>
                {projects.map((project) => {
                  const active = selectedId === project._id;
                  const progress = getProjectProgress(project);

                  return (
                    <Card
                      key={project._id}
                      onClick={() => handleProjectSelect(project)}
                      sx={{
                        cursor: "pointer",
                        border: active
                          ? "1px solid #1099c6"
                          : "1px solid transparent",
                        backgroundColor: active ? "#f1fafd" : "#ffffff",
                        boxShadow: "none",
                        borderRadius: 2.5,
                        transition: "all .2s ease",

                        "&:hover": {
                          backgroundColor: "#f6fafc",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 1.5,
                          "&:last-child": {
                            pb: 1.5,
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.2}>
                          <Box
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 2,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: active ? "#dff3fa" : "#f5f7fa",
                              color: "#e3a52a",
                            }}
                          >
                            <FolderRoundedIcon />
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              fontWeight={800}
                              noWrap
                              sx={{ color: "#243447" }}
                            >
                              {project.name || "Unnamed Project"}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              noWrap
                            >
                              {project.projectCode || "No project code"}
                            </Typography>

                            {/* <Box sx={{ mt: 1 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ mb: 0.5 }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Progress
                                </Typography>

                                <Typography variant="caption" fontWeight={700}>
                                  {progress}%
                                </Typography>
                              </Stack>

                              <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                  height: 5,
                                  borderRadius: 5,
                                  backgroundColor: "#e9eef3",
                                  "& .MuiLinearProgress-bar": {
                                    borderRadius: 5,
                                  },
                                }}
                              />
                            </Box> */}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Card>
          </Grid>

          {/* ================================================================ */}
          {/* PROJECT CONTENT                                                  */}
          {/* ================================================================ */}

          <Grid item xs={12} md={8.5}>
            {selectedProject && (
              <Stack spacing={2.5}>
                {/* ========================================================== */}
                {/* PROJECT HERO                                                */}
                {/* ========================================================== */}

                <Card
                  sx={{
                    border: "1px solid #e5eaf0",
                    boxShadow: "0 10px 35px rgba(25, 50, 75, 0.06)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 2, sm: 3 },
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f4fbfd 100%)",
                    }}
                  >
                    <Stack spacing={2.5}>
                      {/* Title */}

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        spacing={2}
                      >
                        <Stack direction="row" spacing={1.5}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2.5,
                              display: "grid",
                              placeItems: "center",
                              background:
                                "linear-gradient(135deg, #1099c6, #087ca2)",
                              color: "#ffffff",
                              fontSize: 22,
                              fontWeight: 900,
                            }}
                          >
                            {getInitials(selectedProject.name)}
                          </Box>

                          <Box>
                            <Typography
                              variant="h4"
                              fontWeight={900}
                              sx={{
                                color: "#1f3347",
                                lineHeight: 1.15,
                              }}
                            >
                              {selectedProject.name}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              flexWrap="wrap"
                              sx={{ mt: 0.75 }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {selectedProject.projectCode}
                              </Typography>

                              <Typography color="#b7c0c9">•</Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {selectedProject.client || "Internal project"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={selectedProject.status || "Not Started"}
                            color={getStatusColor(selectedProject.status)}
                            sx={{ fontWeight: 700 }}
                          />

                          <Chip
                            label={selectedProject.priority || "Medium"}
                            color={getPriorityColor(selectedProject.priority)}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                      </Stack>

                      {/* Description */}

                      {selectedProject.description && (
                        <Typography
                          color="text.secondary"
                          sx={{
                            maxWidth: 850,
                            lineHeight: 1.7,
                          }}
                        >
                          {selectedProject.description}
                        </Typography>
                      )}

                      <Divider />

                      {/* Info */}

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <InfoItem
                            icon={<CalendarMonthRoundedIcon fontSize="small" />}
                            label="Start Date"
                            value={formatDate(selectedProject.startDate)}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <InfoItem
                            icon={<EventRoundedIcon fontSize="small" />}
                            label="End Date"
                            value={formatDate(selectedProject.endDate)}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <InfoItem
                            icon={<AccessTimeRoundedIcon fontSize="small" />}
                            label="Duration"
                            value={selectedProject.duration}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <InfoItem
                            icon={<GroupsRoundedIcon fontSize="small" />}
                            label="Members"
                            value={`${selectedProject.members?.length || 0} members`}
                          />
                        </Grid>
                      </Grid>

                      {/* Overall progress */}

                      {/* <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 0.75 }}
                        >
                          <Typography variant="body2" fontWeight={800}>
                            Overall Project Progress
                          </Typography>

                          <Typography
                            variant="body2"
                            fontWeight={900}
                            color="primary"
                          >
                            {projectProgress}%
                          </Typography>
                        </Stack>

                        <LinearProgress
                          variant="determinate"
                          value={projectProgress}
                          sx={{
                            height: 9,
                            borderRadius: 5,
                            backgroundColor: "#e7edf2",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box> */}
                    </Stack>
                  </Box>
                </Card>

              

                <Card
                  sx={{
                    border: "1px solid #e5eaf0",
                    boxShadow: "0 8px 30px rgba(25, 50, 75, 0.04)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionHeader
                      icon={<ScheduleRoundedIcon />}
                      title="Project Timeline"
                      subtitle="Track project duration and delivery milestones."
                    />

                    <Box
                      sx={{
                        position: "relative",
                        mt: 3,
                        px: { xs: 0, sm: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: { xs: 18, sm: 30 },
                          right: { xs: 18, sm: 30 },
                          top: 18,
                          height: 3,
                          backgroundColor: "#dce5eb",
                          borderRadius: 5,
                        }}
                      />

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        position="relative"
                      >
                        {/* Start */}

                        <Stack
                          alignItems="center"
                          spacing={1}
                          sx={{
                            width: "33.33%",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: "#1099c6",
                              color: "#ffffff",
                              border: "4px solid #ffffff",
                              boxShadow: "0 0 0 1px #dbe6ec",
                            }}
                          >
                            <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            Project Start
                          </Typography>

                          <Typography variant="body2" fontWeight={800}>
                            {formatDate(selectedProject.startDate)}
                          </Typography>
                        </Stack>

                        {/* Current */}

                        <Stack
                          alignItems="center"
                          spacing={1}
                          sx={{
                            width: "33.33%",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor:
                                projectProgress === 100 ? "#2e7d32" : "#e6a727",
                              color: "#ffffff",
                              border: "4px solid #ffffff",
                              boxShadow: "0 0 0 1px #dbe6ec",
                            }}
                          >
                            {projectProgress === 100 ? (
                              <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />
                            ) : (
                              <AccessTimeRoundedIcon sx={{ fontSize: 17 }} />
                            )}
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            Current Progress
                          </Typography>

                          <Typography variant="body2" fontWeight={800}>
                            {projectProgress}%
                          </Typography>
                        </Stack>

                        {/* End */}

                        <Stack
                          alignItems="center"
                          spacing={1}
                          sx={{
                            width: "33.33%",
                            textAlign: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: "#52606d",
                              color: "#ffffff",
                              border: "4px solid #ffffff",
                              boxShadow: "0 0 0 1px #dbe6ec",
                            }}
                          >
                            <FlagRoundedIcon sx={{ fontSize: 17 }} />
                          </Box>

                          <Typography variant="caption" color="text.secondary">
                            Project End
                          </Typography>

                          <Typography variant="body2" fontWeight={800}>
                            {formatDate(selectedProject.endDate)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>

                {/* ========================================================== */}
                {/* PHASES                                                      */}
                {/* ========================================================== */}

                <Card
                  sx={{
                    border: "1px solid #e5eaf0",
                    boxShadow: "0 8px 30px rgba(25, 50, 75, 0.04)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionHeader
                      icon={<ScheduleRoundedIcon />}
                      title="Project Phases"
                      subtitle={`${phases.length} phase${
                        phases.length !== 1 ? "s" : ""
                      } defined for this project.`}
                    />

                    {!phases.length ? (
                      <Box
                        sx={{
                          py: 5,
                          textAlign: "center",
                          border: "1px dashed #d7e0e7",
                          borderRadius: 2.5,
                          backgroundColor: "#fafcfd",
                        }}
                      >
                        <ScheduleRoundedIcon
                          sx={{
                            fontSize: 42,
                            color: "#c3ccd4",
                            mb: 1,
                          }}
                        />

                        <Typography fontWeight={800}>
                          No phases added
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Project phases will appear here once they are created.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1.5}>
                        {phases.map((phase, index) => {
                          const progress = getPhaseProgress(phase);

                          return (
                            <Card
                              key={phase._id || `${phase.name}-${index}`}
                              sx={{
                                border: "1px solid #e5ebf0",
                                boxShadow: "none",
                                borderRadius: 2.5,
                              }}
                            >
                              <CardContent
                                sx={{
                                  p: { xs: 1.75, sm: 2 },
                                  "&:last-child": {
                                    pb: { xs: 1.75, sm: 2 },
                                  },
                                }}
                              >
                                <Stack spacing={1.5}>
                                  {/* Phase top */}

                                  <Stack
                                    direction={{
                                      xs: "column",
                                      sm: "row",
                                    }}
                                    justifyContent="space-between"
                                    alignItems={{
                                      xs: "flex-start",
                                      sm: "center",
                                    }}
                                    spacing={1}
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={1.25}
                                      alignItems="center"
                                    >
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 2,
                                          display: "grid",
                                          placeItems: "center",
                                          backgroundColor: "#eef7fb",
                                          color: "#1099c6",
                                          fontWeight: 900,
                                        }}
                                      >
                                        {index + 1}
                                      </Box>

                                      <Box>
                                        <Typography
                                          fontWeight={850}
                                          sx={{
                                            color: "#243447",
                                          }}
                                        >
                                          {phase.name || `Phase ${index + 1}`}
                                        </Typography>

                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          Phase {index + 1}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    <Chip
                                      size="small"
                                      label={phase.status || "Planned"}
                                      color={getStatusColor(phase.status)}
                                      sx={{
                                        fontWeight: 700,
                                      }}
                                    />
                                  </Stack>

                                  {/* Description */}

                                  {phase.description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {phase.description}
                                    </Typography>
                                  )}

                                  {/* Progress */}

                                  <Box>
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      sx={{ mb: 0.7 }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        fontWeight={600}
                                      >
                                        Completion
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        fontWeight={850}
                                      >
                                        {progress}%
                                      </Typography>
                                    </Stack>

                                    <LinearProgress
                                      variant="determinate"
                                      value={progress}
                                      sx={{
                                        height: 7,
                                        borderRadius: 5,
                                        backgroundColor: "#e8edf1",
                                        "& .MuiLinearProgress-bar": {
                                          borderRadius: 5,
                                        },
                                      }}
                                    />
                                  </Box>

                                  {/* Bottom metadata */}

                                  <Stack
                                    direction={{
                                      xs: "column",
                                      sm: "row",
                                    }}
                                    spacing={{
                                      xs: 1,
                                      sm: 3,
                                    }}
                                    divider={
                                      <Divider
                                        orientation="vertical"
                                        flexItem
                                      />
                                    }
                                  >
                                    <Stack
                                      direction="row"
                                      spacing={0.75}
                                      alignItems="center"
                                    >
                                      <EventRoundedIcon
                                        sx={{
                                          fontSize: 17,
                                          color: "#8a96a3",
                                        }}
                                      />

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        End Date:
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        fontWeight={750}
                                      >
                                        {formatDate(phase.endDate)}
                                      </Typography>
                                    </Stack>

                                    <Stack
                                      direction="row"
                                      spacing={0.75}
                                      alignItems="center"
                                    >
                                      <DescriptionRoundedIcon
                                        sx={{
                                          fontSize: 17,
                                          color: "#8a96a3",
                                        }}
                                      />

                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Deliverables:
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        fontWeight={750}
                                      >
                                        {Array.isArray(phase.deliverables)
                                          ? phase.deliverables.length
                                          : 0}
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  {/* Deliverables */}

                                  {Array.isArray(phase.deliverables) &&
                                    phase.deliverables.length > 0 && (
                                      <Box
                                        sx={{
                                          p: 1.5,
                                          borderRadius: 2,
                                          backgroundColor: "#f7f9fb",
                                        }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          fontWeight={700}
                                          display="block"
                                          sx={{ mb: 0.75 }}
                                        >
                                          Phase Deliverables
                                        </Typography>

                                        <Stack spacing={0.5}>
                                          {phase.deliverables.map(
                                            (deliverable, deliverableIndex) => (
                                              <Typography
                                                key={deliverableIndex}
                                                variant="body2"
                                              >
                                                •{" "}
                                                {typeof deliverable === "string"
                                                  ? deliverable
                                                  : deliverable?.name ||
                                                    JSON.stringify(deliverable)}
                                              </Typography>
                                            ),
                                          )}
                                        </Stack>
                                      </Box>
                                    )}
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    )}
                  </CardContent>
                </Card>

                {/* ========================================================== */}
                {/* FRD                                                         */}
                {/* ========================================================== */}

                <Card
                  sx={{
                    border: "1px solid #e5eaf0",
                    boxShadow: "0 8px 30px rgba(25, 50, 75, 0.04)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionHeader
                      icon={<DescriptionRoundedIcon />}
                      title="Functional Requirements Document"
                      subtitle="Project FRD versions and documentation."
                    />

                    {selectedFrd ? (
                      <Stack spacing={2}>
                        {/* Version selector */}

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {frdVersions.map((document, index) => {
                            const documentKey =
                              document?._id || document?.version || index;

                            const isSelected =
                              (document?._id &&
                                document._id === selectedVersion) ||
                              (!document?._id &&
                                document?.version === selectedVersion);

                            return (
                              <Button
                                key={documentKey}
                                size="small"
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() =>
                                  setSelectedVersion(
                                    document?._id || document?.version || "",
                                  )
                                }
                                sx={{
                                  minWidth: 72,
                                  fontWeight: 750,
                                  borderRadius: 2,
                                }}
                              >
                                v{document?.version || "1.0"}
                              </Button>
                            );
                          })}
                        </Stack>

                        {/* FRD document card */}

                        <Box
                          sx={{
                            p: 2,
                            border: "1px solid #e2e9ef",
                            borderRadius: 2.5,
                            background:
                              "linear-gradient(135deg, #fafcfd, #f4f9fb)",
                          }}
                        >
                          <Stack
                            direction={{
                              xs: "column",
                              sm: "row",
                            }}
                            justifyContent="space-between"
                            alignItems={{
                              xs: "flex-start",
                              sm: "center",
                            }}
                            spacing={2}
                          >
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 2,
                                  display: "grid",
                                  placeItems: "center",
                                  backgroundColor: "#ffffff",
                                  color: "#1099c6",
                                  boxShadow: "0 4px 12px rgba(0,0,0,.05)",
                                }}
                              >
                                <DescriptionRoundedIcon />
                              </Box>

                              <Box>
                                <Typography
                                  fontWeight={800}
                                  sx={{
                                    color: "#243447",
                                  }}
                                >
                                  Functional Requirements Document
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Version {selectedFrd.version || "1.0"}
                                </Typography>
                              </Box>
                            </Stack>

                            <Button
                              component="a"
                              href={selectedFrd.content}
                              target="_blank"
                              rel="noreferrer"
                              variant="contained"
                              startIcon={<DescriptionRoundedIcon />}
                              disabled={!selectedFrd.content}
                              sx={{
                                borderRadius: 2,
                                fontWeight: 750,
                                textTransform: "none",
                                px: 2,
                              }}
                            >
                              Open FRD Document
                            </Button>
                          </Stack>
                        </Box>
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          p: 4,
                          textAlign: "center",
                          border: "1px dashed #d5dee6",
                          borderRadius: 2.5,
                        }}
                      >
                        <DescriptionRoundedIcon
                          sx={{
                            fontSize: 42,
                            color: "#c4cdd5",
                          }}
                        />

                        <Typography fontWeight={800} sx={{ mt: 1 }}>
                          No FRD document uploaded
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Upload an FRD to make it available here.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* ========================================================== */}
                {/* PROJECT SCOPE                                               */}
                {/* ========================================================== */}

                <Card
                  sx={{
                    border: "1px solid #e5eaf0",
                    boxShadow: "0 8px 30px rgba(25, 50, 75, 0.04)",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionHeader
                      icon={<BusinessRoundedIcon />}
                      title="Project Scope"
                      subtitle="Defined requirements and delivery boundaries."
                    />

                    <Grid container spacing={1.5}>
                      {scopeFields.map(([label, field]) => {
                        const value = selectedProject.scope?.[field];

                        return (
                          <Grid
                            item
                            xs={12}
                            md={field === "summary" ? 12 : 6}
                            key={field}
                          >
                            <Box
                              sx={{
                                p: 2,
                                minHeight: field === "summary" ? "auto" : 120,
                                border: "1px solid #e5ebf0",
                                borderRadius: 2.5,
                                backgroundColor: "#fafcfd",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#1099c6",
                                  fontWeight: 850,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                }}
                              >
                                {label}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: "#455463",
                                  lineHeight: 1.7,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {formatScope(value)}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Stack>
            )}
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
