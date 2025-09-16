import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#09404B", // blu MUI default
      contrastText: "#fff",
    },
    secondary: {
      main: "#9c27b0", // viola MUI default
      contrastText: "#fff",
    },
    error: {
      main: "#d32f2f",
    },
    warning: {
      main: "#ed6c02",
    },
    info: {
      main: "#0288d1",
    },
    success: {
      main: "#2e7d32",
    },
    background: {
      default: "#F2F4F8", //"#f5f5f5",
      paper: "#fff",
    },
    text: {
      //primary: "rgba(0,0,0,0.87)",
      //secondary: "rgba(0,0,0,0.6)",
      //disabled: "rgba(0,0,0,0.38)",
    },
  },

});

export default theme;