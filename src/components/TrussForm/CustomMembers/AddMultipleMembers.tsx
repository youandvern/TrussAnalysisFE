import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { CustomMember } from "../../../Types/ApiAnalysisResults";
import { unitToInputArea, unitToInputStress } from "../../UnitSelector";
import { csvToArray } from "../utils";
import { validateMember } from "./member-validator";

const EXAMPLE_CSV = (
  <Typography>
    0, 1, 4.2, 29000
    <br />
    0, 2, 3.1, 29000
    <br />
    1, 2, 3.1, 29000
    <br />
  </Typography>
);

type Props = {
  unitType: string;
  onCreate: (members: CustomMember[]) => void;
  nodeCount: number;
};

export default function AddMultipleMembers({ onCreate, unitType, nodeCount }: Props) {
  const [input, setInput] = useState<string>();
  const [errorMessage, setErrorMesage] = useState<string>();
  const [success, setSuccess] = useState<boolean>();

  const areaUnit = unitToInputArea(unitType);
  const stressUnit = unitToInputStress(unitType);

  const headers = `start node, end node, section area (${areaUnit}), elastic modulus (${stressUnit})`;

  const isInputRowInvalid = (row: string[], rowIndex: number, rowCount: number) => {
    if (row.length !== 4) {
      setErrorMesage(
        `Member ${rowIndex + 1} out of ${rowCount}: All rows must have 4 comma-separated values`
      );
      return true;
    }

    const validatedMember = validateMember(nodeCount, row[0], row[1], row[2], row[3]);
    if (!validatedMember.valid) {
      setErrorMesage(`Member ${rowIndex + 1} out of ${rowCount}: ${validatedMember.error}`);
      return true;
    }

    return false;
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
      const newMembers: CustomMember[] = inputArray.map((row) => ({
        start: +row[0],
        end: +row[1],
        A: +row[2],
        E: +row[3],
      }));
      onCreate(newMembers);
      setErrorMesage(undefined);
      setSuccess(true);
    }
  };

  return (
    <>
      <Stack direction="column" spacing={2}>
        <Typography>
          Insert members by pasting or typing comma separated data. Each row will be interpreted as
          a unique member that will be added to the existing geometry. Each row should have exactly
          4 comma separated values to match the following headers:
        </Typography>
        <Typography fontWeight="bold">{headers}</Typography>
        <Typography>For example:</Typography>
        <Typography
          sx={{ backgroundColor: (theme) => theme.palette.grey[200], borderRadius: 4, padding: 2 }}
        >
          {EXAMPLE_CSV}
        </Typography>
        <TextField
          id="add-multiple-members"
          label={headers}
          multiline
          minRows={3}
          placeholder="e.g. 4, 12, 0.25, 7400"
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
            <CheckCircleIcon /> Members have been added.
          </Typography>
        )}
        <Button
          variant="outlined"
          color="primary"
          disabled={!input || input.length === 0}
          onClick={handleSubmit}
        >
          Add Members
        </Button>
      </Stack>
    </>
  );
}
