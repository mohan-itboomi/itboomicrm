import { useId, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FieldLabel from "./FieldLabel";

export default function CustomImageUploader({
  label = "Profile image",
  value = "",
  onChange,
  required = false,
  maxSizeMb = 2,
  disabled = false,
}) {
  const inputId = useId();
  const [error, setError] = useState("");

  const selectFile = (file) => {
    if (!file) return;
    if (!file?.type?.startsWith("image/")) {
      setError("Select a JPG, PNG, WEBP, or other image file.");
      return;
    }
    if (file?.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMb} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      onChange?.(reader.result);
    };
    reader.onerror = () => setError("Unable to read this image.");
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (!disabled) selectFile(event.dataTransfer.files[0]);
  };

  return (
    <Box>
      <FieldLabel required={required}>{label}</FieldLabel>
      <Box
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        sx={{
          minHeight: 126,
          border: `1px dashed ${error ? "#d32f2f" : "#94a3b8"}`,
          borderRadius: 2,
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          p: 2,
        }}
      >
        <input
          id={inputId}
          hidden
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={(event) => {
            selectFile(event.target.files[0]);
            event.target.value = "";
          }}
        />
        {value ? (
          <Stack direction="row" alignItems="center" spacing={2} width="100%">
            <Avatar
              src={value}
              alt="Profile preview"
              sx={{ width: 76, height: 76 }}
            />
            <Box flex={1}>
              <Typography fontWeight={600} fontSize={14}>
                Profile image selected
              </Typography>
              <Typography color="text.secondary" fontSize={12} mb={1}>
                JPG, PNG or WEBP up to {maxSizeMb} MB
              </Typography>
              <Button
                component="label"
                htmlFor={inputId}
                size="small"
                variant="outlined"
                disabled={disabled}
              >
                Replace
              </Button>
            </Box>
            <IconButton
              aria-label="Remove image"
              color="error"
              disabled={disabled}
              onClick={() => {
                setError("");
                onChange?.("");
              }}
            >
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={0.75} width="100%">
            <CloudUploadOutlinedIcon color="primary" />
            <Typography fontWeight={600} fontSize={14}>
              Drop image here
            </Typography>
            <Button
              component="label"
              htmlFor={inputId}
              size="small"
              variant="text"
              disabled={disabled}
            >
              Browse image
            </Button>
            <Typography color="text.secondary" fontSize={11}>
              Maximum {maxSizeMb} MB
            </Typography>
          </Stack>
        )}
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
