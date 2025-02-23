import { Box } from "@mui/material";
import { FigureBase } from "../CalculationRunTypes";
import { CALC_MARGIN, CalcTypography } from "./reportUtilities";

interface Props {
  item: FigureBase;
}

export default function FigureBaseReport({ item }: Props) {
  const altText = item.caption || "Calculation figure";
  return item.data ? (
    <Box marginLeft={CALC_MARGIN} marginTop="0.5rem">
      <img
        src={`data:image/png;base64,${item.data}`}
        alt={altText}
        style={{ maxWidth: "100%", width: item.isFullWidth ? "100%" : undefined }}
      />
      {item.caption && (
        <CalcTypography variant="caption" color="text.secondary" variantMapping={{ caption: "p" }}>
          {item.caption}
        </CalcTypography>
      )}
    </Box>
  ) : (
    <></>
  );
}
