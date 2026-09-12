import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { closeModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";
import CustomDropdown from "../../Component/CustomDropdown";
import CustomMultiSelect from "../../Component/CustomMultiSelect";
import ReusableInput from "../../Component/ReusableInput";

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const initialValues = {
  name: "",
  teamLead: "",
  members: [],
  status: "Active",
};

export default function TeamsFormModal({ resource, record, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState(() => ({
    ...initialValues,
    ...record,
    teamLead: record?.teamLead?._id || record?.teamLead || "",
    members: Array.isArray(record?.members)
      ? record.members.map((member) => member?._id || member)
      : [],
  }));
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ApiService.getEmployeeDropdown()
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setEmployees(
          (Array.isArray(data) ? data : []).map((item) => ({
            value: item.value || item._id,
            label: item.label || item.name || item.email || "Unnamed employee",
          })),
        );
      })
      .catch(() => setEmployees([]));
  }, []);

  const updateValue = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!values.name?.trim()) return;

    setSaving(true);

    try {
      const payload = {
        name: values.name.trim(),
        teamLead: values.teamLead || undefined,
        members: Array.isArray(values.members) ? values.members : [],
        status: values.status || "Active",
      };

      if (record?._id) {
        await ApiService.updateRecord(resource, record._id, payload);
      } else {
        await ApiService.createRecord(resource, payload);
      }

      await onSaved?.();
      dispatch(closeModal());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} sx={{ p: 1, borderTop: "4px solid #2e7d32" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827" }}>
            {record ? "Edit Team" : "Create Team"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define the team name, owner and assigned members.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <ReusableInput
              label="Team Name"
              name="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              required
              placeholder="e.g. Development Team"
            />
          </Box>

          <Box sx={{ minWidth: { xs: "100%", sm: 220 } }}>
            <CustomDropdown
              label="Status"
              name="status"
              value={values.status}
              options={statusOptions}
              onChange={(value) => updateValue("status", value)}
              placeholder="Select status"
            />
          </Box>
        </Stack>

        <CustomDropdown
          label="Team Lead"
          name="teamLead"
          value={values.teamLead}
          options={employees}
          onChange={(value) => updateValue("teamLead", value)}
          placeholder="Select team lead"
        />

        <CustomMultiSelect
          label="Team Members"
          name="members"
          value={values.members}
          options={employees}
          onChange={(value) => updateValue("members", value)}
          placeholder="Select team members"
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "#2e7d32",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1,
            py: 1.2,
            mt: 0.5,
            "&:hover": { bgcolor: "#256d2b" },
          }}
          disabled={saving}
        >
          {saving ? "Saving..." : record ? "Update Team" : "Create Team"}
        </Button>
      </Stack>
    </Box>
  );
}
