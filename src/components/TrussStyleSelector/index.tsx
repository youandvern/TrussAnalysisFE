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
import TrussCategorySelector, { TrussCategory } from "../TrussCategorySelector";

interface TrussType {
  type: string;
  label: string;
}

export const ROOF_TRUSS_TYPES: TrussType[] = [
  { type: "PrattRoofTruss", label: "Pratt Roof" },
  { type: "HoweRoofTruss", label: "Howe Roof" },
  { type: "FinkRoofTruss", label: "Fink Roof" },
  { type: "ScissorTruss", label: "Scissor Truss" },
  { type: "ParallelChordRoofTruss", label: "Parallel Chord Roof" },
];
export const BRIDGE_TRUSS_TYPES: TrussType[] = [
  { type: "PrattBridgeTruss", label: "Pratt Bridge" },
  { type: "HoweBridgeTruss", label: "Howe Bridge" },
  { type: "WarrenBridgeTruss", label: "Warren Bridge" },
];

export const TRUSS_TYPES = [...BRIDGE_TRUSS_TYPES, ...ROOF_TRUSS_TYPES] as TrussType[];

const SMALL_ROOF = [
  [ROOF_TRUSS_TYPES[0], ROOF_TRUSS_TYPES[1]],
  [ROOF_TRUSS_TYPES[2], ROOF_TRUSS_TYPES[3]],
  [ROOF_TRUSS_TYPES[4]],
];

const BIG_ROOF = [
  [ROOF_TRUSS_TYPES[0], ROOF_TRUSS_TYPES[1], ROOF_TRUSS_TYPES[2]],
  [ROOF_TRUSS_TYPES[3], ROOF_TRUSS_TYPES[4]],
];

const SMALL_BRIDGE = [[BRIDGE_TRUSS_TYPES[0]], [BRIDGE_TRUSS_TYPES[1]], [BRIDGE_TRUSS_TYPES[2]]];

const BIG_BRIDGE = [BRIDGE_TRUSS_TYPES];

function getTypeGrouping(isSmallScreen: boolean, category: TrussCategory) {
  if (category === "bridge") {
    return isSmallScreen ? SMALL_BRIDGE : BIG_BRIDGE;
  } else if (category === "roof") {
    return isSmallScreen ? SMALL_ROOF : BIG_ROOF;
  }
  return null;
}

interface StyleSelectorProps {
  trussCategory: TrussCategory;
  handleTrussCategoryChange: (event: React.MouseEvent<HTMLElement>, value: TrussCategory) => void;
  trussType: string;
  handleChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Radio buttons to select the truss style
export default function TrussStyleSelector({
  trussCategory,
  handleTrussCategoryChange,
  trussType,
  handleChange,
}: StyleSelectorProps) {
  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const typeGroupings = getTypeGrouping(smallScreen, trussCategory);

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
        Choose Truss Style:{" "}
        <TrussCategorySelector category={trussCategory} handleChange={handleTrussCategoryChange} />
      </FormLabel>
      <RadioGroup
        value={trussType}
        onChange={handleChange}
        aria-labelledby="choose-truss-style-buttons"
      >
        {typeGroupings &&
          typeGroupings.map((trussTypeGroup, index) => (
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
