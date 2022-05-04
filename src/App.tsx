import React from "react";
import "./App.css?v=1";
import { createTheme, ThemeProvider, Container } from "@mui/material";
import TrussForm from "./components/TrussForm";

const GLOBAL_THEME = createTheme({
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
    <Container maxWidth="md">
      <ThemeProvider theme={GLOBAL_THEME}>
        <TrussForm />
      </ThemeProvider>
    </Container>
  );
}

export default App;
export { GLOBAL_THEME };
