import { Switch, Typography } from "@mui/material/";
import React from "react";

// expected properties given to Labeled Switch
interface LabeledSwitchProps {
  label: string;
  checked: boolean;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// typical switch with a label in front
export default function LabeledSwitch({ label, checked, handleChange }: LabeledSwitchProps) {
  return (
    <Typography variant="subtitle2" color="textSecondary">
      {label}
      <Switch checked={checked} onChange={handleChange} />
    </Typography>
  );
}
