import { Button, Grid } from "@mui/material";
import { CustomMember } from "../../../Types/ApiAnalysisResults";
import NumInput from "../../NumInput";
import { FormEvent, useState } from "react";
import { unitToInputArea, unitToInputStress } from "../../UnitSelector";

type Props = {
  unitType: string;
  onCreate: (members: CustomMember[]) => void;
};

export default function AddOneMember({ onCreate, unitType }: Props) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [area, setArea] = useState(1);
  const [eMod, setEmod] = useState(1);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onCreate([{ start: start || 0, end: end || 0, A: area || 1, E: eMod || 1 }]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container columnSpacing={2} rowSpacing={3} sx={{ borderRadius: 1 }}>
        <Grid item xs={6} md={3}>
          <NumInput
            label="starting node"
            value={start}
            onChange={(e) => setStart(+e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <NumInput
            label="ending node"
            value={end}
            onChange={(e) => setEnd(+e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>

        <Grid item xs={6} md={3}>
          <NumInput
            label="cross-sectional area"
            value={area}
            onChange={(e) => setArea(+e.target.value)}
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
            onChange={(e) => setEmod(+e.target.value)}
            unit={unitToInputStress(unitType)}
            min={0}
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
            Add Member
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
