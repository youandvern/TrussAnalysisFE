import { Box, styled, SxProps, Theme } from "@mui/material";
import { useEffect, useState } from "react";
import { updateMathJax } from "../../../shared/mathjaxSetup";
import AssumptionReport from "./CalcReportComponents/AssumptionReport";
import BodyHeaderReport from "./CalcReportComponents/BodyHeaderReport";
import BodyTextReport from "./CalcReportComponents/BodyTextReport";
import CalcTitleReport from "./CalcReportComponents/CalcTitleReport";
import CalcVariableReport from "./CalcReportComponents/CalcVariableReport";
import CanvasReport from "./CalcReportComponents/CanvasReport";
import CheckVariableReport from "./CalcReportComponents/CheckVariableReport";
import CheckVariablesTextReport from "./CalcReportComponents/CheckVariablesTextReport";
import DeclareVariableReport from "./CalcReportComponents/DeclareVariableReport";
import FigureBaseReport from "./CalcReportComponents/FigureBaseReport";
import SymbolicReport from "./CalcReportComponents/SymbolicReport";
import TableReport from "./CalcReportComponents/TableReport";
import { CalcTypography, getCalcKey } from "./CalcReportComponents/reportUtilities";
import {
  Assumption,
  BodyHeading,
  CalcTable,
  CalcTypeToParse,
  CalculationTitle,
  CalcVariable,
  Canvas,
  Comparison,
  ComparisonForced,
  FigureBase,
  InputVariable,
  Symbolic,
  TextBlock,
} from "./CalculationRunTypes";

const headLevelToFontSize = {
  1: "2rem",
  2: "1.75rem",
  3: "1.55rem",
  4: "1.4rem",
  5: "1.25rem",
} as {
  [key: number]: string;
};

const getFontSizeForHeadLevel = (level: number) =>
  level > 0 && level < 6 ? headLevelToFontSize[level] : "1.25rem";

const incrementAndGetHeaderCount = (headerCounts: number[], level: number) => {
  const headerIndex = level - 1;
  const currentSize = headerCounts.length;

  if (level >= 1) {
    if (currentSize < level) {
      for (let i = currentSize; i < level; i++) {
        headerCounts[i] = 0;
      }
    }

    headerCounts[headerIndex] = (headerCounts[headerIndex] || 0) + 1;
    headerCounts = headerCounts.slice(0, level);
  }
  return headerCounts;
};

const StyledCalcLink = styled("a")({
  textDecoration: "none",
  color: "inherit",
  fontWeight: "bold",
});

interface Props {
  runResults: CalcTypeToParse[];
  paperView?: boolean;
}

// TODO: allow calc title in addition to template title in calc report
export default function CalcReport({ runResults, paperView }: Props) {
  // const runResults = useAppSelector(getCalculationRunResults)?.items;
  let headerCounts = [0];
  const [typesetLoading, setTypesetLoading] = useState(true);

  // update mathjax whenever math containing items change
  useEffect(() => {
    setTypesetLoading(true);

    // add delay to allow initial render then typeset
    setTimeout(() => {
      updateMathJax().then(() => {
        setTypesetLoading(false);
      });
    }, 25);
  }, [runResults]);

  const outerBoxStyle: SxProps<Theme> | undefined = paperView
    ? { backgroundColor: (t) => t.palette.grey[200] }
    : undefined;
  const innerBoxStyle: SxProps<Theme> | undefined = paperView
    ? {
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
        maxWidth: "910px",
        mx: "auto",
        p: 1,
        backgroundColor: (t) => t.palette.common.white,
        "@media print": {
          boxShadow: "none",
          maxWidth: "none",
        },
      }
    : { maxWidth: "910px" };

  return (
    <Box width="100%" sx={outerBoxStyle}>
      <Box sx={innerBoxStyle}>
        {typesetLoading && <h2>Calculations are loading...</h2>}
        {runResults &&
          runResults.map((item, index) => {
            switch (item.type) {
              case "Title":
                return (
                  <CalcTitleReport
                    item={item as CalculationTitle}
                    index={index}
                    key={getCalcKey(index)}
                  />
                );
              case "Assumption":
                return <AssumptionReport item={item as Assumption} key={getCalcKey(index)} />;
              case "Input":
                return (
                  <DeclareVariableReport item={item as InputVariable} key={getCalcKey(index)} />
                );
              case "Heading":
                const parsedBH = item as BodyHeading;
                const levelNum = parsedBH.level || 0;
                headerCounts = item.numbered
                  ? incrementAndGetHeaderCount(headerCounts, levelNum)
                  : headerCounts;
                const headerNumber = item.numbered ? headerCounts.join(".") + "." : undefined;
                const fontSize = getFontSizeForHeadLevel(levelNum);
                return (
                  <BodyHeaderReport
                    item={parsedBH}
                    fontSize={fontSize}
                    headerNumber={headerNumber}
                    key={getCalcKey(index)}
                  />
                );
              case "TextBlock":
                return <BodyTextReport item={item as TextBlock} key={getCalcKey(index)} />;
              case "Calculation":
                return <CalcVariableReport item={item as CalcVariable} key={getCalcKey(index)} />;
              case "Canvas":
                return <CanvasReport item={item as Canvas} key={getCalcKey(index)} />;
              case "Comparison":
                return <CheckVariableReport item={item as Comparison} key={getCalcKey(index)} />;
              case "ComparisonForced":
              case "ComparisonStatement":
                return (
                  <CheckVariablesTextReport
                    item={item as ComparisonForced}
                    key={getCalcKey(index)}
                  />
                );
              case "FigureBase":
                return <FigureBaseReport item={item as FigureBase} key={getCalcKey(index)} />;
              case "Symbolic":
                return <SymbolicReport item={item as Symbolic} key={getCalcKey(index)} />;
              case "Table":
              case "InputTable":
                return <TableReport item={item as CalcTable} key={getCalcKey(index)} />;
              default:
                return null;
            }
          })}
        <CalcTypography marginTop="3rem" textAlign="right" className="no-break">
          Powered by{" "}
          <StyledCalcLink href="https://efficalc.com" target="_blank" rel="noopener noreferrer">
            efficalc.com
          </StyledCalcLink>
        </CalcTypography>
      </Box>
    </Box>
  );
}
