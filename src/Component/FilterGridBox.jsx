import { Box, Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const FilterGridBox = ({ children, onReset, sx = {} }) => {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 2,

        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2,

        backgroundColor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        borderRadius: "10px",

        boxShadow: `
          0 1px 2px rgba(0, 0, 0, 0.03),
          0 4px 12px rgba(0, 0, 0, 0.04)
        `,

        "& > *": {
          minWidth: 0,
        },

        ...sx,
      }}
    >
      {children}
      {onReset && (
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            fullWidth
            sx={{ minHeight: 38, textTransform: "none", borderRadius: "10px" }}
          >
            Reset Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FilterGridBox;
