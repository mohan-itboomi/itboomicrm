import {
  Autocomplete,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
  Box,
} from "@mui/material";

const getOptionValue = (option) => option?.value ?? option?.id ?? option?._id;
const getOptionLabel = (option) => option?.label ?? option?.name ?? "";

const CustomDropdown = ({
  label,
  value = "",
  options = [],
  onChange,
  onSearch,
  placeholder = "Select an option",
  fullWidth = true,
  disabled = false,
  error = false,
  helperText = "",
  size = "small",
  labelSx = {},
  required = false,
  name,
}) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={error}
      disabled={disabled}
      sx={{display:"flex",gap:0}}
    >
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

      <Autocomplete
        id={name}
        options={options}
        value={
          options.find((option) => getOptionValue(option) === value) || null
        }
        onChange={(_event, option) =>
          onChange(option ? getOptionValue(option) : "")
        }
        onInputChange={(_event, inputValue, reason) => {
          if (reason === "input" || reason === "clear") onSearch?.(inputValue);
        }}
        filterOptions={onSearch ? (items) => items : undefined}
        getOptionLabel={(option) => String(getOptionLabel(option))}
        isOptionEqualToValue={(option, selected) =>
          getOptionValue(option) === getOptionValue(selected)
        }
        disabled={disabled}
        fullWidth={fullWidth}
        size={size}
        autoHighlight
        noOptionsText="No matching options"
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            placeholder={placeholder}
            error={error}
            inputProps={{
              ...params?.inputProps,
              autoComplete: "off",
            }}
          />
        )}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "2px",
            height: "38px !important ",
            paddingTop: "0",
            paddingBottom: "0",
            backgroundColor:"white"
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D1D5DB",
          },

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563EB",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#2563EB",
            borderWidth: 2,
          },

          "& .MuiInputBase-input": {
            padding: "7px 10px !important",
          },
        }}
      />

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CustomDropdown;
