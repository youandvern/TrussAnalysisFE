import React, { useState } from "react";
import "./App.css?v=1";
import { createTheme, ThemeProvider, Container } from "@mui/material";
import TrussForm from "./components/TrussForm";
import ApiGeometry from "./components/Interfaces/ApiGeometry";
import HomeBar from "./components/HomeBar";
import IntroText from "./components/IntroText";

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

  const [showResult, setShowResult] = useState(false);
  const [getResults, setResults] = useState<ApiGeometry>();

  return (
    <Container maxWidth="md">
      <ThemeProvider theme={theme}>
        <HomeBar />
        <IntroText />
        <TrussForm />
      </ThemeProvider>
    </Container>
  );
}

export default App;
