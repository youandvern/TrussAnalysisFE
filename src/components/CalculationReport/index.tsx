import { Typography } from "@mui/material";
import React from "react";
import DataTableSimple from "../DataTableSimple";
import { ApiForcesParsed } from "../Interfaces/ApiForces";
import TrussGraph, { GeometryProps } from "../TrussGraph";
import "./style.css";

// expected properties given to Labeled Switch
interface CalcReportProps {
  geometryProps: GeometryProps;
  memberForces: ApiForcesParsed;
}

const Caption = (text: string) => (
  <Typography variant="caption" color="textSecondary" component="p" gutterBottom>
    {text}
  </Typography>
);

// Div holding calculation report
export default function CalculationReport({ geometryProps, memberForces }: CalcReportProps) {
  const nodeSize =
    Math.max(geometryProps.globalGeometry.height * 3, geometryProps.globalGeometry.span) / 100;
  const totalWidth = geometryProps.globalGeometry.span + 8 * nodeSize;
  const totalHeight = geometryProps.globalGeometry.height + 9 * nodeSize;
  const trussOnlyFrameHeight = Math.min(
    geometryProps.frameHeight,
    (geometryProps.frameWidth * totalHeight) / totalWidth
  );
  return (
    <div className="calc-report-container" id="calc-report-container">
      <h1>Truss Analysis Calculations</h1>
      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold" }} gutterBottom>
        Powered by Encomp
      </Typography>
      <h3>1.0 Truss Geometry</h3>
      <p>
        The overall configuration of the 2-dimensional truss is shown in Figure 1. The specific node
        and member configurations are also summarized in Table 1 and Table 2 below.
      </p>
      <p>
        The total span of the truss is {geometryProps.globalGeometry.height} ft and overall height
        of the truss is {geometryProps.globalGeometry.span} ft.
      </p>
      {TrussGraph({
        ...geometryProps,
        frameHeight: trussOnlyFrameHeight,
        showAxes: false,
        showNodeLabels: true,
        showMemberLabels: true,
        showForceArrows: false,
        memberForcesSummary: undefined,
        keySeed: "1",
      })}
      {Caption("Figure 1: Truss global configuration")}

      <DataTableSimple
        headerList={["Node ID", "X-Position (ft)", "Y-Position (ft)", "Fixity (if not free)"]}
        dataList={Object.entries(geometryProps.trussGeometry.nodes).map(([index, val]) => [
          index,
          val.x,
          val.y,
          val.fixity === "free" ? "--" : val.fixity,
        ])}
      />
      {Caption("Table 1: Structure node geometry")}

      <DataTableSimple
        headerList={memberForces.memberForcesHeaders.slice(0, 3)}
        dataList={memberForces.memberForces.map((memForce) => memForce.slice(0, 3))}
      />
      {Caption("Table 2: Structure member geometry")}

      <h3>2.0 Applied Loading to Nodes</h3>
      <p>
        The loads applied to this truss structure are represented in Figure 2 and summarized in
        detail below in Table 3. Note that if a node is not listed in Table 3, no loads have been
        applied to it.
      </p>
      {TrussGraph({
        ...geometryProps,
        frameHeight: trussOnlyFrameHeight,
        showAxes: false,
        showNodeLabels: true,
        showMemberLabels: false,
        showForceArrows: true,
        memberForcesSummary: undefined,
        keySeed: "2",
      })}
      {Caption(
        "Figure 2: Graphical representation of loads applied to the structure (arrow length not to scale)"
      )}
    </div>
  );
}
