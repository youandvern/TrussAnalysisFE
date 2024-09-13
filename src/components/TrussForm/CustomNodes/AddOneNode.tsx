import { Alert, Button, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { FormEvent, useState } from "react";
import { CustomNode, SupportType } from "../../../Types/ApiAnalysisResults";
import NumInput from "../../NumInput";
import { unitToForce, unitToLength } from "../../UnitSelector";
import { allNumbers } from "../utils";

type Props = {
  unitType: string;
  onCreate: (nodes: CustomNode[]) => void;
};

export default function AddOneNode({ onCreate, unitType }: Props) {
  const [x, setX] = useState("0");
  const [y, setY] = useState("0");
  const [support, setSupport] = useState<SupportType>("free");
  const [Fx, setFx] = useState("0");
  const [Fy, setFy] = useState("0");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (allNumbers([x, y, Fx, Fy])) {
      setValidationError("");
      onCreate([
        { x: +x || 0, y: +y || 0, support: support || "free", Fx: +Fx || 0, Fy: +Fy || 0 },
      ]);
    } else {
      setValidationError("All input values must be a valid number");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container columnSpacing={2} rowSpacing={3} sx={{ borderRadius: 1 }}>
        {validationError && (
          <Grid item xs={12}>
            <Alert severity="error">{validationError}</Alert>
          </Grid>
        )}
        <Grid item xs={6} md={3}>
          <NumInput
            label="x-position"
            value={x}
            onChange={(e) => setX(e.target.value)}
            unit={unitToLength(unitType)}
            min={-999999}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <NumInput
            label="y-position"
            value={y}
            onChange={(e) => setY(e.target.value)}
            unit={unitToLength(unitType)}
            min={-999999}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="select-node-support-label">support</InputLabel>
            <Select
              labelId="select-node-support-label"
              id="select-node-support"
              value={support}
              label="support"
              onChange={(e) => {
                setSupport(e.target.value as SupportType);
              }}
            >
              <MenuItem value={"free"}>Free</MenuItem>
              <MenuItem value={"pin"}>Pinned</MenuItem>
              <MenuItem value={"roller"}>Roller</MenuItem>
              <MenuItem value={"yroller"}>Y-Roller</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={3}>
          <NumInput
            label="Fx"
            value={Fx}
            onChange={(e) => setFx(e.target.value)}
            unit={unitToForce(unitType)}
            min={-999999}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <NumInput
            label="Fy"
            value={Fy}
            onChange={(e) => setFy(e.target.value)}
            unit={unitToForce(unitType)}
            min={-999999}
            max={999999}
            step="any"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            type="submit"
            sx={{ height: "100%" }}
          >
            Add Node
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
