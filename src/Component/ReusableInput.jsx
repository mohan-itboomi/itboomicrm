import React from "react";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
const theme = { primarycolor: "#006A9D", primaryHover: "#00557E" };
const durationToClock = value => { const totalSeconds = Math.max(0, Number(value) || 0) * 60; const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; };
const clockToMinutes = value => { const [hours = 0, minutes = 0, seconds = 0] = String(value || "00:00:00").split(":").map(Number); return Math.ceil((hours * 3600 + minutes * 60 + seconds) / 60); };

const ReusableInput = React.memo(({
  label,
  placeholder,
  type = "text",
  name,
  value = "",
  onChange,
  onBlur,
  error = false,
  helperText = "",
  disabled = false,
  required = false,
  fullWidth = true,
  size = "medium",
  variant = "outlined",
  sx = {},
  labelSx = {},
  InputProps,
  inputProps,
  slotProps,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const hasCustomPasswordToggle = Boolean(InputProps?.endAdornment);
  const showPasswordToggle = type === "password" && !hasCustomPasswordToggle;
  const inputType = showPasswordToggle && passwordVisible ? "text" : type;
  const isDurationField = label === "Estimated Minutes" || label === "Estimated duration (minutes)";
  const durationValue = isDurationField ? durationToClock(value) : value;
  const [durationText, setDurationText] = React.useState(durationValue);
  React.useEffect(() => { if (isDurationField) setDurationText(durationValue); }, [durationValue, isDurationField]);

  const resolvedInputProps = showPasswordToggle
    ? {
        ...InputProps,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              title={passwordVisible ? "Hide password" : "Show password"}
              onClick={() => setPasswordVisible((visible) => !visible)}
              onMouseDown={(event) => event.preventDefault()}
              edge="end"
              size="small"
              sx={{ color: passwordVisible ? theme?.primarycolor : "#70838F" }}
            >
              {passwordVisible ? (
                <VisibilityOffOutlinedIcon fontSize="small" />
              ) : (
                <VisibilityOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </InputAdornment>
        ),
      }
    : InputProps;

  return (
    <Box>
      {label && (
        <Typography
          component="label"
          htmlFor={name}
          sx={{
            mb: 1,
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#374151",
            ...labelSx,
          }}
        >
          {label}

          {required && (
            <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>
              *
            </Box>
          )}
        </Typography>
      )}

      <TextField
        {...props}
        id={name}
        placeholder={placeholder}
        type={isDurationField ? "text" : inputType}
        name={name}
        value={isDurationField ? durationText : value ?? ""}
        onChange={isDurationField ? event => { const nextValue = event.target.value; setDurationText(nextValue); if (/^\d{2}:\d{2}:\d{2}$/.test(nextValue)) onChange?.({ ...event, target: { ...event.target, value: clockToMinutes(nextValue) } }); } : onChange}
        onBlur={onBlur}
        error={error}
        helperText={helperText}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        size={size}
        variant={variant}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            ...resolvedInputProps,
          },
          htmlInput: {
            ...slotProps?.htmlInput,
            ...inputProps,
            ...(isDurationField
              ? { inputMode: "numeric", pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}" }
              : {}),
          },
        }}
        autoComplete="off"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "2px",
            backgroundColor: "#fff",
            minHeight: "38px",

            "& fieldset": {
              borderColor: "#D1D5DB",
            },

            "&:hover fieldset": {
              borderColor: `${theme?.primaryHover}`,
            },

            "&.Mui-focused fieldset": {
              borderColor: `${theme?.primarycolor}`,
              borderWidth: 2,
            },
          },

          "& .MuiInputBase-input": {
            fontSize: "14px",
            padding: "8px 12px",
          },

          ...sx,
        }}
      />
    </Box>
  );
});

export default ReusableInput;
