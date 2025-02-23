import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CalcTable } from "../CalculationRunTypes";
import { CALC_MARGIN, CalcTypography } from "./reportUtilities";

type AdditionalRowProps = {
  striped?: boolean;
};

const StyledTable = styled("table", {
  shouldForwardProp: (prop) => prop !== "striped",
})<AdditionalRowProps>(({ striped }) => ({
  borderCollapse: "collapse",
  "& td:nth-child(even)": {
    backgroundColor: striped ? "#e0e0e0" : undefined,
  },
}));

const TH = styled("th")({
  border: "1px solid #bdbdbd",
  textAlign: "left",
  padding: "8px",
});

const TD = styled("td")({
  border: "1px solid #bdbdbd",
  textAlign: "left",
  padding: "8px",
});

const toCell = (val: string | number, index: number | string) => (
  <TD key={`cell-${index}`}>
    <CalcTypography key={`text-${index}`}>{val}</CalcTypography>
  </TD>
);
const toHeader = (val: string, index: number) => (
  <TH key={`header-${index}`}>
    <CalcTypography fontWeight="bold" key={`text-${index}`}>
      {val}
    </CalcTypography>
  </TH>
);
const toRow = (row: (string | number)[], index: number, numbered?: boolean) => (
  <tr key={`row-${index}`}>
    {numbered && (
      <TD key={`cell-row-${index}`}>
        <CalcTypography color="text.secondary" key={`row-num-${index}`}>
          {index + 1}
        </CalcTypography>
      </TD>
    )}
    {row.map((c, idx) => toCell(c, `${index}-${idx}`))}
  </tr>
);

const Headers = ({ item }: { item: CalcTable }) =>
  !item.headers ? (
    <></>
  ) : (
    <thead>
      <tr>
        {item.numberedRows && <TH></TH>}
        {item.headers.map(toHeader)}
      </tr>
    </thead>
  );

const Body = ({ item }: { item: CalcTable }) =>
  !item.data ? <></> : <tbody>{item.data.map((r, i) => toRow(r, i, item.numberedRows))}</tbody>;

interface Props {
  item: CalcTable;
}

export default function TableReport({ item }: Props) {
  return (
    <>
      <Box marginLeft={CALC_MARGIN} marginY="1.5rem">
        <SimpleTable item={item} />
      </Box>
    </>
  );
}

export function SimpleTable({ item }: Props) {
  return (
    <StyledTable
      striped={item.striped}
      sx={{ margin: "auto", width: item.fullWidth ? "100%" : undefined }}
    >
      {item.title && (
        <caption>
          <CalcTypography variant="caption" fontWeight="bold">
            {item.title}
          </CalcTypography>
        </caption>
      )}
      <Headers item={item} />
      <Body item={item} />
    </StyledTable>
  );
}
