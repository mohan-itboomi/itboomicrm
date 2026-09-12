import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField as MuiTextField,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import { useParams } from "react-router-dom";
import { ApiService } from "../../Api/ApiService";
import CustomPageHeader from "../../Component/CustomPageHeader";
import CustomDropdown from "../../Component/CustomDropdown";

const categories = ["Project Implementation", "Bug Fixing"];
const initialModule = { name: "", description: "", status: "Planned", phaseId: "" };
const initialTask = {
  title: "",
  description: "",
  category: "Project Implementation",
  moduleId: "",
  parentTaskId: "",
  assignedTo: "",
  estimatedMinutes: "",
  priority: "Medium",
  status: "Pending",
};

function DurationTimePicker({ value, onChange, ...props }) {
  const pickerValue =
    value === "" || value === null || value === undefined
      ? null
      : dayjs()
          .startOf("day")
          .add(Number(value) || 0, "minute");
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        {...props}
        value={pickerValue}
        ampm={false}
        format="HH:mm"
        minutesStep={5}
        onChange={(newValue) =>
          onChange({
            target: {
              value: newValue?.isValid()
                ? newValue.hour() * 60 + newValue.minute()
                : "",
            },
          })
        }
        slotProps={{ textField: { fullWidth: true, required: props.required } }}
      />
    </LocalizationProvider>
  );
}

const TextField = ({ label, type, inputProps, ...props }) =>
  label === "Estimated duration (minutes)" ? (
    <DurationTimePicker {...props} label="Estimated duration" />
  ) : (
    <MuiTextField
      {...props}
      label={label}
      type={type}
      inputProps={inputProps}
    />
  );

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "Not recorded";
const formatMinutes = (value) =>
  `${Math.floor((Number(value) || 0) / 60)}h ${Math.round((Number(value) || 0) % 60)}m`;

function TaskTiming({ row }) {
  const pauseMinutes = row.sessions.reduce(
    (total, item) =>
      total +
      item.pauses.reduce((sum, pause) => sum + (pause.durationMinutes || 0), 0),
    0,
  );
  return (
    <Stack spacing={0.75} sx={{ mt: 1.5 }}>
      <Typography variant="body2" color="text.secondary">
        Total time: {formatMinutes(row.totalMinutes)}  Pause time:{" "}
        {formatMinutes(pauseMinutes)}
      </Typography>
      {row.sessions.map(({ session, pauses }) => (
        <Box
          key={session._id}
          sx={{ pl: 1.5, borderLeft: "2px solid #dbe4ef" }}
        >
          <Typography variant="caption" color="text.secondary">
            Start: {formatDateTime(session.startTime || session.startedAt)} 
            End: {formatDateTime(session.endTime || session.endedAt)}  Status:{" "}
            {session.status}
          </Typography>
          {pauses.map((pause) => (
            <Typography
              key={pause._id}
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Pause: {formatDateTime(pause.startTime)} to{" "}
              {formatDateTime(pause.endTime)} (
              {formatMinutes(pause.durationMinutes)})
            </Typography>
          ))}
        </Box>
      ))}
    </Stack>
  );
}

