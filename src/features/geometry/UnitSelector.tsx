import React from "react";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

interface UnitSelectorProps {
  unitType: string;
  handleChange?: (event: React.MouseEvent<HTMLElement>, value: any) => void;
}

// Toggle buttons to select the unit type for calculations: "us" or "metric"
export default function UnitSelector({ unitType, handleChange }: UnitSelectorProps) {
  return (
    <ToggleButtonGroup size="small" value={unitType} exclusive onChange={handleChange}>
      <ToggleButton value={US_UNIT}>US/Imperial</ToggleButton>
      <ToggleButton value={METRIC_UNIT}>Metric</ToggleButton>
    </ToggleButtonGroup>
  );
}

export const US_UNIT = "us";
export const METRIC_UNIT = "metric";

export const unitToLength = (unit?: string) => (unit === METRIC_UNIT ? "m" : "ft");
export const unitToInputLength = (unit?: string) => (unit === METRIC_UNIT ? "mm" : "in");
export const unitToForce = (unit?: string) => (unit === METRIC_UNIT ? "kN" : "kips");
export const unitToInputArea = (unit?: string) => (unit === METRIC_UNIT ? "mm^2" : "in^2");
export const unitToCalcStress = (unit?: string) => (unit === METRIC_UNIT ? "kN/m^2" : "ksf");
export const unitToInputStress = (unit?: string) => (unit === METRIC_UNIT ? "MPa" : "ksi");
export const unitToStressFactorInputToCalc = (unit?: string) => (unit === METRIC_UNIT ? 1000 : 144);
export const unitToAreaFactorInputToCalc = (unit?: string) =>
  unit === METRIC_UNIT ? 0.000001 : 1 / 144;
