import React, { useCallback } from "react";
import { useState, useEffect, useRef } from "react";
import "./style.css";
import NumInput from "../NumInput";
import NumSlider from "../NumSlider";
import TrussGraph from "../TrussGraph";
import { FetchGeometry } from "../FetchGeometry";
import {
  Grid,
  Switch,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  FormGroup,
} from "@mui/material";
import {
  emptyApiForcesParsed,
  ForceRow,
  MemberForcesSummary,
  NodeForceControlled,
  NodeForceSimple,
  NodeForcesSimple,
} from "../Interfaces/ApiForces";
import DataTable from "../DataTableControlled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";
import ApiForces, { emptyApiForces } from "../Interfaces/ApiForces";
import { FormatAlignCenterTwoTone } from "@mui/icons-material";
import { FetchForces } from "../FetchForces";
import MemberForceResults from "../MemberForceResults";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import RowForm from "../RowForm";
import LabeledSwitch from "../LabeledSwitch";

// expected properties to draw beam section
// interface FormProps {
//   setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
//   setResults?: React.Dispatch<React.SetStateAction<ApiGeometry>>;
// }

// Beam shape in input form for beam capacity calculation
export default function TrussForm() {
  const [span, setSpan] = useState(16);
  const [height, setHeight] = useState(4);
  const [nWeb, setNWeb] = useState(1);
  const [geometry, setGeometry] = useState<ApiGeometry>();

  const [frameWidth, setFrameWidth] = useState(window.innerWidth / 2);
  const [frameHeight, setFrameHeight] = useState(window.innerHeight / 2);
  const [topNodes, setTopNodes] = useState<number[]>();

  const graphGridRef = useRef<HTMLDivElement>(null);

  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showMemberLabels, setShowMemberLabels] = useState(false);
  const [showForceArrows, setShowForceArrows] = useState(true);

  const nNodes = geometry?.nodes ? Object.keys(geometry.nodes).length : 0;

  const generateForces = (nForces: number) => {
    let forcest = Array<number>(nForces).fill(0);
    return forcest.map((forcex, index) => [index, 0, 0]);
  };

  const generateForceArrows = (nForces: number) => {
    let forceArrows = {} as NodeForcesSimple;
    for (let i = 0; i < nForces; i++) {
      forceArrows[i.toString()] = { fx: 0, fy: 0 } as NodeForceSimple;
    }
    return forceArrows;
  };

  const [forces, setForces] = useState(generateForces(nNodes));
  const [showForces, setShowForces] = useState(false);
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
      oldForces.map((rowArray, rindex) => {
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

  const handleSetSpan = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSpan(+event?.target?.value);
  };

  const handleSetHeight = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setHeight(+event?.target?.value);
  };

  const handleSetNodeForces = (nodeIds?: number[], formRef?: React.MutableRefObject<null>) => {
    const form = formRef ? formRef.current : null;
    if (nodeIds && form) {
      const fx = +form["Fx"]["value"] || 0;
      const fy = +form["Fy"]["value"] || 0;
      setForces((oldForces) =>
        oldForces.map((rowArray, rindex) => {
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
      console.log("Error: top nodes not found.");
    }
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

  const resetForces = useCallback(() => {
    setForceArrows(generateForceArrows(nNodes));
    setForces(generateForces(nNodes));
  }, [nNodes]);

  useEffect(() => {
    resetForces();
  }, [nWeb, nNodes, resetForces]);

  useEffect(() => {
    FetchGeometry(span, height, nWeb).then((result) => {
      // setShowResult(result.show); // for forces results
      // const r = setResults ? setResults(result.data) : null; // for forces results
      setGeometry(result.data);
    });
  }, [span, height, nWeb]);

  const updateMemberForces = useCallback(() => {
    // Flip y-axis direction
    const forcesCorrected = forces.map((force) => [force[0], force[1], -1 * force[2]]);
    FetchForces(span, height, nWeb, forcesCorrected).then((result) => {
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
      setShowMemberForces(result.show);
      setMemberForces(result.data);
    });
  }, [span, height, nWeb, forces, geometry?.members]);

  // reset truss graph scaling to fit inside component when window size changes
  useEffect(() => {
    function resizeGraph() {
      if (graphGridRef.current !== null) {
        setFrameWidth(graphGridRef.current.offsetWidth);
        setFrameHeight(graphGridRef.current.offsetWidth / 3);
      }
    }

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
  }, [span, height, nWeb, forces]);

  return (
    <Grid container className="small-margins" spacing={3}>
      <Grid item xs={3} spacing={0} ref={graphGridRef}>
        <LabeledSwitch
          label="Node Labels:"
          checked={showNodeLabels}
          handleChange={handleShowNodeLabels}
        />
      </Grid>
      <Grid item xs={3} spacing={0} ref={graphGridRef}>
        <LabeledSwitch
          label="Member Labels:"
          checked={showMemberLabels}
          handleChange={handleShowMemberLabels}
        />
      </Grid>
      <Grid item xs={3} spacing={0} ref={graphGridRef}>
        <LabeledSwitch
          label="Force Arrows:"
          checked={showForceArrows}
          handleChange={handleShowForceArrows}
        />
      </Grid>
      <Grid item xs={12} spacing={0} ref={graphGridRef}>
        {geometry && (
          <TrussGraph
            globalGeometry={{ span, height, nWeb } as ApiGeometryGlobal}
            trussGeometry={geometry}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
            showNodeLabels={showNodeLabels}
            showMemberLabels={showMemberLabels}
            showForceArrows={showForceArrows}
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
              value={span}
              onChange={handleSetSpan}
              unit="ft"
              min={1}
              max={500}
              step={1}
            />
          </Grid>

          <Grid item xs={3}>
            <NumInput
              label="Truss Height"
              value={height}
              onChange={handleSetHeight}
              unit="ft"
              min={1}
              max={200}
              step={1}
            />
          </Grid>

          <Grid item xs={6}>
            <NumSlider
              label="Number of Web Bays (per side):"
              value={nWeb}
              onChange={setNWeb}
              min={1}
              max={10}
              step={1}
            />
          </Grid>

          <Grid item xs={8}>
            <Accordion
              expanded={showForces}
              onChange={(e, expanded) => {
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
                  inputUnit1="kips"
                  inputLabel2="Fy"
                  inputUnit2="kips"
                />
                <RowForm
                  formRef={setBotForcesForm}
                  onSubmit={() => handleSetNodeForces(geometry?.botNodeIds, setBotForcesForm)}
                  buttonTitle="Bottom Nodes:"
                  inputLabel1="Fx"
                  inputUnit1="kips"
                  inputLabel2="Fy"
                  inputUnit2="kips"
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
                  headerList={["Node", "Fx (kips)", "Fy (kips)"]}
                  dataList={forces}
                  setDataList={updateForces}
                  firstColumnEditable={false}
                  title="Individual Node Forces"
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
            <MemberForceResults showResult={showMemberForces} memberForceResults={memberForces} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
