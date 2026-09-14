import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";

import CustomDropdown from "../../Component/CustomDropdown";
import ReusableInput from "../../Component/ReusableInput";
import ReusableButton from "../../Component/ReusableButton";

const options = (values) => values.map((value) => ({ value, label: value }));
const severityOptions = options(["Low", "Medium", "High", "Critical"]);
const priorityOptions = options(["Low", "Medium", "High", "Critical"]);
const statusOptions = options(["Open", "Assigned", "In Progress", "Fixed", "Retest", "Passed", "Rejected", "Closed"]);

const initialValues = {
  bugCode: "",
  projectId: "",
  taskId: "",
  taskTitle: "",
  moduleId: "",
  title: "",
  description: "",
  severity: "Medium",
  priority: "Medium",
  status: "Open",
  assignedTo: "",
  attachments: [],
};

export default function BugsFormModal({ resource, record, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(() => ({
    ...initialValues,
    ...record,
    projectId: record?.projectId?._id || record?.projectId || "",
    taskId: record?.taskId?._id || record?.taskId || "",
    assignedTo: record?.assignedTo?._id || record?.assignedTo || "",
    attachments: Array.isArray(record?.attachments) ? record.attachments : [],
  }));
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modules, setModules] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([ApiService.getProjects(), ApiService.getEmployeeDropdown()])
      .then(([projectResponse, employeeResponse]) => {
        const projectData = projectResponse.data?.data || projectResponse.data || [];
        const employeeData = employeeResponse.data?.data || employeeResponse.data || [];
        setProjects((projectData.items || projectData).map((item) => ({ value: item._id, label: item.name })));
        setEmployees((Array.isArray(employeeData) ? employeeData : []).filter((item) => ["web-developer", "mobile-developer", "designer"].includes(String(item.role || "").toLowerCase())).map((item) => ({
          value: item.value || item._id,
          label: item.label || item.name || item.email || "Unnamed employee",
        })));
      })
      .catch(() => {
        setProjects([]);
        setEmployees([]);
      });
  }, []);

  useEffect(() => {
    if (!values.projectId) {
      setTasks([]);
      return;
    }

    ApiService.getTasks({ projectId: values.projectId, limit: 100 })
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setTasks((data.items || data).map((item) => ({ value: item._id, label: item.title })));
      })
      .catch(() => setTasks([]));
  }, [values.projectId]);
  useEffect(() => {
    if (!values.projectId) { setModules([]); return; }
    ApiService.getProjectModules(values.projectId)
      .then(response => { const data = response.data?.data || response.data || []; setModules((data.items || data).map(item => ({ value: item._id, label: item.name }))); })
      .catch(() => setModules([]));
  }, [values.projectId]);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...values,
        bugCode: values.bugCode || undefined,
        taskId: values.taskId || undefined,
        taskTitle: values.taskTitle || undefined,
        moduleId: values.moduleId || undefined,
        assignedTo: values.assignedTo || undefined,
        attachments: values.attachments.filter(Boolean),
      };

      if (record?._id) await ApiService.updateRecord(resource, record._id, payload);
      else await ApiService.createRecord(resource, payload);
      await onSaved?.();
      dispatch(closeModal());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 1, borderTop: "4px solid #c62828" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            {record ? "Edit Bug" : "Create Bug"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Report the issue and assign it to the right project member.
          </Typography>
        </Box>

        {record?.bugCode && (
          <ReusableInput label="Bug Code" name="bugCode" value={values.bugCode} disabled />
        )}

        <ReusableInput
          label="Bug Title"
          name="title"
          value={values.title}
          onChange={(event) => updateValue("title", event.target.value)}
          placeholder="e.g. Login button does not respond"
          required
        />

        <ReusableInput
          label="Description"
          name="description"
          value={values.description}
          onChange={(event) => updateValue("description", event.target.value)}
          placeholder="Describe the steps to reproduce and expected behavior"
          multiline
          minRows={4}
          required
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <CustomDropdown label="Project" name="projectId" value={values.projectId} options={projects} onChange={(value) => { updateValue("projectId", value); updateValue("taskId", ""); }} placeholder="Select project" required />
          <ReusableInput label="New task name (optional)" name="taskTitle" value={values.taskTitle} onChange={(event) => updateValue("taskTitle", event.target.value)} placeholder="Enter task name for developer" />
          <CustomDropdown label="Module" name="moduleId" value={values.moduleId} options={modules} onChange={(value) => updateValue("moduleId", value)} placeholder="Choose module" />
          <CustomDropdown label="Related existing task (optional)" name="taskId" value={values.taskId} options={tasks} onChange={(value) => updateValue("taskId", value)} placeholder="Select related task" />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <CustomDropdown label="Severity" name="severity" value={values.severity} options={severityOptions} onChange={(value) => updateValue("severity", value)} required />
          <CustomDropdown label="Priority" name="priority" value={values.priority} options={priorityOptions} onChange={(value) => updateValue("priority", value)} required />
          <CustomDropdown label="Status" name="status" value={values.status} options={statusOptions} onChange={(value) => updateValue("status", value)} required />
        </Stack>

        <CustomDropdown label="Assign To" name="assignedTo" value={values.assignedTo} options={employees} onChange={(value) => updateValue("assignedTo", value)} placeholder="Select employee" />

        <ReusableInput
          label="Attachments"
          name="attachments"
          value={values.attachments.join(", ")}
          onChange={(event) => updateValue("attachments", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
          placeholder="Paste file URLs separated by commas"
        />

        <Button type="submit" variant="contained" sx={{ bgcolor: "#c62828", textTransform: "none", fontWeight: 600, py: 1.2, "&:hover": { bgcolor: "#a51f1f" } }} disabled={saving}>
          {saving ? "Saving..." : record ? "Update Bug" : "Create Bug"}
        </Button>
      </Stack>
    </Box>
  );
}

