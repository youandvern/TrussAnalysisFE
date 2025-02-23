import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material/";

// expected properties given to DataTable
interface TableProps {
  headerList: string[];
  dataList: any[][];
  condensed?: boolean;
  centered?: boolean;
  useGenericCells?: boolean;
}

// Data table to display 2d data for concrete beam design results
export default function DataTableSimple({
  headerList,
  dataList,
  condensed,
  centered,
  useGenericCells,
}: TableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{ width: "fit-content", marginInline: centered ? "auto" : undefined }}
    >
      <Table size="small" sx={{ width: "auto" }} aria-label="data table">
        <TableHead>
          <TableRow>
            {headerList.map((header, hindex) => (
              <TableCell className="title-text" key={"header" + hindex}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    paddingRight: condensed ? undefined : "2em",
                    fontSize: "0.95em",
                  }}
                >
                  {header}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataList.map((row, rindex) => (
            <TableRow key={"datarow" + rindex}>
              {row.map((cell, cindex) => {
                return (
                  <TableCell key={"data" + rindex + "-" + cindex}>
                    {useGenericCells ? (
                      cell
                    ) : (
                      <Typography sx={{ paddingLeft: "1em", fontSize: "0.95em" }}>
                        {cell}
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
