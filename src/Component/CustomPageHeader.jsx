import { Box, Tooltip, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ReusableButton from "./ReusableButton";


const CustomPageHeader = ({
  title,
  subtitle,
  buttonText,
  buttonIcon,
  onButtonClick,
  onRefresh,
  refreshing = false,
  refreshDisabled = false,
  refreshUnavailable = "",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#1f2d3d",
            lineHeight: 1.1,
            letterSpacing: "-0.06em",
            fontSize: "20px",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              color: "#5f6b7a",
              fontSize: "0.9rem",
              mt: 0.8,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}
      >
        {(onRefresh || refreshUnavailable) && (
          <Tooltip
            title={
              refreshUnavailable ||
              (refreshDisabled
                ? "Select a site before refreshing"
                : "Reload current records")
            }
          >
            <span>
              <ReusableButton
                title={refreshing ? "Refreshing..." : "Refresh"}
                onClick={onRefresh}
                disabled={
                  refreshing || refreshDisabled || Boolean(refreshUnavailable)
                }
                startIcon={<RefreshIcon />}
                variant="outlined"
                width="auto"
              />
            </span>
          </Tooltip>
        )}
        {buttonText && (
          <ReusableButton
            title={buttonText}
            onClick={onButtonClick}
            width="auto"
            bg="#006A9D"
            textColor="#fff"
            startIcon={buttonIcon}
            sx={{ minHeight: 44, px: 2, fontSize: 14, fontWeight: 700 }}
          />
        )}
      </Box>
    </Box>
  );
};

export default CustomPageHeader;
