import { Button, CircularProgress } from "@mui/material";

const ReusableButton = ({
  title,
  onClick,
  type = "button",
  variant = "contained",
  color = "primary", 
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  size = "medium",
  width = "auto",
  bg,
  textColor,
  sx = {},
  ...props
}) => {
  const contained = variant === "contained";
  const isError = color === "error";
  const brandColor = isError ? "#EC0033" : "#006A9D";
  const brandHover = isError ? "#C9002B" : "#00557E";
  const buttonBackground = bg ?? (contained ? brandColor : "transparent");
  const buttonColor = textColor ?? (contained ? "#fff" : brandColor);

  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={!loading ? startIcon : null}
      endIcon={!loading ? endIcon : null}
      size={size}
      sx={{
        textTransform: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: 600,
        py: 1,
        width,
        boxShadow: "none",

        // Dynamic colors
        backgroundColor: buttonBackground,
        color: buttonColor,
        borderColor: variant === "outlined" ? buttonColor : undefined,

        "&:hover": {
          backgroundColor: contained
            ? (bg ? buttonBackground : brandHover)
            : isError ? "rgba(236,0,51,0.07)" : "rgba(0,106,157,0.07)",
          borderColor: variant === "outlined" ? buttonColor : undefined,
          boxShadow: contained ? "0 4px 12px rgba(0,106,157,0.2)" : "none",
        },

        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress size={22} color="inherit" />
      ) : (
        title
      )}
    </Button>
  );
};

export default ReusableButton;
