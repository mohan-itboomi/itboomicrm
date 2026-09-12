import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ApiService } from "../../Api/ApiService";
import CustomPageHeader from "../../Component/CustomPageHeader";
import ReusableInput from "../../Component/ReusableInput";
import CustomDatePicker from "../../Component/CustomDatePicker";
const emptyForm = {
  projectCode: "",
  name: "",
  client: "",
  description: "",
  startDate: "",
  endDate: "",
  duration: "",
  priority: "Medium",
  status: "Not Started",
};
const lines = (value) =>
  value
    .split("\\n")
    .map((item) => item.trim())
    .filter(Boolean);

const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return "";
  }

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
};

const getProgress = (project) => {
  const phases = project?.phases || [];
  if (!phases.length) return 0;
  const total = phases.reduce(
    (sum, phase) => sum + (phase.completionPercentage || 0),
    0,
  );
  return Math.round(total / phases.length);
};

const getLatestFrd = (project) =>
  Array.isArray(project?.frd) ? project.frd.at(-1) || {} : project?.frd || {};

export default function BusinessDevelopment() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [scope, setScope] = useState({
    summary: "",
    objectives: "",
    deliverables: "",
    exclusions: "",
    acceptanceCriteria: "",
  });
  const [frd, setFrd] = useState({ version: "1.0", content: "" });
  const [frdFile, setFrdFile] = useState(null);
  const [isSavingFrd, setIsSavingFrd] = useState(false);
  const [phase, setPhase] = useState({
    name: "",
    description: "",
    endDate: "",
  });
  const [phaseStatus, setPhaseStatus] = useState({});
  const [message, setMessage] = useState(null);

  const load = () =>
    ApiService.getProjects().then((response) =>
      setProjects(response.data?.data?.items || []),
    );
  useEffect(() => {
    load();
    ApiService.getProjectId()
      .then((response) =>
        setForm((current) => ({
          ...current,
          projectCode: response.data?.data?.projectCode || "",
        })),
      )
      .catch(() => {});
  }, []);

  const createProject = async (event) => {
    event.preventDefault();
    const duration = calculateDuration(form.startDate, form.endDate);
    const payload = { ...form, duration };

    try {
      await ApiService.createProject(payload);
      setForm(emptyForm);
      setMessage({
        type: "success",
        text: "Project intake created and added to the project board.",
      });
      load();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Project could not be created.",
      });
    }
  };

  const handleDateChange = (field, value) => {
    const next = { ...form, [field]: value };
    if (field === "startDate" || field === "endDate") {
      next.duration = calculateDuration(next.startDate, next.endDate);
    }
    setForm(next);
  };

  const selectProject = (project) => {
    setSelected(project);
    setScope({
      summary: project.scope?.summary || "",
      objectives: (project.scope?.objectives || []).join("\\n"),
      deliverables: (project.scope?.deliverables || []).join("\\n"),
      exclusions: (project.scope?.exclusions || []).join("\\n"),
      acceptanceCriteria: (project.scope?.acceptanceCriteria || []).join("\\n"),
    });
    const latestFrd = getLatestFrd(project);
    setFrd({
      version: latestFrd.version || "1.0",
      content: latestFrd.content || "",
    });
    setFrdFile(null);
  };

  const saveScope = async () => {
    await ApiService.updateProjectScope(selected._id, {
      summary: scope.summary,
      objectives: lines(scope.objectives),
      deliverables: lines(scope.deliverables),
      exclusions: lines(scope.exclusions),
      acceptanceCriteria: lines(scope.acceptanceCriteria),
    });
    setMessage({ type: "success", text: "Project scope saved." });
    load();
  };
  const saveFrd = async () => {
    setIsSavingFrd(true);
    try {
      let content = frd.content;
      if (frdFile) {
        const uploadResponse = await ApiService.uploadMedia(frdFile);
        content = uploadResponse.data?.data?.url;
      }

      await ApiService.updateProjectFrd(selected._id, {
        version: frd.version,
        content,
      });
      setFrd((current) => ({ ...current, content }));
      setFrdFile(null);
      setMessage({ type: "success", text: "FRD saved." });
      load();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "FRD could not be saved.",
      });
    } finally {
      setIsSavingFrd(false);
    }
  };
  const addPhase = async (event) => {
    event.preventDefault();
    await ApiService.addProjectPhase(selected._id, phase);
    setPhase({ name: "", description: "", endDate: "" });
    setMessage({ type: "success", text: "Delivery phase added." });
    load();
  };
  const changePhaseStatus = async (phaseId, status) => {
    await ApiService.updateProjectPhase(selected._id, phaseId, {
      status,
      completionPercentage:
        status === "Completed" ? 100 : status === "In Progress" ? 50 : 0,
    });
    setMessage({ type: "success", text: "Phase status updated." });
    const response = await ApiService.getProjectById(selected._id);
    setSelected(response.data?.data || selected);
  };

  const activeProjects = projects.filter(
    (project) => project.status !== "Completed",
  ).length;
  const completedProjects = projects.filter(
    (project) => project.status === "Completed",
  ).length;

  return (
    <Stack spacing={3} sx={{ pb: 4, width: "100%", maxWidth: "none" }}>
      <CustomPageHeader
        title="Business development"
        subtitle="Turn client requirements into scoped, documented, phase-managed delivery."
      />
      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
        {[
          {
            label: "Total projects",
            value: projects.length,
            tint: "#E8F3FF",
            color: "#1769AA",
          },
          {
            label: "Active pipeline",
            value: activeProjects,
            tint: "#EAFBF5",
            color: "#087F5B",
          },
          {
            label: "Completed",
            value: completedProjects,
            tint: "#FFF5E8",
            color: "#B45309",
          },
        ].map((item) => (
          <Grid item xs={12} sm={4} key={item.label}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${item.tint} 0%, #fff 72%)`,
                boxShadow: "none",
              }}
            >
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5, color: item.color }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Stack component="form" onSubmit={createProject} spacing={2}>
                <Typography variant="h6" fontWeight={800}>
                  New project intake
                </Typography>
                <ReusableInput
                  label="Project ID"
                  name="project-code"
                  value={form.projectCode}
                  disabled
                />
                <ReusableInput
                  required
                  label="Project name"
                  name="project-name"
                  placeholder="Project name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
                <ReusableInput
                  label="Client name"
                  name="client-name"
                  placeholder="Client name"
                  value={form.client}
                  onChange={(event) =>
                    setForm({ ...form, client: event.target.value })
                  }
                />
                <ReusableInput
                  multiline
                  minRows={3}
                  label="Project description"
                  name="project-description"
                  placeholder="Project description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <CustomDatePicker
                    label="Project start date"
                    value={form.startDate}
                    onChange={(value) =>
                      handleDateChange(
                        "startDate",
                        value?.format("YYYY-MM-DD") || "",
                      )
                    }
                  />
                  <CustomDatePicker
                    label="Project end date"
                    value={form.endDate}
                    onChange={(value) =>
                      handleDateChange(
                        "endDate",
                        value?.format("YYYY-MM-DD") || "",
                      )
                    }
                  />
                </Stack>
                <ReusableInput
                  label="Project duration"
                  name="project-duration"
                  value={form.duration}
                  placeholder="Select dates to calculate"
                  disabled
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm({ ...form, priority: event.target.value })
                    }
                    fullWidth
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </TextField>
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                    fullWidth
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="On Board">On Board</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </TextField>
                </Stack>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                >
                  Create project
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={800}>
                Project board
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {projects.map((project) => {
                  const progress = getProgress(project);
                  return (
                    <Box
                      key={project._id}
                      onClick={() => selectProject(project)}
                      sx={{
                        p: 2,
                        border:
                          selected?._id === project._id
                            ? "2px solid #175cd3"
                            : "1px solid #e4e7ec",
                        borderRadius: 2,
                        cursor: "pointer",
                        background:
                          selected?._id === project._id ? "#F2FAFC" : "#fff",
                        transition: "all .2s",
                        "&:hover": {
                          borderColor: "#80CBDC",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography fontWeight={750}>{project.name}</Typography>
                        <Chip
                          size="small"
                          label={project.status || "Not Started"}
                          color={
                            project.status === "Completed"
                              ? "success"
                              : project.status === "On Hold"
                                ? "warning"
                                : "default"
                          }
                        />
                      </Stack>

                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Client: {project.client || "No client"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Assigned team: {(project.members || []).length || 0}{" "}
                            member(s)
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Start:{" "}
                            {project.startDate
                              ? new Date(project.startDate).toLocaleDateString()
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            End:{" "}
                            {project.endDate
                              ? new Date(project.endDate).toLocaleDateString()
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {project.duration || "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Progress: {progress}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {selected && (
        <Grid container spacing={2} sx={{ width: "100%", m: 0 }}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Project scope and documents
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Keep the scope easy to understand: summary, objectives,
                    deliverables, exclusions, and acceptance criteria.
                  </Typography>
                  <TextField
                    multiline
                    minRows={2}
                    label="Scope summary"
                    value={scope.summary}
                    onChange={(event) =>
                      setScope({ ...scope, summary: event.target.value })
                    }
                  />
                  {[
                    "objectives",
                    "deliverables",
                    "exclusions",
                    "acceptanceCriteria",
                  ].map((field) => (
                    <TextField
                      key={field}
                      multiline
                      minRows={2}
                      label={`${field} (one item per line)`}
                      value={scope[field]}
                      onChange={(event) =>
                        setScope({ ...scope, [field]: event.target.value })
                      }
                    />
                  ))}
                  <Button variant="contained" onClick={saveScope}>
                    Save scope
                  </Button>
                  <Divider />
                  <Typography variant="subtitle1" fontWeight={800}>
                    Functional requirements document
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add the detailed document content that explains what must be
                    built and delivered.
                  </Typography>
                  <TextField
                    label="FRD version"
                    value={frd.version}
                    onChange={(event) =>
                      setFrd({ ...frd, version: event.target.value })
                    }
                  />
                  <Button component="label" variant="outlined">
                    {frdFile?.name || (frd.content
                      ? "FRD document selected"
                      : "Upload complete FRD document")}
                    <input
                      hidden
                      type="file"
                      accept="application/pdf,.doc,.docx"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setFrdFile(file);
                      }}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={saveFrd}
                    disabled={isSavingFrd}
                  >
                    {isSavingFrd ? "Saving FRD..." : "Save FRD"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack component="form" onSubmit={addPhase} spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Delivery phases
                  </Typography>
                  {(selected.phases || []).map((item) => (
                    <Stack
                      key={item._id}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography>{item.name}</Typography>
                      <Chip
                        size="small"
                        label={`${item.completionPercentage || 0}% Ã‚Â· ${item.status}`}
                      />
                    </Stack>
                  ))}
                  <Divider />
                  <TextField
                    required
                    label="Phase name"
                    value={phase.name}
                    onChange={(event) =>
                      setPhase({ ...phase, name: event.target.value })
                    }
                  />
                  <TextField
                    label="Phase description"
                    value={phase.description}
                    onChange={(event) =>
                      setPhase({ ...phase, description: event.target.value })
                    }
                  />
                  <TextField
                    type="date"
                    label="Target date"
                    InputLabelProps={{ shrink: true }}
                    value={phase.endDate}
                    onChange={(event) =>
                      setPhase({ ...phase, endDate: event.target.value })
                    }
                  />
                  <Button type="submit" variant="outlined">
                    Add phase
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

