import React, { useCallback, useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useQueryParam, NumberParam, StringParam, NumericObjectParam } from "use-query-params";
import "./style.css";

import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import NumInput from "../NumInput";
import NumSlider from "../NumSlider";
import TrussGraph from "../TrussGraph";
import { FetchGeometry } from "../FetchGeometry";
import {
  emptyApiForcesParsed,
  MemberForcesSummary,
  NodeForceSimple,
  NodeForcesSimple,
} from "../Interfaces/ApiForces";
import DataTable from "../DataTableControlled";
import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";
import { FetchForces } from "../FetchForces";
import MemberForceResults from "../MemberForceResults";
import MemberPropertiesForm, { MemberPropsType } from "../MemberPropertiesForm";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import RowForm from "../RowForm";
import LabeledSwitch from "../LabeledSwitch";
import TrussStyleSelector, { TRUSS_TYPES } from "../TrussStyleSelector";
import CalculationReport from "../CalculationReport";
import { Query2dNumberArray } from "./Query2dNumberArray";
import UnitSelector, {
  US_UNIT,
  unitToForce,
  unitToLength,
  unitToAreaFactorInputToCalc,
  unitToStressFactorInputToCalc,
} from "../UnitSelector";

const debounce = require("lodash.debounce");

const DEFAULT_SPAN = 16;
const DEFAULT_HEIGHT = 4;
const DEFAULT_NWEB = 1;
const DEFAULT_TRUSS_TYPE = TRUSS_TYPES[0].type;
const DEFAULT_A = 5;
const DEFAULT_E = 29000;

const queryToMemberProps = (
  defaultVal: number,
  objectVal:
    | {
        [key: string]: number | null | undefined;
      }
    | null
    | undefined
) =>
  ({
    top: objectVal?.top || defaultVal,
    bot: objectVal?.bot || defaultVal,
    web: objectVal?.web || defaultVal,
  } as MemberPropsType);

const inputPropsToCalcProps = (conversionFactor: number, props: MemberPropsType) =>
  ({
    top: conversionFactor * props.top,
    bot: conversionFactor * props.bot,
    web: conversionFactor * props.web,
  } as MemberPropsType);

const printPdf = () => {
  document
    .querySelectorAll(".not-calc-report")
    .forEach((element) => element?.classList.add("no-print"));
  window.print();
  setTimeout(() => {
    document
      .querySelectorAll(".not-calc-report")
      .forEach((element) => element?.classList.remove("no-print"));
  }, 500);
};

const showCalculationsDiv = () => {
  document.querySelector(".print-only-calc-report")?.classList.add("show-calc-report");
};

const hideCalculationsDiv = () => {
  document.querySelector(".print-only-calc-report")?.classList.remove("show-calc-report");
};

