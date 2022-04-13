import React from "react";
import { useState, useEffect, useRef } from "react";
import "./style.css";
import NumInput from "../NumInput";
import NumSlider from "../NumSlider";
import TrussGraph from "../TrussGraph";
import { FetchGeometry } from "../FetchGeometry";
import { Grid, Switch, Typography } from "@mui/material";

import ApiGeometry, { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";

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

  const handleShowNodeLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowNodeLabels(event?.target?.checked);
  };

  const handleShowMemberLabels = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowMemberLabels(event?.target?.checked);
  };

  useEffect(() => {
    FetchGeometry(span, height, nWeb).then((result) => {
      // setShowResult(result.show); // for forces results
      // const r = setResults ? setResults(result.data) : null; // for forces results
      setGeometry(result.data);
    });
  }, [span, height, nWeb]);

  // const updateResult = useCallback(() => {
  //   const concrete_props: ConcreteProps = {
  //     fc: fc,
  //     fy: fy,
  //     Es: 29000,
  //     b: w,
  //     h: h,
  //   };

  //   FetchResults(barProps, concrete_props).then((result) => {
  //     setShowResult(result.show);
  //     setGetBeam(result.data);
  //   });
  // }, [fc, fy, w, h, barProps, setShowResult, setGetBeam]);

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
  // useEffect(() => {
  //   setShowResult(false);
  // }, [
  //   nbars,
  //   barsize,
  //   nbarst,
  //   barsizet,
  //   side_cover,
  //   bot_cover,
  //   top_cover,
  //   w,
  //   h,
  //   nlegs,
  //   legsize,
  //   fc,
  //   fy,
  //   setShowResult,
  // ]);

  return (
    <Grid container className="small-margins" spacing={3}>
      <Grid item xs={4} spacing={0} ref={graphGridRef}>
        <Typography variant="caption" color="textSecondary" gutterBottom>
          Node Labels:
          <Switch checked={showNodeLabels} onChange={handleShowNodeLabels} />
        </Typography>
      </Grid>
      <Grid item xs={4} spacing={0} ref={graphGridRef}>
        <Typography variant="caption" color="textSecondary" gutterBottom>
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
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <NumInput
              label="Truss Span"
              value={span}
              onChange={setSpan}
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
              onChange={setHeight}
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
              max={25}
              step={1}
            />
          </Grid>
          <br />
        </Grid>
      </Grid>
    </Grid>
  );
}
