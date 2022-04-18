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
} from "@mui/material";
import {
  emptyApiForcesParsed,
  ForceRow,
  MemberForcesSummary,
  NodeForceControlled,
} from "../Interfaces/ApiForces";
import DataTable from "../DataTableControlled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";
import ApiForces, { emptyApiForces } from "../Interfaces/ApiForces";
import { FormatAlignCenterTwoTone } from "@mui/icons-material";
import { FetchForces } from "../FetchForces";
import MemberForceResults from "../MemberForceResults";
import { dataToColorScale } from "../Utilities/DataToColorscale";

// expected properties to draw beam section
// interface FormProps {
//   setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
//   setResults?: React.Dispatch<React.SetStateAction<ApiGeometry>>;
// }

// Beam shape in input form for beam capacity calculation
export default function TrussForm() {
  const [span, setSpan] = useState(12);
  const [height, setHeight] = useState(4);
  const [nWeb, setNWeb] = useState(1);
  const [geometry, setGeometry] = useState<ApiGeometry>();

  const [frameWidth, setFrameWidth] = useState(window.innerWidth / 2);
  const [frameHeight, setFrameHeight] = useState(window.innerHeight / 2);

  const graphGridRef = useRef<HTMLDivElement>(null);

  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showMemberLabels, setShowMemberLabels] = useState(false);

  const nNodes = geometry?.nodes ? Object.keys(geometry.nodes).length : 0;

  const generateForces = useCallback(() => {
    console.log("generate forces");
    let forcest = Array<number>(nNodes).fill(0);
    return forcest.map((forces, index) => [index, 0, 0]);
  }, [nNodes]);

  const [forces, setForces] = useState(generateForces());
  const [showForces, setShowForces] = useState(false);
  const [memberForcesSummary, setMemberForcesSummary] = useState<MemberForcesSummary>();

  const updateForces = (
    row: number,
    col: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log("update forces");

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
  };

  const [showMemberForces, setShowMemberForces] = useState(false);
  const [memberForces, setMemberForces] = useState(emptyApiForcesParsed);

  const handleSetSpan = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    console.log("handle set span " + event?.target?.value);

    setSpan(+event?.target?.value);
  };

  const handleSetHeight = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    console.log("handle set height " + event?.target?.value);

    setHeight(+event?.target?.value);
  };

  const handleShowNodeLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowNodeLabels(event?.target?.checked);
  };

  const handleShowMemberLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowMemberLabels(event?.target?.checked);
  };

  useEffect(() => {
    console.log("set generate forces");

    setForces(generateForces());
  }, [nWeb, generateForces]);

  useEffect(() => {
    console.log("fetch geometry");

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
      console.log("fetch forces");

      // Get spread of forces for color calculations
      let max = result.data.memberForces[0][2];
      let min = result.data.memberForces[0][2];
      result.data.memberForces.forEach((force) => {
        max = Math.max(max, force[2]);
        min = Math.min(min, force[2]);
      });

      // Set colors based on forces
      result.data.memberForces.forEach((force) => {
        const member = geometry?.members[force[0].toString()];
        if (member) {
          member.color = dataToColorScale(force[2], max, min);
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
    console.log("resize graph effect");

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
        <Typography variant="subtitle2" color="textSecondary">
          Node Labels:
          <Switch checked={showNodeLabels} onChange={handleShowNodeLabels} />
        </Typography>
      </Grid>
      <Grid item xs={3} spacing={0} ref={graphGridRef}>
        <Typography variant="subtitle2" color="textSecondary">
          Member Labels:
          <Switch checked={showMemberLabels} onChange={handleShowMemberLabels} />
        </Typography>
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
            memberForcesSummary={memberForcesSummary}
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
                <DataTable
                  headerList={["Node", "Fx", "Fy"]}
                  dataList={forces}
                  setDataList={updateForces}
                  firstColumnEditable={false}
                  title="Node Forces (kips)"
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
