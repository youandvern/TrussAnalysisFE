import React from "react";
import "./style.css";
import { Grid, Button } from "@mui/material/";
import NumInput from "../NumInput";

// expected properties given to NumSlider
interface RowFormProps {
  formRef?: React.MutableRefObject<null>;
  onSubmit?: React.MouseEventHandler<HTMLButtonElement>;
  buttonTitle?: string;
  inputLabel1?: string;
  inputUnit1?: string;
  inputLabel2?: string;
  inputUnit2?: string;
}

// typical slider for discrete number inputs for concrete beam design form
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
        spacing={1}
        sx={{
          borderBottom: 1,
          paddingBottom: "1em",
          marginBottom: "1em",
          borderColor: "grey.600",
        }}
      >
        <Grid item xs={4}>
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
        <Grid item xs={4}>
          <NumInput label={inputLabel1} unit={inputUnit1} />
        </Grid>
        <Grid item xs={4}>
          <NumInput label={inputLabel2} unit={inputUnit2} />
        </Grid>
      </Grid>
    </form>
  );
}
