import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useQueryParam, StringParam, QueryParamConfig } from "use-query-params";
import "./style.css";
import { Grid, useMediaQuery, Theme } from "@mui/material";
import LabeledSwitch from "../LabeledSwitch";
import TrussStyleSelector, {
  BRIDGE_TRUSS_TYPES,
  ROOF_TRUSS_TYPES,
  TRUSS_TYPES,
} from "../TrussStyleSelector";
import UnitSelector, { US_UNIT } from "../UnitSelector";
import { TrussCategory } from "../TrussCategorySelector";
import StandardForm from "./StandardForm";
import CustomForm from "./CustomForm";
import { CategoryParam } from "./StringQueries";

const DEFAULT_TRUSS_CATEGORY: TrussCategory = "bridge";
const DEFAULT_TRUSS_TYPE = TRUSS_TYPES[0].type;
const MAX_WIDTH_TRANSITION = 855;

// Form and controls for truss analysis tool
export default function TrussForm() {
  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down(MAX_WIDTH_TRANSITION));

  const [frameWidth, setFrameWidth] = useState(
    smallScreen ? 0.92 * window.innerWidth : MAX_WIDTH_TRANSITION
  );
  const [frameHeight, setFrameHeight] = useState(
    (smallScreen ? 0.92 * window.innerWidth : MAX_WIDTH_TRANSITION) / 3
  );

  const graphGridRef = useRef<HTMLDivElement>(null);
  const [graphRendered, setGraphRendered] = useState(false);
  const onRenderGraph = () => setGraphRendered(true);

  const [trussType = DEFAULT_TRUSS_TYPE, setTrussType] = useQueryParam("trussType", StringParam);
  const [trussCategory = DEFAULT_TRUSS_CATEGORY, setTrussCategory] = useQueryParam(
    "cat",
    CategoryParam
  );

  const [unitType, setUnitType] = useState(US_UNIT);
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showMemberLabels, setShowMemberLabels] = useState(false);
  const [showForceArrows, setShowForceArrows] = useState(true);

  const handleChangeTrussType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTrussType(event?.target?.value);
  };

  const handleChangeCategory = (event: React.MouseEvent<HTMLElement>, value: TrussCategory) => {
    setTrussCategory((cur) => {
      if (cur === value) {
        return value;
      }

      const newTrussType =
        value === "bridge"
          ? BRIDGE_TRUSS_TYPES[0].type
          : value === "roof"
          ? ROOF_TRUSS_TYPES[0].type
          : undefined;

      setTrussType(newTrussType);
      return value;
    });
  };

  const handleShowNodeLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowNodeLabels(event?.target?.checked);
  };

  const handleShowMemberLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowMemberLabels(event?.target?.checked);
  };

  const handleShowForceArrows = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowForceArrows(event?.target?.checked);
  };

  const handleChangeUnitType = (_event: React.MouseEvent<HTMLElement>, value: any) => {
    setUnitType(value);
  };

  // reset truss graph scaling to fit inside component when window size changes
  useEffect(() => {
    function resizeGraph() {
      if (graphGridRef.current !== null) {
        const width = Math.max(275, graphGridRef.current.offsetWidth);
        setFrameWidth(width);
        setFrameHeight(width / 3);
      }
    }

    resizeGraph();
    window.addEventListener("resize", resizeGraph);
    window.addEventListener("load", resizeGraph);

    return () => {
      window.removeEventListener("resize", resizeGraph);
      window.removeEventListener("load", resizeGraph);
    };
  }, [graphRendered]);

  return (
    <>
      <div className="not-calc-report">
        <Grid container columnSpacing={2} rowSpacing={3}>
          <Grid item xs={12}>
            <TrussStyleSelector
              trussType={trussType || DEFAULT_TRUSS_TYPE}
              handleChange={handleChangeTrussType}
              trussCategory={trussCategory || DEFAULT_TRUSS_CATEGORY}
              handleTrussCategoryChange={handleChangeCategory}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <LabeledSwitch
              label="Node Labels:"
              checked={showNodeLabels}
              handleChange={handleShowNodeLabels}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <LabeledSwitch
              label="Member Labels:"
              checked={showMemberLabels}
              handleChange={handleShowMemberLabels}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <LabeledSwitch
              label="Force Arrows:"
              checked={showForceArrows}
              handleChange={handleShowForceArrows}
            />
          </Grid>
          <Grid item xs={6} sm={12} md={3}>
            <UnitSelector unitType={unitType} handleChange={handleChangeUnitType} />
          </Grid>
        </Grid>
      </div>
      {trussCategory === "custom" ? (
        <CustomForm
          showNodeLabels={showNodeLabels}
          showMemberLabels={showMemberLabels}
          showForceArrows={showForceArrows}
          unitType={unitType}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          graphGridRef={graphGridRef}
          onRenderGraph={onRenderGraph}
        />
      ) : (
        <StandardForm
          showNodeLabels={showNodeLabels}
          showMemberLabels={showMemberLabels}
          showForceArrows={showForceArrows}
          trussCategory={trussCategory || DEFAULT_TRUSS_CATEGORY}
          trussType={trussType}
          unitType={unitType}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          graphGridRef={graphGridRef}
          onRenderGraph={onRenderGraph}
          setTrussCategory={setTrussCategory}
        />
      )}
    </>
  );
}
