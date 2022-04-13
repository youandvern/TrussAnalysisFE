import React from "react";
import "./style.css";
import { Container, Grid, Typography } from "@mui/material/";

// Home bar with logo nad menu options
export default function IntroText() {
  return (
    <Container maxWidth="md" className="main-text-container">
      <Grid container>
        <Grid item xs={1}></Grid>

        <Grid item xs={10}>
          <Typography variant="h5">Pratt Roof Truss Analysis Tool:</Typography>

          <Typography>
            Welcome to the analysis tool. A simple, fast, and powerful tool for getting the axial
            load demands for a pratt-style roof truss. Please explore the tool and our open source
            calculation building application, <a href="https://encompapp.com/">Encomp</a>. <br />
            <br />
            If you liked the tool or want to see other features added, please leave us a message at{" "}
            <a href="https://encompapp.com/contact">encompapp.com/contact</a>, we would love to hear
            from you!
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
