import { Alert, Button, Grid } from "@mui/material";
import { FormEvent, useState } from "react";
import { CustomMember } from "../../../Types/ApiAnalysisResults";
import NumInput from "../../NumInput";
import { unitToInputArea, unitToInputStress } from "../../UnitSelector";
import { validateMember } from "./member-validator";

type Props = {
  currentStart: number;
  currentEnd: number;
  currentA?: number;
  currentE?: number;
  nodeCount: number;
  unitType: string;
  onSubmit: (member: CustomMember) => void;
  onClose: () => void;
};

export default function EditMemberForm({
  currentStart,
  currentEnd,
  currentA,
  currentE,
  nodeCount,
  unitType,
  onSubmit,
  onClose,
}: Props) {
  const [start, setStart] = useState(`${currentStart}`);
  const [end, setEnd] = useState(`${currentEnd}`);
  const [area, setArea] = useState(`${currentA}`);
  const [eMod, setEmod] = useState(`${currentE}`);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validMember = validateMember(nodeCount, start, end, area, eMod);

    if (!validMember.valid) {
      setValidationError(validMember.error);
    } else {
      setValidationError("");
      onSubmit({
        start: validMember.start,
        end: validMember.end,
        A: validMember.area,
        E: validMember.eMod,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "0.5rem" }}>
      <Grid container columnSpacing={2} rowSpacing={3} sx={{ borderRadius: 1 }}>
        {validationError && (
          <Grid item xs={12}>
            <Alert severity="error">{validationError}</Alert>
          </Grid>
        )}
        <Grid item xs={6}>
          <NumInput
            label="starting node"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>
        <Grid item xs={6}>
          <NumInput
            label="ending node"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>
        <Grid item xs={6}>
          <NumInput
            label="cross-sectional area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            unit={unitToInputArea(unitType)}
            min={0}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={6}>
          <NumInput
            label="elastic modulus"
            value={eMod}
            onChange={(e) => setEmod(e.target.value)}
            unit={unitToInputStress(unitType)}
            min={0}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={6}>
          <Button variant="outlined" fullWidth color="primary" onClick={onClose}>
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" fullWidth color="primary" type="submit">
            Edit Member
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
