import React from "react";
import "./App.css?v=1";
import { createTheme, ThemeProvider, Container } from "@mui/material";
import TrussForm from "./components/TrussForm";

const GLOBAL_THEME = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: "#004aad",
    },
    secondary: {
      main: "#faa92f",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={GLOBAL_THEME}>
      <Container maxWidth="md">
        <TrussForm />
      </Container>
    </ThemeProvider>
  );
}

export default App;
export { GLOBAL_THEME };
