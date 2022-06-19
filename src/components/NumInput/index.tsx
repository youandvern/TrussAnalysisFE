import React from "react";
import "./style.css";
import { FormControl, InputLabel, OutlinedInput, InputAdornment, Tooltip } from "@mui/material/";

// expected properties given to NumInput
interface NumProps {
  label?: string;
  value?: number;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  unit?: string;
  toolTip?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

// typical number input for concrete beam design form
export default function NumInput({
  label = "label",
  value,
  onChange,
  toolTip,
  unit = "in",
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
}: NumProps) {
  return (
    // outlined group of label and input
    <Tooltip title={toolTip || ""} followCursor enterDelay={700}>
      <FormControl fullWidth variant="outlined" disabled={disabled}>
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
    </Tooltip>
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
