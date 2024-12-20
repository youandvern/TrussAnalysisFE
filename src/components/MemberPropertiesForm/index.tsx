import { Checkbox, FormControlLabel, FormGroup, FormLabel, Grid } from "@mui/material/";
import React from "react";
import { GLOBAL_THEME } from "../../App";
import NumInput from "../NumInput";
import { unitToInputArea, unitToInputStress } from "../UnitSelector";
import "./style.css";

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

export interface MemberInputPropsType {
  top: string;
  bot: string;
  web: string;
}

// expected component properties
interface MemberPropertiesProps {
  useDefault: boolean;
  setUseDefault: (event: React.ChangeEvent<HTMLInputElement>) => void;
  areaProps: MemberInputPropsType;
  setAreaProps: (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  eModulusProps: MemberInputPropsType;
  setEModProps: (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  unitType?: string;
}

// component for changing member properties
export default function MemberPropertiesForm({
  useDefault,
  setUseDefault,
  areaProps,
  setAreaProps,
  eModulusProps,
  setEModProps,
  unitType,
}: MemberPropertiesProps) {
  const textColor = useDefault
    ? GLOBAL_THEME.palette.text.disabled
    : GLOBAL_THEME.palette.text.primary;

  return (
    <Grid container columns={8} spacing={2} rowSpacing={3}>
      <Grid item xs={8}>
        <FormGroup className="form-right-align">
          <FormControlLabel
            control={<Checkbox checked={useDefault} onChange={setUseDefault} />}
            label="Use Default Properties (Force analysis only)"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={8} sm={2}>
        <FormLabel sx={{ color: textColor }}>Top Chord:</FormLabel>
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.top}
          onChange={(e) => setAreaProps("top", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.top}
          onChange={(e) => setEModProps("top", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>

      <Grid item xs={8} sm={2}>
        <FormLabel sx={{ color: textColor }}>Web:</FormLabel>
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.web}
          onChange={(e) => setAreaProps("web", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.web}
          onChange={(e) => setEModProps("web", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>

      <Grid item xs={8} sm={2}>
        <FormLabel sx={{ color: textColor }}>Bottom Chord:</FormLabel>
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={AREA_LABEL}
          value={areaProps.bot}
          onChange={(e) => setAreaProps("bot", e)}
          unit={unitToInputArea(unitType)}
          toolTip={AREA_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>
      <Grid item xs={4} sm={3}>
        <NumInput
          label={ELASTIC_MODULUS_LABEL}
          value={eModulusProps.bot}
          onChange={(e) => setEModProps("bot", e)}
          unit={unitToInputStress(unitType)}
          toolTip={ELASTIC_MODULUS_TOOLTIP}
          min={0}
          max={MAX_E}
          disabled={useDefault}
        />
      </Grid>
    </Grid>
  );
}
