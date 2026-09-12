import { Typography } from "@mui/material";

const FieldLabel = ({ children, required = false }) => {
  return (
    <Typography
      sx={{
        mb: 1,
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151",
      }}
    >
      {children}
      {required && <span style={{ color: "red" }}> *</span>}
    </Typography>
  );
};

export default FieldLabel;