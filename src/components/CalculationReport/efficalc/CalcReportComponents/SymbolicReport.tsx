import { Box } from "@mui/material";
import { Symbolic } from "../CalculationRunTypes";
import {
  CALC_MARGIN,
  CalcTypography,
  addReference,
  wrapMathEquationString,
  wrapMathString,
} from "./reportUtilities";

const composeCalcVariable = (content: JSX.Element, description?: string, reference?: string) => (
  <Box marginLeft={CALC_MARGIN} marginTop="0.25rem">
    {description && <CalcTypography marginTop="0.5rem">{description}:</CalcTypography>}
    {addReference(content, reference)}
  </Box>
);

const SymbolicToNode = (sym: Symbolic) => {
  const tex = `${sym.name} ${sym.symbolic}`;

  const node = (
    <CalcTypography>
      {sym.calcLength === "short" ? wrapMathString(tex) : wrapMathEquationString(tex)}
    </CalcTypography>
  );
  return composeCalcVariable(node, sym.description, sym.reference);
};

interface Props {
  item: Symbolic;
}

export default function SymbolicReport({ item }: Props) {
  return item.name || item.symbolic ? SymbolicToNode(item) : <></>;
}
