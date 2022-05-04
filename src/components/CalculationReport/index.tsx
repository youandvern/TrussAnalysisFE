import { Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";
import DataTableSimple from "../DataTableSimple";
import { ApiForcesParsed } from "../Interfaces/ApiForces";
import TrussGraph, { GeometryProps } from "../TrussGraph";
import "./style.css";
import GeneralMemberDepiction from "./images/GeneralMemberDepiction.png";
import EndNodeSymbol from "./images/EndNodeSymbol.png";
import MemberDirectionSymbol from "./images/MemberDirectionSymbol.png";
import MemberAngleSymbol from "./images/MemberAngleSymbol.png";
import StartNodeSymbol from "./images/StartNodeSymbol.png";

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
      <h3>1. Truss Geometry</h3>
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

      <h3>2. Applied Loading to Nodes</h3>
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
      <h3>3. Truss Analysis Using the Direct Stiffness Method</h3>
      <p>
        With the truss geometry and loading defined above, the member forces and deflections are
        calculated using the direct stiffness method. It is assumed that all members behave
        elastically and have sufficient strength at connections to transfer the required load to the
        member.
      </p>
      <h4>3.1 Member Stiffness Matrix</h4>
      <p>
        First, each member stiffness matrix is composed in the global coordinate system. For truss
        analysis, it is assumed that both ends of the member are rotationally unconstrained so that
        each member will only be loaded axially. The member stiffness matrix in the global
        coordinate system will be a 4x4 matrix for a 2-dimensional truss. Each member will be
        defined as follows:
      </p>
      <div className="gen-member-group">
        <div className="gen-member-pic">
          <img src={GeneralMemberDepiction} alt="General member geometry" />
        </div>
        <div className="gen-member-notes">
          <div className="gen-member-note">
            <img className="symbol-pic" src={StartNodeSymbol} alt="Symbol for starting node" />
            <ArrowForwardIcon />
            <span> Member starting node</span>
          </div>
          <div className="gen-member-note">
            <img className="symbol-pic" src={EndNodeSymbol} alt="Symbol for ending node" />
            <ArrowForwardIcon />
            <span> Member ending node</span>
          </div>
          <div className="gen-member-note">
            <img
              className="symbol-pic"
              src={MemberAngleSymbol}
              alt="Symbol for member direction angle"
            />
            <ArrowForwardIcon />
            <span> Member rotation angle from horizontal</span>
          </div>
          <div className="gen-member-note">
            <img
              className="symbol-pic"
              src={MemberDirectionSymbol}
              alt="Symbol for member direction"
            />
            <ArrowForwardIcon />
            <span> Member direction</span>
          </div>
        </div>
      </div>
      {Caption("Figure 3: General member geometry definition")}
      <p>Having member properties:</p>
      <div className="gen-member-note">
        <span>L </span> <ArrowForwardIcon />
        <span> Member starting node</span>
      </div>
      <div className="gen-member-note">
        <span>A </span> <ArrowForwardIcon />
        <span> Member cross-sectional area</span>
      </div>
      <div className="gen-member-note">
        <span>E </span> <ArrowForwardIcon />
        <span> Member material modulus of elasticity</span>
      </div>
      <p>
        For member axial demand analysis of a determinate truss, A and E may be set equal to any
        constant for all members.
      </p>
      <p>For simplicity in this general example, the following constants are calculated:</p>
      <div className="equation-div">
        <p>c=cosθ</p>
        <p>s=sinθ</p>
      </div>
    </div>
  );
}
