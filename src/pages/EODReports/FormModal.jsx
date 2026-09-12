import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { useDispatch } from "react-redux";
import { closeModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
import CustomDropdown from "../../Component/CustomDropdown";
import CustomMultiSelect from "../../Component/CustomMultiSelect";
import ReusableButton from "../../Component/ReusableButton";
import ReusableInput from "../../Component/ReusableInput";

function DurationTimePicker({ value, onChange, ...props }) {
  const pickerValue = value === "" || value === null || value === undefined
    ? null
    : dayjs().startOf("day").add(Number(value) || 0, "minute");
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        {...props}
        value={pickerValue}
        ampm={false}
        format="HH:mm"
        minutesStep={5}
        onChange={(newValue) => onChange({
          target: { value: newValue?.isValid() ? newValue.hour() * 60 + newValue.minute() : "" },
        })}
        slotProps={{ textField: { fullWidth: true, required: props.required } }}
      />
    </LocalizationProvider>
  );
}

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Changes Requested", label: "Changes Requested" },
];

const initialValues = {
  date: "",
  completedTasks: [],
  inProgressTasks: [],
  blockers: "",
  tomorrowPlan: "",
  totalMinutes: 0,
  status: "Pending",
};

export default function EODReportsFormModal({ resource, record, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(() => ({
    ...initialValues,
    ...record,
    date: record?.date ? new Date(record.date).toISOString().slice(0, 10) : "",
    completedTasks: (record?.completedTasks || []).map((task) => task?._id || task),
    inProgressTasks: (record?.inProgressTasks || []).map((task) => task?._id || task),
  }));
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getTasks({ limit: 100 })
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setTasks(
          (data.items || data).map((task) => ({ value: task._id, label: task.title })),
        );
      })
      .catch(() => setTasks([]));
  }, []);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...values,
        totalMinutes: Number(values.totalMinutes) || 0,
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
    <form onSubmit={submit}>
      <Stack spacing={2} sx={{ p: 1, borderTop: "4px solid #ad1457" }}>
        <Typography variant="h6">{record ? "Edit EOD Report" : "Create EOD Report"}</Typography>
        <ReusableInput label="Date" name="date" type="date" value={values.date} onChange={(event) => updateValue("date", event.target.value)} InputLabelProps={{ shrink: true }} required />
        <CustomMultiSelect label="Completed Tasks" value={values.completedTasks} options={tasks} onChange={(value) => updateValue("completedTasks", value)} placeholder="Select completed tasks" />
        <CustomMultiSelect label="In-progress Tasks" value={values.inProgressTasks} options={tasks} onChange={(value) => updateValue("inProgressTasks", value)} placeholder="Select in-progress tasks" />
        <ReusableInput label="Blockers" name="blockers" value={values.blockers} onChange={(event) => updateValue("blockers", event.target.value)} multiline minRows={3} />
        <ReusableInput label="Tomorrow's Plan" name="tomorrowPlan" value={values.tomorrowPlan} onChange={(event) => updateValue("tomorrowPlan", event.target.value)} multiline minRows={3} />
        <DurationTimePicker label="Total Work Time" value={values.totalMinutes} onChange={(event) => updateValue("totalMinutes", event.target.value)} required />
        <CustomDropdown label="Status" value={values.status} options={statusOptions} onChange={(value) => updateValue("status", value)} required />
        <ReusableButton
          type="submit"
          title={record ? "Update EOD Report" : "Create EOD Report"}
          loading={saving}
          bg="#ad1457"
          sx={{ "&:hover": { backgroundColor: "#880e4f" } }}
        />
      </Stack>
    </form>
  );
}