// Form and controls for truss analysis tool
export default function TrussForm() {
  const [span = DEFAULT_SPAN, setSpan] = useQueryParam("span", NumberParam);
  const [height = DEFAULT_HEIGHT, setHeight] = useQueryParam("height", NumberParam);
  const [nWeb = DEFAULT_NWEB, setNWeb] = useQueryParam("nWeb", NumberParam);
  const [trussType = DEFAULT_TRUSS_TYPE, setTrussType] = useQueryParam("trussType", StringParam);
  const [elasticModulusProps, setElasticModulusProps] = useQueryParam("eMod", NumericObjectParam);
  const [areaProps, setAreaProps] = useQueryParam("area", NumericObjectParam);

  const [geometry, setGeometry] = useState<ApiGeometry>();
  const nNodes = geometry?.nodes ? Object.keys(geometry.nodes).length : 0;
  const [frameWidth, setFrameWidth] = useState(window.innerWidth / 2);
  const [frameHeight, setFrameHeight] = useState(window.innerHeight / 2);
  const [unitType, setUnitType] = useState(US_UNIT);
  const forceUnit = unitToForce(unitType);
  const graphGridRef = useRef<HTMLDivElement>(null);

  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showMemberLabels, setShowMemberLabels] = useState(false);
  const [showForceArrows, setShowForceArrows] = useState(true);
  const [hideCalculations, setHideCalculations] = useState(true);

  const generateForces = (nForces: number) => {
    let zeros = Array<number>(nForces).fill(0);
    return zeros.map((_zero, index) => [index, 0, 0]);
  };
  const DEFAULT_FORCES = useMemo(() => generateForces(nNodes), [nNodes]);

  const generateForceArrows = (nForces: number) => {
    let forceArrows = {} as NodeForcesSimple;
    for (let i = 0; i < nForces; i++) {
      forceArrows[i.toString()] = { fx: 0, fy: 0 } as NodeForceSimple;
    }
    return forceArrows;
  };

  // const [forces, setForces] = useState(generateForces(nNodes));
  const [forces, setForces] = useQueryParam("zforces", Query2dNumberArray);

  const [showForces, setShowForces] = useState(false);
  const [showSections, setShowSections] = useState(false);
  const [memberForcesSummary, setMemberForcesSummary] = useState<MemberForcesSummary>();
  const [forceArrows, setForceArrows] = useState(generateForceArrows(nNodes));
  const setTopForcesForm = useRef(null);
  const setBotForcesForm = useRef(null);

  const updateForces = (
    row: number,
    col: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForces((oldForces) =>
      (oldForces || DEFAULT_FORCES).map((rowArray, rindex) => {
        if (rindex === row) {
          const newRow = [...rowArray];
          newRow[col] = +e.target.value;
          return newRow;
        }
        return rowArray;
      })
    );

    updateForceArrows(
      row.toString(),
      col === 1 ? +e.target.value : undefined,
      col === 2 ? +e.target.value : undefined
    );
  };

  const resetForces = useCallback(() => {
    setForceArrows(generateForceArrows(nNodes));
    setForces(undefined);
  }, [nNodes, setForces]);

  const updateForceArrows = (nodeId: string, fx?: number, fy?: number) => {
    setForceArrows((oldForceArrows) => {
      let newForce = oldForceArrows[nodeId];
      const newForceArrows = { ...oldForceArrows };
      if (fx != null) {
        newForce = { ...newForce, fx: fx };
      }
      if (fy != null) {
        newForce = { ...newForce, fy: fy };
      }

      newForceArrows[nodeId] = newForce;
      return newForceArrows;
    });
  };

  const [showMemberForces, setShowMemberForces] = useState(false);
  const [memberForces, setMemberForces] = useState(emptyApiForcesParsed);

  const updateMemberForces = useCallback(() => {
    // Flip y-axis direction
    const forcesCorrected = forces?.map((force) => [force[0], force[1], -1 * force[2]]);
    FetchForces(
      span || DEFAULT_SPAN,
      height || DEFAULT_HEIGHT,
      nWeb || DEFAULT_NWEB,
      forcesCorrected || DEFAULT_FORCES,
      trussType || DEFAULT_TRUSS_TYPE,
      unitType,
      inputPropsToCalcProps(
        unitToStressFactorInputToCalc(unitType),
        queryToMemberProps(DEFAULT_E, elasticModulusProps)
      ),
      inputPropsToCalcProps(
        unitToAreaFactorInputToCalc(unitType),
        queryToMemberProps(DEFAULT_A, areaProps)
      )
    ).then((result) => {
      // Get spread of forces for color calculations
      let max = result.data.memberForces[0][3];
      let min = result.data.memberForces[0][3];
      result.data.memberForces.forEach((force) => {
        max = Math.max(max, force[3]);
        min = Math.min(min, force[3]);
      });

      // Set colors based on forces
      result.data.memberForces.forEach((force) => {
        const member = geometry?.members[force[0].toString()];
        if (member) {
          member.color = dataToColorScale(force[3], max, min);
        }
      });

      setMemberForcesSummary({ max: max, min: min });
      setShowForces(!result.show);
      setShowSections(false);
      setShowMemberForces(result.show);
      setMemberForces(result.data);
    });
  }, [
    span,
    height,
    nWeb,
    forces,
    geometry?.members,
    trussType,
    unitType,
    areaProps,
    elasticModulusProps,
    DEFAULT_FORCES,
  ]);

  const handleSetSpan = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSpan(+event?.target?.value);
  };

  const handleSetHeight = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setHeight(+event?.target?.value);
  };

  // only store areas in url if it differs from the default
  const handleSetArea = (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newArea = +e?.target?.value;
    if (newArea !== DEFAULT_A)
      setAreaProps((oldAreaProps) => {
        const newAreaProps = oldAreaProps ? { ...oldAreaProps } : {};
        newAreaProps[memberType] = newArea;
        return newAreaProps;
      });
  };

  // only store elastic modulus in url if it differs from the default
  const handleSetElasticMod = (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newElasticMod = +e?.target?.value;
    if (newElasticMod !== DEFAULT_E)
      setElasticModulusProps((oldElasticModProps) => {
        const newElasticModProps = oldElasticModProps ? { ...oldElasticModProps } : {};
        newElasticModProps[memberType] = newElasticMod;
        return newElasticModProps;
      });
  };

  const handleSetNodeForces = (nodeIds?: number[], formRef?: React.MutableRefObject<null>) => {
    const form = formRef ? formRef.current : null;
    if (nodeIds && form) {
      const fx = +form["Fx"]["value"] || 0;
      const fy = +form["Fy"]["value"] || 0;

      setForces((oldForces) =>
        (oldForces || DEFAULT_FORCES).map((rowArray, rindex) => {
          if (nodeIds.includes(rindex)) {
            const newRow = [...rowArray];

            newRow[1] = fx;
            newRow[2] = fy;
            return newRow;
          }
          return rowArray;
        })
      );
      nodeIds.forEach((nodeId) => updateForceArrows(nodeId.toString(), fx, fy));
    } else {
      console.log("Error: nodes not found.");
    }
  };

  const handleChangeTrussType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTrussType(event?.target?.value);
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

  const handleHideCalculations = () => {
    setHideCalculations(true);
    hideCalculationsDiv();
  };

  const handleShowCalculations = () => {
    setHideCalculations(false);
    showCalculationsDiv();
  };

  // nNodes is 0 on initial render, then geometry is fetched for the first time and forces would be reset.
  // If forces are given in URL then we don't want to reset these forces after the initial render, only afterwards.
  const geometryFetchCount = useRef(0);

  useEffect(() => {
    if (geometryFetchCount.current > 1) resetForces();
  }, [nWeb, nNodes, resetForces]);

  const throttledFetchGeometry = useMemo(
    () =>
      debounce(
        (span1: number, height1: number, nWeb1: number, trussType1: string) =>
          FetchGeometry(span1, height1, nWeb1, trussType1).then((result) => {
            setGeometry(result.data);
            geometryFetchCount.current++;
          }),
        500
      ),
    []
  );

  useEffect(() => {
    throttledFetchGeometry(
      span || DEFAULT_SPAN,
      height || DEFAULT_HEIGHT,
      nWeb || DEFAULT_NWEB,
      trussType || DEFAULT_TRUSS_TYPE
    );
  }, [span, height, nWeb, trussType, throttledFetchGeometry]);

  // reset truss graph scaling to fit inside component when window size changes
  useEffect(() => {
    function resizeGraph() {
      if (graphGridRef.current !== null) {
        setFrameWidth(graphGridRef.current.offsetWidth);
        setFrameHeight(graphGridRef.current.offsetWidth / 3);
      }
    }

    resizeGraph();
    window.addEventListener("resize", resizeGraph);
    window.addEventListener("load", resizeGraph);

    return () => {
      window.removeEventListener("resize", resizeGraph);
      window.removeEventListener("load", resizeGraph);
    };
  }, []);

  // hide results if any input changes
  useEffect(() => {
    setShowMemberForces(false);
    setMemberForcesSummary(undefined);
    handleHideCalculations();
  }, [span, height, nWeb, trussType, unitType, elasticModulusProps, areaProps]);

  return (
    <>
      <div className="not-calc-report">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TrussStyleSelector
              trussType={trussType || DEFAULT_TRUSS_TYPE}
              handleChange={handleChangeTrussType}
            />
          </Grid>
          <Grid item xs={3} ref={graphGridRef}>
            <LabeledSwitch
              label="Node Labels:"
              checked={showNodeLabels}
              handleChange={handleShowNodeLabels}
            />
          </Grid>
          <Grid item xs={3} ref={graphGridRef}>
            <LabeledSwitch
              label="Member Labels:"
              checked={showMemberLabels}
              handleChange={handleShowMemberLabels}
            />
          </Grid>
          <Grid item xs={3} ref={graphGridRef}>
            <LabeledSwitch
              label="Force Arrows:"
              checked={showForceArrows}
              handleChange={handleShowForceArrows}
            />
          </Grid>
          <Grid item xs={3} ref={graphGridRef}>
            <UnitSelector unitType={unitType} handleChange={handleChangeUnitType} />
          </Grid>
          <Grid item xs={12} ref={graphGridRef}>
            {geometry && (
              <TrussGraph
                globalGeometry={{ span, height, nWeb } as ApiGeometryGlobal}
                trussGeometry={geometry}
                frameWidth={frameWidth}
                frameHeight={frameHeight}
                showNodeLabels={showNodeLabels}
                showMemberLabels={showMemberLabels}
                showForceArrows={showForceArrows}
                showAxes={true}
                memberForcesSummary={memberForcesSummary}
                nodeForces={forceArrows}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <NumInput
                  label="Truss Span"
                  value={span || DEFAULT_SPAN}
                  onChange={handleSetSpan}
                  unit={unitToLength(unitType)}
                  min={1}
                  max={500}
                  step={1}
                />
              </Grid>

              <Grid item xs={3}>
                <NumInput
                  label="Truss Height"
                  value={height || DEFAULT_HEIGHT}
                  onChange={handleSetHeight}
                  unit={unitToLength(unitType)}
                  min={1}
                  max={200}
                  step={1}
                />
              </Grid>

              <Grid item xs={6}>
                <NumSlider
                  label="Number of Web Bays (per side):"
                  value={nWeb || DEFAULT_NWEB}
                  onChange={setNWeb}
                  min={1}
                  max={10}
                  step={1}
                />
              </Grid>

              <Grid item xs={8}>
                <Accordion
                  expanded={showForces}
                  onChange={(_e, expanded) => {
                    setShowForces(expanded);
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Truss Loading</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <RowForm
                      formRef={setTopForcesForm}
                      onSubmit={() => handleSetNodeForces(geometry?.topNodeIds, setTopForcesForm)}
                      buttonTitle="Top Nodes:"
                      inputLabel1="Fx"
                      inputUnit1={forceUnit}
                      inputLabel2="Fy"
                      inputUnit2={forceUnit}
                    />
                    <RowForm
                      formRef={setBotForcesForm}
                      onSubmit={() => handleSetNodeForces(geometry?.botNodeIds, setBotForcesForm)}
                      buttonTitle="Bottom Nodes:"
                      inputLabel1="Fx"
                      inputUnit1={forceUnit}
                      inputLabel2="Fy"
                      inputUnit2={forceUnit}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      color="primary"
                      onClick={resetForces}
                      sx={{ height: "100%", marginBottom: "2em" }}
                    >
                      Reset Forces to Zero
                    </Button>
                    <DataTable
                      headerList={["Node", `Fx (${forceUnit})`, `Fy (${forceUnit})`]}
                      dataList={forces || DEFAULT_FORCES}
                      setDataList={updateForces}
                      firstColumnEditable={false}
                      title="Individual Node Forces"
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={showSections}
                  onChange={(_e, expanded) => {
                    setShowSections(expanded);
                  }}
                  sx={{ marginTop: "1em" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1b-content"
                    id="panel1b-header"
                  >
                    <Typography>Cross-sectional Properties of Members (Optional)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MemberPropertiesForm
                      areaProps={queryToMemberProps(DEFAULT_A, areaProps)}
                      setAreaProps={handleSetArea}
                      eModulusProps={queryToMemberProps(DEFAULT_E, elasticModulusProps)}
                      setEModProps={handleSetElasticMod}
                      unitType={unitType}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={4}>
                <Button variant="outlined" fullWidth color="primary" onClick={updateMemberForces}>
                  Calculate Forces
                </Button>
              </Grid>
              <Grid item xs={12}>
                <MemberForceResults
                  showResult={showMemberForces}
                  memberForceResults={memberForces}
                />
              </Grid>
              <Grid item xs={8}>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={printPdf}
                  disabled={!showMemberForces}
                >
                  Print Calculation Report
                </Button>
              </Grid>
              <Grid item xs={4}>
                {hideCalculations ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    onClick={handleShowCalculations}
                    disabled={!showMemberForces}
                  >
                    Show Calculations
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    onClick={handleHideCalculations}
                    disabled={!showMemberForces}
                  >
                    Hide Calculations
                  </Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <div id="print-only-calc-report" className="print-only-calc-report">
        {geometry && (
          <CalculationReport
            geometryProps={{
              globalGeometry: { span, height, nWeb } as ApiGeometryGlobal,
              trussGeometry: geometry,
              frameWidth: frameWidth,
              frameHeight: frameHeight,
              showNodeLabels: showNodeLabels,
              showMemberLabels: showMemberLabels,
              showForceArrows: showForceArrows,
              memberForcesSummary: memberForcesSummary,
              nodeForces: forceArrows,
            }}
            memberForces={memberForces}
            areaProps={queryToMemberProps(DEFAULT_A, areaProps)}
            elasticModulusProps={queryToMemberProps(DEFAULT_E, elasticModulusProps)}
            memberPropsDefined={true}
            unitType={unitType}
          />
        )}
      </div>
    </>
  );
}
