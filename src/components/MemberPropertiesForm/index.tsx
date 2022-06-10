import React from "react";
import { Grid, Tooltip, Typography } from "@mui/material/";
import "./style.css";
import NumInput from "../NumInput";
import { unitToInputArea, unitToInputStress } from "../UnitSelector";

const AREA_LABEL = "Member Area";
const AREA_TOOLTIP = "Cross-sectional Area, A";

const ELASTIC_MODULUS_LABEL = "Member Elasicity";
const ELASTIC_MODULUS_TOOLTIP = "Material Modulus of Elasticity, E";
const MAX_E = 999999999;

export interface MemberPropsType {
  top: number;
  bot: number;
  web: number;
}

// expected component properties
interface MemberPropertiesProps {
  areaProps: MemberPropsType;
  setAreaProps: (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  eModulusProps: MemberPropsType;
  setEModProps: (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  unitType?: string;
}

// component for changing member properties
export default function MemberPropertiesForm({
  areaProps,
  setAreaProps,
  eModulusProps,
  setEModProps,
  unitType,
}: MemberPropertiesProps) {
  return (
    <Grid container spacing={2} rowSpacing={3}>
      <Grid item xs={3} className="mem-prop-label-grid">
        <Typography className="mem-prop-label">Top Chord:</Typography>
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.top}
          onChange={(e) => setAreaProps("top", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.top}
          onChange={(e) => setEModProps("top", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>

      <Grid item xs={3} className="mem-prop-label-grid">
        <Typography className="mem-prop-label">Web:</Typography>
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.web}
          onChange={(e) => setAreaProps("web", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.web}
          onChange={(e) => setEModProps("web", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>

      <Grid item xs={3} className="mem-prop-label-grid">
        <Typography className="mem-prop-label">Bottom Chord:</Typography>
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.bot}
          onChange={(e) => setAreaProps("bot", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>
      <Grid item xs={4.5}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.bot}
          onChange={(e) => setEModProps("bot", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
        />
      </Grid>
    </Grid>
  );
}
