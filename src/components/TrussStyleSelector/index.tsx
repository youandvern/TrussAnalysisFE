import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
} from "@mui/material/";
import { grey } from "@mui/material/colors";

interface TrussType {
  type: string;
  label: string;
}

export const TRUSS_TYPES = [
  { type: "PrattBridgeTruss", label: "Pratt Bridge" },
  { type: "PrattRoofTruss", label: "Pratt Roof" },
  { type: "HoweBridgeTruss", label: "Howe Bridge" },
  { type: "HoweRoofTruss", label: "Howe Roof" },
  { type: "FinkRoofTruss", label: "Fink Roof" },
  { type: "WarrenBridgeTruss", label: "Warren Bridge" },
] as TrussType[];

interface StyleSelectorProps {
  trussType: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Radio buttons to select the truss style
export default function TrussStyleSelector({ trussType, handleChange }: StyleSelectorProps) {
  const roofTypes = TRUSS_TYPES.filter((typeName) => typeName.type.includes("Roof"));
  const bridgeTypes = TRUSS_TYPES.filter((typeName) => typeName.type.includes("Bridge"));
  const groupedButtons = (typeList: TrussType[]) =>
    typeList.map((eachType) => (
      <FormControlLabel
        value={eachType.type}
        control={<Radio key={`radio-${eachType.type}`} />}
        label={eachType.label}
        key={`typeLabel-${eachType.type}`}
      />
    ));
  return (
    <FormControl
      sx={{
        width: "100%",
        borderColor: grey[400],
        border: 1,
        borderRadius: 3,
      }}
    >
      <FormLabel id="choose-truss-style-buttons" sx={{ marginLeft: "1em" }}>
        Choose Truss Style:
      </FormLabel>
      <RadioGroup
        value={trussType}
        onChange={handleChange}
        aria-labelledby="choose-truss-style-buttons"
      >
        <Container sx={{ display: "flex", justifyContent: "space-around" }}>
          {groupedButtons(roofTypes)}
        </Container>
        <Container sx={{ display: "flex", justifyContent: "space-around" }}>
          {groupedButtons(bridgeTypes)}
        </Container>
      </RadioGroup>
    </FormControl>
  );
}
