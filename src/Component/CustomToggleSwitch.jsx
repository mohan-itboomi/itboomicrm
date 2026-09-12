import { FormControlLabel, Switch, Typography } from "@mui/material";

export default function CustomToggleSwitch({
  checked = false,
  onChange,
  label,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  disabled = false,
  size = "small",
}) {
  const text = label ?? (checked ? activeLabel : inactiveLabel);

  return (
    <FormControlLabel
      sx={{ m: 0, gap: 0.5 }}
      control={
        <Switch
          size={size}
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked, event)}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "#16A34A" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              bgcolor: "#22C55E",
              opacity: 0.55,
            },
          }}
        />
      }
      label={
        <Typography sx={{ fontSize: 13, color: "#475569" }}>{text}</Typography>
      }
    />
  );
}
