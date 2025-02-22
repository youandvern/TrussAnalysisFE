import { Box, Stack } from "@mui/material";
import { InputVariable } from "../CalculationRunTypes";
import { CALC_MARGIN, CalcTypography, wrapMathString } from "./reportUtilities";

interface Props {
  item: InputVariable;
}

export default function DeclareVariableReport({ item }: Props) {
  return item.tex ? (
    <Stack direction="row" justifyContent="flex-start" marginLeft={CALC_MARGIN}>
      {item.description ? (
        <CalcTypography width="350px">{item.description};</CalcTypography>
      ) : (
        <Box width="20px"></Box>
      )}
      <CalcTypography display="inline-block" lineHeight={1} marginBottom="1em">
        {wrapMathString(item.tex)}
      </CalcTypography>
    </Stack>
  ) : (
    <></>
  );
}
