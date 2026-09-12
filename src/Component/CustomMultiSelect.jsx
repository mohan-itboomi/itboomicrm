import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";

const getOptionValue = (option) => option?.value ?? option?.id ?? option?._id;
const getOptionLabel = (option) => option?.label ?? option?.name ?? "";

export default function CustomMultiSelect({
  label,
  value = [],
  options = [],
  onChange,
  onSearch,
  fullWidth = true,
  placeholder = "Select options",
  disabled = false,
  error = false,
  helperText = "",
  size = "small",
  required = false,
  name,
}) {
  const selectedOptions = value
    .map((selectedValue) => options.find(
      (option) => String(getOptionValue(option)) === String(selectedValue),
    ))
    .filter(Boolean);

  return (
    <FormControl fullWidth={fullWidth} error={error} disabled={disabled}>
      {label && (
        <Typography component="label" htmlFor={name} sx={{ mb: 1, fontSize: 14, fontWeight: 500, color: "#374151" }}>
          {label}
          {required && <Box component="span" sx={{ color: "error.main", ml: 0.5 }}>*</Box>}
        </Typography>
      )}
      <Autocomplete
        multiple
        disableCloseOnSelect
        filterOptions={onSearch ? (items) => items : undefined}
        options={options}
        value={selectedOptions}
        disabled={disabled}
        size={size}
        onInputChange={(_event, inputValue, reason) => {
          if (reason === "input" || reason === "clear") onSearch?.(inputValue);
        }}
        onChange={(_event, selected) => onChange(selected?.map(getOptionValue) || [])}
        getOptionLabel={(option) => String(getOptionLabel(option))}
        isOptionEqualToValue={(option, selected) =>
          String(getOptionValue(option)) === String(getOptionValue(selected))
        }
        renderOption={(props, option, { selected }) => {
          const { key, ...optionProps } = props;
          return (
            <li key={key} {...optionProps}>
              <Checkbox checked={selected} sx={{ mr: 1 }} />
              {getOptionLabel(option)}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} id={name} name={name} placeholder={value.length ? "" : placeholder} error={error} />
        )}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
