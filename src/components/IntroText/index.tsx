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
          <Typography variant="h5">Truss Analysis Tool:</Typography>

          <Typography>
            Welcome to the truss analysis tool! This is a simple, fast, and powerful tool for
            calculating the axial load demands for common truss styles including Pratt, Howe, and
            Warren Trusses. Please explore the tool and our other design software at:{" "}
            <a href="https://encompapp.com/">Encomp</a>. <br />
            <br />
            If you liked this tool or want to see new features added, please leave us a message at{" "}
            <a href="https://encompapp.com/contact">encompapp.com/contact</a>. We would love to hear
            from you!
            <br />
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
}
