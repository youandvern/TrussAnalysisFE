import React from "react";
import "./App.css?v=1";
import { createTheme, ThemeProvider, Container } from "@mui/material";
import TrussForm from "./components/TrussForm";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#004aad",
      },
      secondary: {
        main: "#faa92f",
      },
    },
  });

  return (
    <Container maxWidth="md">
      <ThemeProvider theme={theme}>
        <TrussForm />
      </ThemeProvider>
    </Container>
  );
}

export default App;
