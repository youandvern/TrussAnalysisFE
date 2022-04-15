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
import { ForceRow } from "../Interfaces/ApiForces";
import { NumInputSimple } from "../NumInput";

// expected properties given to DataTable
interface TableProps {
  headerList: string[];
  dataList: number[][];
  setDataList: (
    row: number,
    col: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  firstColumnEditable?: boolean;
  title?: string;
}

// Data table to display 2d data for concrete beam design results
export default function DataTable({
  headerList,
  dataList,
  setDataList,
  firstColumnEditable = true,
  title = "",
}: TableProps) {
  return (
    <TableContainer component={Paper}>
      <Typography className="title-text" variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Table size="small" aria-label="custom table">
        <TableHead>
          <TableRow>
            {headerList.map((header, hindex) => (
              <TableCell
                className="title-text"
                key={"header" + hindex}
                dangerouslySetInnerHTML={{ __html: header }}
              ></TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataList.map((row, rindex) => (
            <TableRow key={"datarow" + rindex}>
              {row.map((cell, cindex) => {
                return cindex === 0 && !firstColumnEditable ? (
                  <TableCell key={"data" + rindex + "-" + cindex}>
                    <Typography>{cell}</Typography>
                  </TableCell>
                ) : (
                  <TableCell className="data-cell" key={"data" + rindex + "-" + cindex}>
                    <NumInputSimple value={cell} onChange={(e) => setDataList(rindex, cindex, e)} />
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
