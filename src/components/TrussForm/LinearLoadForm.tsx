import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import NumInput from "../NumInput";
import { isNotNumber } from "./utils";

export type OptionalForces = { fx?: number; fy?: number };
export type NodeGroup = "top" | "bottom";
export type LoadApplication = "member-length" | "orthogonal-projection";

type Props = {
  forceUnit: string;
  lengthUnit: string;
  applyLoads: (
    linearForce: OptionalForces,
    nodes: NodeGroup,
    loadApplication: LoadApplication
  ) => void;
};

export default function LinearLoadForm({ forceUnit, lengthUnit, applyLoads }: Props) {
  const [nodeGroup, setNodeGroup] = useState<NodeGroup>("top");
  const [loadApplication, setLoadApplication] = useState<LoadApplication>("orthogonal-projection");
  const [fx, setFx] = useState<string>("");
  const [fy, setFy] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const unit = `${forceUnit}/${lengthUnit}`;

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (fx === "" && fy === "") {
      setError("Fx or Fy must be set to a valid number");
      return;
    }

    if (isNotNumber(fx)) {
      setError("Fx must be a valid number");
      return;
    }

    if (isNotNumber(fy)) {
      setError("Fy must be a valid number");
      return;
    }

    applyLoads({ fx: +fx, fy: +fy }, nodeGroup, loadApplication);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={submitForm}
        display="flex"
        flexDirection="column"
        gap={2}
        mb={2}
        padding={2}
        borderRadius={2}
        border={2}
        borderColor={(t) => t.palette.divider}
      >
        <Typography fontWeight="bold">Apply Distributed Load To Nodes</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel id="node-group-selector-label">Add To:</FormLabel>
              <RadioGroup
                row
                aria-labelledby="node-group-selector-label"
                name="node-group-selector"
                value={nodeGroup}
                onChange={(e, v) => setNodeGroup(v as NodeGroup)}
              >
                <FormControlLabel value="top" control={<Radio />} label="Top Chord" />
                <FormControlLabel value="bottom" control={<Radio />} label="Bottom Chord" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl>
              <FormLabel id="load-application-selector-label">Load Applied By:</FormLabel>
              <RadioGroup
                row
                aria-labelledby="load-application-selector-label"
                name="load-application-selector"
                value={loadApplication}
                onChange={(e, v) => setLoadApplication(v as LoadApplication)}
              >
                <FormControlLabel
                  value={"orthogonal-projection" as LoadApplication}
                  control={<Radio />}
                  label="Orthogonal Projection"
                />
                <FormControlLabel
                  value={"member-length" as LoadApplication}
                  control={<Radio />}
                  label="Member Length"
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              {loadApplication === "member-length"
                ? "Applied based on the absolute adjacent member lengths (half the distance between adjacent joints)."
                : "Applied based on the orthogonal projection of adjacent chord members in each direction."}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4}>
            <NumInput
              label="Fx"
              unit={unit}
              value={fx}
              onChange={(e) => setFx(e.target.value || "")}
            />
          </Grid>

          <Grid item xs={6} sm={4}>
            <NumInput
              label="Fy"
              unit={unit}
              value={fy}
              onChange={(e) => setFy(e.target.value || "")}
            />
          </Grid>

          <Grid item xs={12} sm={4} display="flex" alignItems="center">
            <Button type="submit" variant="contained" fullWidth>
              Apply Load
            </Button>
          </Grid>

          {error && (
            <Grid
              item
              xs={12}
              sx={{ backgroundColor: (t) => t.palette.error.light, borderRadius: 4 }}
            >
              <Typography color={(t) => t.palette.error.dark}>{error}</Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
}
