import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export type TrussCategory = "bridge" | "roof" | "custom";

interface Props {
  category: TrussCategory;
  handleChange?: (event: React.MouseEvent<HTMLElement>, value: TrussCategory) => void;
}

export default function TrussCategorySelector({ category, handleChange }: Props) {
  return (
    <ToggleButtonGroup
      size="small"
      value={category}
      exclusive
      onChange={handleChange}
      sx={{ margin: 1 }}
    >
      <ToggleButton value={"bridge" as TrussCategory}>Bridge</ToggleButton>
      <ToggleButton value={"roof" as TrussCategory}>Roof</ToggleButton>
      <ToggleButton value={"custom" as TrussCategory}>Custom</ToggleButton>
    </ToggleButtonGroup>
  );
}
