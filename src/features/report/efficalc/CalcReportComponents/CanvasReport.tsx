import { Box } from "@mui/material";
import { Canvas } from "../CalculationRunTypes";
import { CALC_MARGIN, CalcTypography } from "./reportUtilities";

interface Props {
  item: Canvas;
}

export default function CanvasReport({ item }: Props) {
  return item.svg ? (
    <Box marginLeft={CALC_MARGIN} marginTop="0.5rem">
      <div dangerouslySetInnerHTML={{ __html: item.svg }} />
      {item.caption && (
        <CalcTypography
          textAlign={item.centered ? "center" : undefined}
          variant="caption"
          color="text.secondary"
          variantMapping={{ caption: "p" }}
        >
          {item.caption}
        </CalcTypography>
      )}
    </Box>
  ) : (
    <></>
  );
}
