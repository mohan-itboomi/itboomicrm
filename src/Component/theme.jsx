import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.04em" },
    h2: { fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontWeight: 800, letterSpacing: "-0.03em" },
    h4: { fontWeight: 800, letterSpacing: "-0.025em" },
  },
  palette: {
    primary: {
      main: "#006A9D",
      dark: "#00557E",
      light: "#E6F3F8",
      contrastText: "#ffffff",
    },
    error: {
      main: "#EC0033",
      dark: "#C9002B",
    },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { border: "1px solid #E2E8F0", boxShadow: "0 8px 28px rgba(15, 23, 42, 0.05)" } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 8px 28px rgba(15, 23, 42, 0.05)" } } },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,106,157,0.2)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          backgroundColor: "#fff",

          "& fieldset": {
            borderColor: "#D1D5DB",
          },

          "&:hover fieldset": {
            borderColor: "#006A9D",
          },

          "&.Mui-focused fieldset": {
            borderColor: "#006A9D",
            borderWidth: 2,
          },
        },
        input: {
          fontSize: "14px",
          padding: "12px 14px",
        },
      },
    },
  },
});

export default theme;
