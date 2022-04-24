import React from "react";
import "./style.css";
import { Typography, Switch } from "@mui/material/";

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
