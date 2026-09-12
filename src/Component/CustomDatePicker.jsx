import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Typography } from "@mui/material";

const CustomDatePicker = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disableFuture = false,
  disabled = false,
  required = false,
  error = false,
  helperText = "",
  placeholder = "DD/MM/YYYY",
  format = "DD/MM/YYYY",
}) => {
  return (
    <div>
      {label && <Typography sx={{ mb: 0.5 }}>{label}</Typography>}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value ? dayjs(value) : null}
          onChange={(newValue) => onChange(newValue)}
          format={format}
          minDate={minDate ? dayjs(minDate) : undefined}
          maxDate={maxDate ? dayjs(maxDate) : undefined}
          disableFuture={disableFuture}
          disabled={disabled}
          slotProps={{
            textField: {
              fullWidth: true,
              required,
              error,
              helperText,
              size: "small",
              placeholder,

              sx: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px !important",
                  overflow: "hidden",

                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: "20px !important",
                    borderColor: "#D1D5DB",
                  },

                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2563EB",
                  },

                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2563EB",
                    borderWidth: "2px",
                  },

                  "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d32f2f",
                  },
                },

                "& .MuiOutlinedInput-input": {
                  padding: "12px 14px",
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default CustomDatePicker;
