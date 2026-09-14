import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ReusableButton from "../../Component/ReusableButton";
import ReusableInput from "../../Component/ReusableInput";
import CustomDropdown from "../../Component/CustomDropdown";
import { closeModal } from "../../Api/Redux/Reducers/modalSlice";
import { ApiService } from "../../Api/ApiService";

const roles = [
  "admin",
  "employee",
  "web-developer",
  "mobile-developer",
  "team-lead",
  "tester",
  "bd",
  "project-coordinator",
  "designer"
].map((value) => ({ value, label: value }));
const statuses = ["Active", "Inactive"].map((value) => ({
  value,
  label: value,
}));
const departments = [
  "Engineering",
  "Product",
  "Design",
  "Quality Assurance",
  "Business Development",
  "Human Resources",
  "Finance",
  "Operations",
  "Marketing",
  "Sales",
  "Customer Support",
  "Information Technology",
  "Administration",
  "Legal",
  "Procurement",
  "Research",
  "Security",
  "Training",
  "Project Management",
  "Facilities",
].map((value) => ({ value, label: value }));
const designations = [
  "Intern",
  "Trainee",
  "Junior Developer",
  "Software Developer",
  "Senior Developer",
  "Tech Lead",
  "Engineering Manager",
  "QA Engineer",
  "QA Lead",
  "UI/UX Designer",
  "Product Manager",
  "Project Manager",
  "Business Analyst",
  "HR Executive",
  "Finance Executive",
  "Sales Executive",
  "Business Development Executive",
  "Operations Manager",
  "Team Lead",
  "Director",
].map((value) => ({ value, label: value }));
const initial = {
  employeeId: "",
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "employee",
  department: "",
  team: "",
  teamLead: "",
  designation: "",
  joiningDate: "",
  status: "Active",
};
export default function EmployeesFormModal({ record, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState({
    ...initial,
    ...record,
    team: record?.team?._id || record?.team || "",
    teamLead: record?.teamLead?._id || record?.teamLead || "",
    joiningDate: record?.joiningDate
      ? String(record.joiningDate).slice(0, 10)
      : "",
  });
  const [teams, setTeams] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!record)
      ApiService.getEmployeeId()
        .then((response) =>
          update("employeeId", response.data?.data?.employeeId || ""),
        )
        .catch(() => {});
    ApiService.getTeams()
      .then((response) => {
        const data = response.data?.data || response.data;
        setTeams(
          (data?.items || data || []).map((item) => ({
            value: item._id,
            label: item.name,
          })),
        );
      })
      .catch(() => setTeams([]));
  }, []);
  const update = (field, value) =>
    setValues((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    if (!payload.team) delete payload.team;
    if (!payload.teamLead) delete payload.teamLead;
    if (!payload.joiningDate) delete payload.joiningDate;
    try {
      if (record?._id) await ApiService.updateEmployee(record._id, payload);
      else await ApiService.createEmployee(payload);
      await onSaved?.();
      dispatch(closeModal());
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit}>
      <Stack spacing={2} sx={{ p: 1, borderTop: "4px solid #006A9D" }}>
        <Typography variant="h6">
          {record ? "Edit Employee" : "Create Employee"}
        </Typography>
        <ReusableInput
          label="Employee ID"
          name="employeeId"
          value={values.employeeId}
          disabled={!record || Boolean(values.employeeId)}
          onChange={(e) => update("employeeId", e.target.value)}
        />
        <ReusableInput
          label="Name"
          name="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
        <ReusableInput
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        {!record && (
          <ReusableInput
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
        )}
        <ReusableInput
          label="Phone"
          name="phone"
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <CustomDropdown
          label="Department"
          name="department"
          value={values.department}
          options={departments}
          onChange={(value) => update("department", value)}
        />
        <CustomDropdown
          label="Designation"
          name="designation"
          value={values.designation}
          options={designations}
          onChange={(value) => update("designation", value)}
        />
        <CustomDropdown
          label="Role"
          name="role"
          value={values.role}
          options={roles}
          onChange={(value) => update("role", value)}
          required
        />
        <CustomDropdown
          label="Status"
          name="status"
          value={values.status}
          options={statuses}
          onChange={(value) => update("status", value)}
          required
        />
        <CustomDropdown
          label="Team"
          name="team"
          value={values.team}
          options={teams}
          onChange={(value) => update("team", value)}
        />
        <ReusableInput
          label="Team Lead ID"
          name="teamLead"
          value={values.teamLead}
          onChange={(e) => update("teamLead", e.target.value)}
        />
        <ReusableInput
          label="Joining Date"
          name="joiningDate"
          type="date"
          value={values.joiningDate}
          onChange={(e) => update("joiningDate", e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <ReusableButton
          title={
            saving
              ? "Saving..."
              : record
                ? "Update Employee"
                : "Create Employee"
          }
          type="submit"
          loading={saving}
          width="100%"
        />
      </Stack>
    </form>
  );
}
