import { Box, Divider, Typography } from "@mui/material";
import { formatIndianDateTime } from "../Utils/formatDateTime";

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (value) => value.toUpperCase());

const formatValue = (key, value) => {
  if ((key === "status" || key === "isActive") && typeof value === "boolean") {
    return value ? "Active" : "Inactive";
  }
  if (["dateAndTime", "dateTime", "createdAt", "updatedAt"].includes(key)) {
    return formatIndianDateTime(value);
  }
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function RecordDetailsModal({
  record = {},
  hiddenFields = ["id", "_id", "createdAt", "updatedAt", "__v", "v"],
}) {
  const entries = Object.entries(record).filter(
    ([key]) => !hiddenFields.includes(key),
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 0,
        border: "1px solid #E2E8F0",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {entries.map(([key, value], index) => (
        <Box key={key} sx={{ p: 2, bgcolor: index % 2 ? "#F8FAFC" : "#fff" }}>
          <Typography
            variant="caption"
            sx={{ color: "#64748B", fontWeight: 700 }}
          >
            {formatLabel(key)}
          </Typography>
          <Typography
            sx={{ color: "#0F172A", mt: 0.5, wordBreak: "break-word" }}
          >
            {formatValue(key, value)}
          </Typography>
          <Divider sx={{ display: "none" }} />
        </Box>
      ))}
    </Box>
  );
}
