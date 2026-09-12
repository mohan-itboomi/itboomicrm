import { useId, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FieldLabel from "./FieldLabel";
import { uploadMedia } from "../Api/ApiService";

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

const getFileName = (url) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop()) || "File";
  } catch {
    return "File";
  }
};

const isImageUrl = (url) =>
  /\.(avif|gif|jpe?g|jfif|png|svg|webp)(?:\?.*)?$/i.test(url);

export default function CustomMediaUploader({
  label = "Upload files",
  value = [],
  onChange,
  multiple = true,
  accept = "image/*,application/pdf",
  maxSizeMb = 5,
  maxFiles = 10,
  fieldName = "upload",
  required = false,
  disabled = false,
  helperText = "",
  error: externalError = false,
}) {
  const inputId = useId();
  const links = asArray(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const selectFiles = async (selectedFiles) => {
    const files = Array.from(selectedFiles || []);
    if (!files.length) return;

    const filesToUpload = multiple ? files : files.slice(0, 1);
    if (multiple && links.length + filesToUpload.length > maxFiles) {
      setErrorMessage(`You can upload up to ${maxFiles} files.`);
      return;
    }

    const oversizedFile = filesToUpload.find(
      (file) => file?.size > maxSizeMb * 1024 * 1024,
    );
    if (oversizedFile) {
      setErrorMessage(`${oversizedFile?.name} must be smaller than ${maxSizeMb} MB.`);
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setErrorMessage("");
      const response = await uploadMedia(
        filesToUpload,
        fieldName,
        (event) => {
          if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
        },
      );
      const uploadedLinks = asArray(response?.data?.link);
      if (!uploadedLinks.length) throw new Error("Upload response did not contain a file link.");
      onChange?.(multiple ? [...links, ...uploadedLinks] : uploadedLinks[0]);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.message || error?.message || "Unable to upload files.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index) => {
    const nextLinks = links.filter((_, itemIndex) => itemIndex !== index);
    onChange?.(multiple ? nextLinks : "");
  };

  return (
    <Box>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        id={inputId}
        hidden
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading}
        onChange={(event) => {
          selectFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Box
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) selectFiles(event.dataTransfer.files);
        }}
        sx={{
          minHeight: 112,
          border: `1px dashed ${externalError || errorMessage ? "#d32f2f" : "#94a3b8"}`,
          borderRadius: 2,
          bgcolor: "#f8fafc",
          p: 2,
        }}
      >
        <Stack alignItems="center" spacing={0.75}>
          {uploading ? <CircularProgress size={26} /> : <CloudUploadOutlinedIcon color="primary" />}
          <Typography fontWeight={600} fontSize={14}>
            {uploading ? "Uploading files..." : "Drop files here or browse"}
          </Typography>
          <Button
            component="label"
            htmlFor={inputId}
            size="small"
            disabled={disabled || uploading || (multiple && links.length >= maxFiles)}
          >
            Choose {multiple ? "files" : "file"}
          </Button>
          <Typography color="text.secondary" fontSize={11}>
            Maximum {maxSizeMb} MB per file{multiple ? ` · Up to ${maxFiles} files` : ""}
          </Typography>
        </Stack>
        {uploading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5 }} />}
      </Box>

      {links.length > 0 && (
        <Stack spacing={1} mt={1.5}>
          {links.map((link, index) => (
            <Stack
              key={`${link}-${index}`}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5, p: 1 }}
            >
              {isImageUrl(link) ? (
                <Box component="img" src={link} alt="Uploaded file" sx={{ width: 48, height: 48, objectFit: "cover", borderRadius: 1 }} />
              ) : (
                <InsertDriveFileOutlinedIcon color="action" sx={{ width: 48 }} />
              )}
              <Typography component="a" href={link} target="_blank" rel="noreferrer" fontSize={13} noWrap sx={{ flex: 1, color: "primary.main", textDecoration: "none" }}>
                {getFileName(link)}
              </Typography>
              <IconButton aria-label="Remove file" color="error" size="small" disabled={disabled || uploading} onClick={() => removeFile(index)}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}

      {(errorMessage || helperText) && (
        <FormHelperText error={Boolean(errorMessage || externalError)}>
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
