import React from "react";
import "./style.css";
import { FormControl, InputLabel, OutlinedInput, InputAdornment } from "@mui/material/";

// expected properties given to NumInput
interface NumProps {
  label?: string;
  value?: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

// typical number input for concrete beam design form
export default function NumInput({
  label = "label",
  value,
  onChange,
  unit = "in",
  min = 0,
  max = 10,
  step = 1,
}: NumProps) {
  return (
    // outlined group of label and input
    <FormControl fullWidth variant="outlined">
      <InputLabel>{label}</InputLabel>
      <OutlinedInput
        label={label}
        name={label}
        value={value}
        // change the value whenever the input is changed (restrict within min/max bounds)
        onChange={onChange}
        // add unit to the end
        endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
        aria-describedby="standard-weight-helper-text"
        type="number"
        inputProps={{
          min: min,
          max: max,
          step: step,
        }}
      />
    </FormControl>
  );
}

// typical number input for concrete beam design form
export function NumInputSimple({ value = 0, onChange, unit, min, max, step }: NumProps) {
  return (
    // outlined group of label and input
    <OutlinedInput
      value={value}
      // change the value whenever the input is changed (restrict within min/max bounds)
      onChange={onChange}
      // add unit to the end
      endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
      aria-describedby="standard-weight-helper-text"
      type="number"
      inputProps={{
        min: min,
        max: max,
        step: step,
      }}
    />
  );
}