function TaskSection({ title, tasks, color }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" fontWeight={800}>
        {title} ({tasks.length})
      </Typography>
      {tasks.map((row) => (
        <Card key={row.task._id} variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Box>
                <Typography fontWeight={750}>{row.task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.task.moduleId?.name || "No module"} {" "}
                  {row.task.assignedTo?.name || "Unassigned"}
                </Typography>
                {row.task.parentTaskId?.title && (
                  <Typography variant="caption" color="text.secondary">
                    Subtask of {row.task.parentTaskId.title}
                  </Typography>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip size="small" color={color} label={row.task.status} />
                <Chip size="small" label={formatMinutes(row.totalMinutes)} />
              </Stack>
            </Stack>
            <TaskTiming row={row} />
          </CardContent>
        </Card>
      ))}
      {!tasks.length && (
        <Typography color="text.secondary">
          No tasks in this category.
        </Typography>
      )}
    </Stack>
  );
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [timingSummary, setTimingSummary] = useState({
    tasks: [],
    totals: {},
    overall: 0,
  });
  const [moduleForm, setModuleForm] = useState(initialModule);
  const [taskForm, setTaskForm] = useState(initialTask);
  const [memberId, setMemberId] = useState("");
  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState(null);

  const load = useCallback(async () => {
    const [projectResponse, moduleResponse, timingResponse, employeeResponse] =
      await Promise.all([
        ApiService.getProjectById(id),
        ApiService.getProjectModules(id),
        ApiService.getProjectTimeSummary(id),
        ApiService.getEmployeeDropdown(),
      ]);
    setProject(projectResponse.data?.data || {});
    setModules(moduleResponse.data?.data?.items || []);
    setTimingSummary(
      timingResponse.data?.data || { tasks: [], totals: {}, overall: 0 },
    );
    setEmployees(employeeResponse.data?.data || []);
  }, [id]);

  useEffect(() => {
    load().catch(() =>
      setMessage({
        type: "error",
        text: "Project workspace could not be loaded.",
      }),
    );
  }, [load]);

  const projectMembers = (project?.members || []).map((member) => ({
    value: member._id,
    label: `${member.name} (${member.role})`,
  }));
  const implementationTasks = timingSummary.tasks.filter(
    (row) => row.category === "Project Implementation",
  );
  const bugFixingTasks = timingSummary.tasks.filter(
    (row) => row.category === "Bug Fixing",
  );
  const taskOptions = timingSummary.tasks
    .map((row) => row.task)
    .filter((task) => task && !task.parentTaskId);
  const updateTask = (field, value) =>
    setTaskForm((current) => ({ ...current, [field]: value }));
  const addMember = async () => {
    if (!memberId) return;
    await ApiService.addProjectMember(id, memberId);
    setMemberId("");
    await load();
    setMessage({ type: "success", text: "Project member assigned." });
  };
  const createModule = async (event) => {
    event.preventDefault();
    const { phaseId, ...modulePayload } = moduleForm;
    await ApiService.createProjectModule(id, {
      ...modulePayload,
      ...(phaseId ? { phaseId } : {}),
    });
    setModuleForm(initialModule);
    await load();
    setMessage({ type: "success", text: "Module created under this project." });
  };
  const createTask = async (event) => {
    event.preventDefault();
    const { moduleId, parentTaskId, assignedTo, ...taskPayload } = taskForm;
    await ApiService.createTask({
      ...taskPayload,
      projectId: id,
      ...(moduleId ? { moduleId } : {}),
      ...(parentTaskId ? { parentTaskId } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      estimatedMinutes: Number(taskForm.estimatedMinutes) || 0,
    });
    setTaskForm(initialTask);
    await load();
    setMessage({ type: "success", text: "Task created under this project." });
  };

  if (!project) return <Typography>Loading project workspace...</Typography>;
  if (Array.isArray(project.frd)) project.frd = project.frd.at(-1) || {};
  return (
    <Stack spacing={3}>
      <CustomPageHeader
        title={project.name}
        subtitle={`${project.client || "Internal project"}  ${project.status} ${project.priority}`}
      />
      {/* {message && <Alert severity={message.type}>{message.text}</Alert>}{" "} */}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Project plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                FRD document and delivery phases shared by Business Development.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
            >
              <Box sx={{ flex: 1 }}>
                {project.frd?.content ? (
                  <Button
                    component="a"
                    href={project.frd.content}
                    download={`${project.name}-FRD`}
                    variant="outlined"
                  >
                    Download FRD document
                  </Button>
                ) : (
                  <Typography color="text.secondary">
                    FRD document not uploaded yet.
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {project.phases?.length || 0} phase(s)
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {(project.phases || []).map((phase) => (
                <Stack
                  key={phase._id}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ p: 1.5, bgcolor: "#f7f9fc", borderRadius: 2 }}
                >
                  <Box>
                    <Typography fontWeight={700}>{phase.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {phase.description || "No description"}
                      {phase.endDate
                        ? ` · Target: ${new Date(phase.endDate).toLocaleDateString()}`
                        : ""}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={`${phase.completionPercentage || 0}% · ${phase.status}`}
                    color={
                      phase.status === "Completed"
                        ? "success"
                        : phase.status === "Blocked"
                          ? "error"
                          : "default"
                    }
                  />
                </Stack>
              ))}
              {!(project.phases || []).length && (
                <Typography color="text.secondary">
                  No delivery phases added yet.
                </Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        {[
          [
            "Total Implementation Time",
            timingSummary.totals?.["Project Implementation"],
          ],
          ["Total Bug Fixing Time", timingSummary.totals?.["Bug Fixing"]],
          ["Overall Project Time", timingSummary.overall],
        ].map(([label, value]) => (
          <Grid item xs={12} md={4} key={label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h5" fontWeight={850}>
                  {formatMinutes(value)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Project team
              </Typography>
              <Typography color="text.secondary">
                Only assigned members can be selected for task ownership.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ minWidth: { md: 430 } }}
            >
              <CustomDropdown
                value={memberId}
                options={employees.filter(
                  (employee) =>
                    !project.members?.some(
                      (member) => String(member._id) === String(employee.value),
                    ),
                )}
                onChange={setMemberId}
                placeholder="Select employee"
              />
              <Button
                variant="outlined"
                startIcon={<PersonAddRoundedIcon />}
                onClick={addMember}
                disabled={!memberId}
              >
                Assign
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
            {projectMembers.length ? (
              projectMembers.map((member) => (
                <Chip key={member.value} label={member.label} />
              ))
            ) : (
              <Typography color="text.secondary">
                No employees assigned yet.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label={`Modules (${modules.length})`} />
        <Tab label={`Tasks (${timingSummary.tasks.length})`} />
      </Tabs>
      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack component="form" onSubmit={createModule} spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Create module
                  </Typography>
                  <TextField
                    required
                    label="Module name"
                    value={moduleForm.name}
                    onChange={(event) =>
                      setModuleForm({ ...moduleForm, name: event.target.value })
                    }
                  />
                  <TextField
                    multiline
                    minRows={2}
                    label="Description"
                    value={moduleForm.description}
                    onChange={(event) =>
                      setModuleForm({
                        ...moduleForm,
                        description: event.target.value,
                      })
                    }
                  />
                  <CustomDropdown
                    label="Phase"
                    value={moduleForm.phaseId}
                    options={(project.phases || []).map((phase) => ({
                      value: phase._id,
                      label: phase.name,
                    }))}
                    onChange={(value) =>
                      setModuleForm({ ...moduleForm, phaseId: value })
                    }
                    placeholder="Select phase"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                  >
                    Create module
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={1.5}>
              {modules.map((module) => (
                <Card key={module._id}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={750}>{module.name}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={
                            (project.phases || []).find(
                              (phase) =>
                                String(phase._id) === String(module.phaseId),
                            )?.name || "Unassigned phase"
                          }
                        />
                        <Chip
                          size="small"
                          label={`${module.completionPercentage || 0}% · ${module.status}`}
                        />
                      </Stack>
                    </Stack>
                    <Typography color="text.secondary" variant="body2">
                      {module.description || "No description"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
              {!modules.length && (
                <Typography color="text.secondary">
                  No modules created for this project.
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Stack component="form" onSubmit={createTask} spacing={2}>
                  <Typography variant="h6" fontWeight={800}>
                    Create task
                  </Typography>
                  <TextField
                    required
                    label="Task title"
                    value={taskForm.title}
                    onChange={(event) =>
                      updateTask("title", event.target.value)
                    }
                  />
                  <TextField
                    required
                    multiline
                    minRows={2}
                    label="Description"
                    value={taskForm.description}
                    onChange={(event) =>
                      updateTask("description", event.target.value)
                    }
                  />
                  <CustomDropdown
                    label="Task category"
                    value={taskForm.category}
                    options={categories.map((value) => ({
                      value,
                      label: value,
                    }))}
                    onChange={(value) => updateTask("category", value)}
                  />
                  <CustomDropdown
                    label="Module"
                    value={taskForm.moduleId}
                    options={modules.map((module) => ({
                      value: module._id,
                      label: module.name,
                    }))}
                    onChange={(value) => {
                      updateTask("moduleId", value);
                      updateTask("parentTaskId", "");
                    }}
                    placeholder="Select module"
                  />
                  <CustomDropdown
                    label="Parent task (optional)"
                    value={taskForm.parentTaskId}
                    options={taskOptions
                      .filter(
                        (task) =>
                          !taskForm.moduleId ||
                          String(task.moduleId?._id || task.moduleId) ===
                            String(taskForm.moduleId),
                      )
                      .map((task) => ({ value: task._id, label: task.title }))}
                    onChange={(value) => updateTask("parentTaskId", value)}
                    placeholder="Main task"
                  />
                  <CustomDropdown
                    label="Assign to project member"
                    value={taskForm.assignedTo}
                    options={projectMembers}
                    onChange={(value) => updateTask("assignedTo", value)}
                    placeholder="Select member"
                  />
                  <TextField
                    required
                    type="number"
                    label="Estimated duration (minutes)"
                    value={taskForm.estimatedMinutes}
                    onChange={(event) =>
                      updateTask("estimatedMinutes", event.target.value)
                    }
                    inputProps={{ min: 0 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    disabled={!projectMembers.length}
                  >
                    Create task
                  </Button>
                  {!projectMembers.length && (
                    <Typography variant="caption" color="warning.main">
                      Assign at least one project member before creating an
                      assigned task.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              <TaskSection
                title="Project Implementation"
                tasks={implementationTasks}
                color="primary"
              />
              <TaskSection
                title="Bug Fixing"
                tasks={bugFixingTasks}
                color="error"
              />
            </Stack>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
