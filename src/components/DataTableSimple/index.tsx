import React from "react";
import "./style.css";
import {
  TableContainer,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  TableBody,
} from "@mui/material/";

// expected properties given to DataTable
interface TableProps {
  headerList: string[];
  dataList: any[][];
}

// Data table to display 2d data for concrete beam design results
export default function DataTableSimple({ headerList, dataList }: TableProps) {
  return (
    <TableContainer component={Paper} sx={{ width: "fit-content" }}>
      <Table size="small" sx={{ width: "auto" }} aria-label="data table">
        <TableHead>
          <TableRow>
            {headerList.map((header, hindex) => (
              <TableCell className="title-text" key={"header" + hindex}>
                <Typography sx={{ fontWeight: "bold", paddingRight: "2em", fontSize: "0.95em" }}>
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
                    <Typography sx={{ paddingLeft: "1em", fontSize: "0.95em" }}>{cell}</Typography>
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
