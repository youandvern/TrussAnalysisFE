import React from "react";
import "./style.css";
import { Grid, Button } from "@mui/material/";
import NumInput from "../NumInput";

interface RowFormProps {
  formRef?: React.MutableRefObject<null>;
  onSubmit?: React.MouseEventHandler<HTMLButtonElement>;
  buttonTitle?: string;
  inputLabel1?: string;
  inputUnit1?: string;
  inputLabel2?: string;
  inputUnit2?: string;
}

// Single row form with submit button and two inputs evenly spaced full width
export default function RowForm({
  formRef,
  onSubmit,
  buttonTitle = "Submit",
  inputLabel1 = "Input 1",
  inputUnit1,
  inputLabel2 = "Input 2",
  inputUnit2,
}: RowFormProps) {
  return (
    <form ref={formRef}>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={2}
        sx={{
          borderBottom: 1,
          paddingBottom: "1em",
          marginBottom: "1em",
          borderColor: "grey.600",
        }}
      >
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            onClick={onSubmit}
            sx={{ height: "100%" }}
          >
            {buttonTitle}
          </Button>
        </Grid>
        <Grid item xs={6} sm={4}>
          <NumInput label={inputLabel1} unit={inputUnit1} />
        </Grid>
        <Grid item xs={6} sm={4}>
          <NumInput label={inputLabel2} unit={inputUnit2} />
        </Grid>
      </Grid>
    </form>
  );
}
