import { Chip } from "@mui/material";

const colors = {
  Active: "success",
  Running: "success",
  Approved: "success",
  Delivered: "success",
  Paid: "success",
  Resolved: "success",
  In: "success",
  Pending: "warning",
  Processing: "info",
  Partial: "info",
  Open: "warning",
  Completed: "info",
  Measurement: "info",
  Rejected: "error",
  Overdue: "error",
  Inactive: "default",
  Billed: "default",
  Out: "default",
  Planned: "default",
  "In Progress": "info",
  Blocked: "error",
  Passed: "success",
  Retest: "warning",
  Cancelled: "error",
};

export default function StatusChip({ value }) {
  return (
    <Chip
      label={value || "-"}
      size="small"
      color={colors[value] || "default"}
      variant="outlined"
    />
  );
}
