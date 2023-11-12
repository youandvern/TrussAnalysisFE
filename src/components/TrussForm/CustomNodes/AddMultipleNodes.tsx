import { Button, Stack, TextField, Typography } from "@mui/material";
import { CustomNode, SupportType, supportTypes } from "../../../Types/ApiAnalysisResults";
import { useState } from "react";
import { csvToArray } from "../utils";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const EXAMPLE_CSV = (
  <Typography>
    0, 0, pin, 0, 0<br />
    10, 0, roller, 0, 0<br />
    5, 5, free, -1, 4
  </Typography>
);

const stringToSupportType = (typeish: string): SupportType => {
  if (typeish.trim() === "pin") {
    return "pin";
  }
  if (typeish.trim() === "roller") {
    return "roller";
  }
  return "free";
};

type Props = {
  lengthUnit: string;
  forceUnit: string;
  onCreate: (nodes: CustomNode[]) => void;
};

export default function AddMultipleNodes({ onCreate, lengthUnit, forceUnit }: Props) {
  const [input, setInput] = useState<string>();
  const [errorMessage, setErrorMesage] = useState<string>();
  const [success, setSuccess] = useState<boolean>();

  const headers = `x-position (${lengthUnit}), y-position (${lengthUnit}), support-type, Fx (${forceUnit}), Fy (${forceUnit})`;

  const isInputRowInvalid = (row: string[], rowIndex: number, rowCount: number) => {
    if (row.length !== 5) {
      setErrorMesage(
        `Node ${rowIndex + 1} out of ${rowCount}: All rows must have 5 comma-separated values`
      );
      return true;
    }

    if (Number.isNaN(+row[0]) || Number.isNaN(+row[1])) {
      setErrorMesage(`Node ${rowIndex + 1} out of ${rowCount}: x and y positions must be numbers`);
      return true;
    }

    if (supportTypes.includes(row[2] as SupportType)) {
      setErrorMesage(
        `Node ${rowIndex + 1} out of ${rowCount}: the support type must be one of ${JSON.stringify(
          supportTypes
        )}`
      );
      return true;
    }

    if (Number.isNaN(+row[3]) || Number.isNaN(+row[4])) {
      setErrorMesage(`Node ${rowIndex + 1} out of ${rowCount}: Fx and Fy must be numbers`);
      return true;
    }
  };

  const isInputArrayValid = (inputArray: string[][]) => {
    const rowCount = inputArray.length;

    if (rowCount < 1) {
      setErrorMesage("No members found to add");
      return false;
    }

    if (inputArray.some((row, index) => isInputRowInvalid(row, index, rowCount))) {
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    setSuccess(undefined);
    setErrorMesage(undefined);
    const inputArray = csvToArray(input?.trim() || "");

    if (isInputArrayValid(inputArray)) {
      const newNodes: CustomNode[] = inputArray.map((row) => ({
        x: +row[0],
        y: +row[1],
        support: stringToSupportType(row[2]),
        Fx: +row[3],
        Fy: +row[4],
      }));
      onCreate(newNodes);
      setErrorMesage(undefined);
      setSuccess(true);
    }
  };

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Typography>
          Insert nodes by pasting or typing comma separated data. Each row will be interpreted as a
          unique node that will be added to the existing geometry. Each row should have exactly 5
          comma separated values to match the following headers:
        </Typography>
        <Typography fontWeight="bold">{headers}</Typography>
        <Typography>
          Note that the support type must be <i>pin</i>, <i>free</i>, or <i>roller</i>. The
          direction for Fy is the direction of gravity (downward is positive).
        </Typography>
        <Typography>For example:</Typography>
        <Typography
          sx={{ backgroundColor: (theme) => theme.palette.grey[200], borderRadius: 4, padding: 2 }}
        >
          {EXAMPLE_CSV}
        </Typography>
        <TextField
          id="add-multiple-nodes"
          label={headers}
          multiline
          minRows={3}
          placeholder="e.g. 12.5, 15, free, -0.25, 7.5"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {errorMessage && (
          <Typography display="flex" color={(theme) => theme.palette.error.dark}>
            <ErrorIcon /> Error: {errorMessage}
          </Typography>
        )}
        {success && (
          <Typography display="flex" color={(theme) => theme.palette.success.dark}>
            <CheckCircleIcon /> Nodes have been added.
          </Typography>
        )}
        <Button
          variant="outlined"
          color="primary"
          disabled={!input || input.length === 0}
          onClick={handleSubmit}
        >
          Add Nodes
        </Button>
      </Stack>
    </>
  );
}
