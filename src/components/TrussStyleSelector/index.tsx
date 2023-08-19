import React from "react";
import {
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Container,
  useMediaQuery,
  Theme,
} from "@mui/material/";
import { grey } from "@mui/material/colors";

interface TrussType {
  type: string;
  label: string;
}

const ROOF_TRUSS_TYPES = [
  { type: "PrattRoofTruss", label: "Pratt Roof" },
  { type: "HoweRoofTruss", label: "Howe Roof" },
  { type: "FinkRoofTruss", label: "Fink Roof" },
  { type: "ParallelChordRoofTruss", label: "Parallel Chord Roof" },
];
const BRIDGE_TRUSS_TYPES = [
  { type: "PrattBridgeTruss", label: "Pratt Bridge" },
  { type: "HoweBridgeTruss", label: "Howe Bridge" },
  { type: "WarrenBridgeTruss", label: "Warren Bridge" },
  { type: "ScissorTruss", label: "Scissor Truss" },
];

const SMALL_SCREEN_TYPE_GROUPS = [
  [BRIDGE_TRUSS_TYPES[0], ROOF_TRUSS_TYPES[0]],
  [BRIDGE_TRUSS_TYPES[1], ROOF_TRUSS_TYPES[1]],
  [BRIDGE_TRUSS_TYPES[2], ROOF_TRUSS_TYPES[2]],
  [BRIDGE_TRUSS_TYPES[3], ROOF_TRUSS_TYPES[3]],
];

export const TRUSS_TYPES = [...BRIDGE_TRUSS_TYPES, ...ROOF_TRUSS_TYPES] as TrussType[];

interface StyleSelectorProps {
  trussType: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Radio buttons to select the truss style
export default function TrussStyleSelector({ trussType, handleChange }: StyleSelectorProps) {
  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const typeGroupings = smallScreen
    ? SMALL_SCREEN_TYPE_GROUPS
    : [ROOF_TRUSS_TYPES, BRIDGE_TRUSS_TYPES];

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
    <Container
      sx={{
        width: "100%",
        color: grey[400],
        border: 2,
        borderRadius: 3,
        padding: " 0.5em",
        "& .MuiFormGroup-root": {
          color: "black",
        },
      }}
      className="outlined-form-control"
    >
      <FormLabel id="choose-truss-style-buttons" sx={{ marginLeft: "1em", fontWeight: "bold" }}>
        Choose Truss Style:
      </FormLabel>
      <RadioGroup
        value={trussType}
        onChange={handleChange}
        aria-labelledby="choose-truss-style-buttons"
      >
        {typeGroupings.map((trussTypeGroup, index) => (
          <Container
            key={`grouping-${index}`}
            sx={{ display: "flex", justifyContent: "space-around" }}
          >
            {groupedButtons(trussTypeGroup)}
          </Container>
        ))}
      </RadioGroup>
    </Container>
  );
}
