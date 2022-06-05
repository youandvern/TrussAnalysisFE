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
import { unitToLength, unitToForce, unitToCalcStress } from "../UnitSelector";

// expected properties given to Labeled Switch
interface CalcReportProps {
  geometryProps: GeometryProps;
  memberForces: ApiForcesParsed;
  unitType?: string;
}

const matrixNumTruncator = (val: number, precision?: number) =>
  +val.toPrecision(precision ? precision : 3) / 1;

const arrayToMatrix = (array: any[]) => {
  let matrix = [];
  for (let j = 0; j < array.length; j += 2) {
    matrix.push([j / 2, matrixNumTruncator(array[j]), matrixNumTruncator(array[j + 1])]);
  }
  return matrix;
};

const caption = (text: string) => (
  <Typography variant="caption" color="textSecondary" component="p" gutterBottom>
    {text}
  </Typography>
);

const matrix = (data: any[][], scrollable = false) => (
  <div className={"center-align" + (scrollable ? " scrollable-matrix" : "")}>
    <table className="matrix-div">
      <tbody>
        {data.map((val, indexI) => (
          <tr>
            {val.map((cell) => (
              <td>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const exponent = (base: string, exp: string) => (
  <span>
    {base}
    <sup>{exp}</sup>
  </span>
);

const fraction = (top: string | JSX.Element, bottom: string | JSX.Element) => (
  <div className="fraction-container">
    <div className="fraction-top">
      <span>{top}</span>
    </div>
    <div className="fraction-bottom">
      <span>{bottom}</span>
    </div>
  </div>
);

const trigMatrixArray = [
  [exponent("c", "2"), exponent("cs", ""), exponent("-c", "2"), exponent("-cs", "")],
  [exponent("cs", ""), exponent("s", "2"), exponent("-cs", ""), exponent("-s", "2")],
  [exponent("-c", "2"), exponent("-cs", ""), exponent("c", "2"), exponent("cs", "")],
  [exponent("-cs", ""), exponent("-s", "2"), exponent("cs", ""), exponent("s", "2")],
];

// Div holding calculation report
export default function CalculationReport({
  geometryProps,
  memberForces,
  unitType,
}: CalcReportProps) {
  const lengthUnit = unitToLength(unitType);
  const forceUnit = unitToForce(unitType);
  const nodeSizeEst =
    Math.max(geometryProps.globalGeometry.height * 3, geometryProps.globalGeometry.span) / 100;
  const totalWidth = geometryProps.globalGeometry.span + 8 * nodeSizeEst;
  const totalHeight = geometryProps.globalGeometry.height + 9 * nodeSizeEst;
  const trussOnlyFrameHeight = Math.min(
    geometryProps.frameHeight,
    (geometryProps.frameWidth * totalHeight) / totalWidth
  );
  const nodesLength = Object.keys(geometryProps.trussGeometry.nodes).length;

  const member0Length = memberForces.memberForces[0][2];
  const factoredK0 = memberForces.member0StiffnessMatrix.map((row) =>
    row.map((cell) =>
      matrixNumTruncator((cell * member0Length) / (memberForces.globalA * memberForces.globalE))
    )
  );

  const kFull = memberForces.structureStiffnessMatrix.map((row) =>
    row.map((val) => matrixNumTruncator(val))
  );
  const kReduced = memberForces.structureReducedStiffnessMatrix.map((row) =>
    row.map((val) => matrixNumTruncator(val))
  );
  const fReduced = [memberForces.reducedForceMatrix.map((val) => matrixNumTruncator(val))];

  return (
    <div className="calc-report-container" id="calc-report-container">
      <h1>Truss Analysis Calculations</h1>
      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold" }} gutterBottom>
        Powered by Encomp
      </Typography>

      <h3 className="no-break">1. Truss Geometry</h3>
      <p>
        The overall configuration of the 2-dimensional truss is shown in Figure 1. The specific node
        and member configurations are also summarized in Table 1 and Table 2 below.
      </p>
      <p>
        The total span of the truss is {geometryProps.globalGeometry.height} {lengthUnit} and
        overall height of the truss is {geometryProps.globalGeometry.span} {lengthUnit}.
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
      {caption("Figure 1: Truss global configuration")}
      <DataTableSimple
        headerList={[
          "Node ID",
          `X-Position (${lengthUnit})`,
          `Y-Position (${lengthUnit})`,
          "Fixity (if not free)",
        ]}
        dataList={Object.entries(geometryProps.trussGeometry.nodes).map(([index, val]) => [
          index,
          matrixNumTruncator(val.x),
          matrixNumTruncator(val.y),
          val.fixity === "free" ? "--" : val.fixity,
        ])}
      />
      {caption("Table 1: Structure node geometry")}

      <DataTableSimple
        headerList={memberForces.memberForcesHeaders.slice(0, 3)}
        dataList={memberForces.memberForces.map((memForce) => memForce.slice(0, 3))}
      />
      {caption("Table 2: Structure member geometry")}

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
      {caption(
        "Figure 2: Graphical representation of loads applied to the structure (arrow length not to scale)"
      )}
      <DataTableSimple
        headerList={["Node ID", `Fx (${forceUnit})`, `Fy (${forceUnit})`]}
        dataList={
          geometryProps.nodeForces
            ? Object.entries(geometryProps.nodeForces)
                .filter(([id, forces]) => forces.fy !== 0 || forces.fx !== 0)
                .map(([id, forces]) => [id, forces.fx, -forces.fy])
            : [[0, 0, 0]]
        }
      />
      {caption("Table 3: Applied loading to nodes")}

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
      {caption("Figure 3: General member geometry definition")}
      <p>Having member properties:</p>
      <div className="gen-member-note">
        <span>L </span> <ArrowForwardIcon />
        <span> Member length</span>
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
        constant for all members. In this analaysis, A has been set to {memberForces.globalA}{" "}
        {lengthUnit}
        <sup>2</sup> and E has been set to {memberForces.globalE} {unitToCalcStress(unitType)}.
      </p>
      <p>For simplicity in this general example, the following constants are calculated:</p>
      <div className="equation-div">
        <p>c=cosθ</p>
        <p>s=sinθ</p>
      </div>
      <p>And a stiffness matrix is assembled for each member using the following equation:</p>
      <div className="equation-div">
        <div className="matrix-eq-div">
          <span>
            k <sub>i</sub> ={" "}
          </span>
          {fraction("AE", "L")}
          {matrix(trigMatrixArray)}
        </div>
      </div>
      <p>For example, the stiffness matrix for member 0 is:</p>
      <div className="equation-div">
        <div className="matrix-eq-div">
          <span>
            k <sub>0</sub> ={" "}
          </span>
          {fraction(
            <span>
              {memberForces.globalA} {lengthUnit} <sup>2</sup> * {memberForces.globalE}{" "}
              {unitToCalcStress(unitType)}
            </span>,
            member0Length.toPrecision(3) + lengthUnit
          )}
          {matrix(factoredK0)}
        </div>
      </div>

      <h4>3.2 Global Structure Stiffness Matrix</h4>
      <p>
        All of the member stiffness matrices will be combined to form the global structure stiffness
        matrix, K, by grouping each nodal degree of freedom and summing the attached member
        stiffness matrix elements. For this 2-dimensional truss with {nodesLength} nodes, the global
        stiffness matrix will be {2 * nodesLength}x{2 * nodesLength}.
      </p>
      <p>
        This operation yields the following structural stiffness matrix for the above defined truss:
      </p>
      {matrix(kFull, true)}
      {caption("Structure Stiffness Matrix, K")}

      <h4>3.3 Reduced Structure Stiffness Matrix</h4>
      <p>
        With the reactions at the structure supports being unknown, the structure stiffness matrix
        is reduced by removing the rows and columns which correspond to the node support directions,
        resulting in the reduced structure stiffness matrix, K<sub>R</sub> :
      </p>
      {matrix(kReduced, true)}
      {caption("Reduced Structure Stiffness Matrix")}

      <h4>3.4 Reduced structure force matrix</h4>
      <p>
        Given the loads applied to the structure, as described in Table 3, the global force matrix,
        Q, is assembled to match the dimensional size of the reduced structure stiffness matrix.
        Each node degree of freedom for the structure will match between the structure force and
        structure stiffness matrices. Since the reactions at the constrained nodes are unknown until
        the analysis is completed, the node support direction forces are removed from the global
        structure force matrix to create the reduced structure load matrix, Q<sub>R</sub> :
      </p>
      {matrix(fReduced, true)}
      {caption("Structural Load Matrix (reduced)")}

      <h4>3.5 Analysis for global displacements</h4>
      <p>
        The global nodal displacements are calculated by inverting the reduced stiffness matrix and
        multiplying it with the reduced structure force matrix.
      </p>
      <p>
        If member cross-sectional areas and material properties are not representative of the
        real-life truss elements, the node displacements are only of value in comparison to each of
        the others. These relative displacements are used to calculate the internal member forces in
        the determinate truss but will not necessarily be equal to the actual displacements of the
        truss.
      </p>
      <p>The resulting displacements along with known support displacements are given below: </p>
      <DataTableSimple
        headerList={["Node ID", `Δx (${lengthUnit})`, `Δy (${lengthUnit})`]}
        dataList={arrayToMatrix(memberForces.displacements)}
      />
      {caption("Table 4: Structure node displacements")}

      <h4>3.6 Calculate member axial demands</h4>
      <p>
        Using the relative displacements of each member's start and end nodes along with a
        transformed stiffness matrix, the axial demand on a member, q, is calculated as follows:
      </p>
      <div className="equation-div">
        <div className="matrix-eq-div">
          <span>
            q <sub>i</sub> ={" "}
          </span>
          {fraction("AE", "L")}
          {matrix([["-c", "-s", "c", "s"]])}
          {matrix([
            [
              <span>
                Δ<sub>Sx</sub>
              </span>,
            ],
            [
              <span>
                Δ<sub>Sy</sub>
              </span>,
            ],
            [
              <span>
                Δ<sub>Ex</sub>
              </span>,
            ],
            [
              <span>
                Δ<sub>Ey</sub>
              </span>,
            ],
          ])}
        </div>
      </div>
      <p>
        Where Δ<sub>Sx</sub> is the displacement of the starting node in the x-direction for member
        i.
      </p>
      <p>
        The member axial demands for the truss described above are displayed in Figure 4 and
        summarized in detail in Table 5 along with the member's length. Tensile axial loads are
        represented as negative forces, and compression axial demands are represented as positive
        forces.
      </p>
      {TrussGraph({
        ...geometryProps,
        showAxes: false,
        showNodeLabels: false,
        showMemberLabels: true,
        showForceArrows: false,
        keySeed: "3",
      })}
      {caption(`Figure 4: Structure member loading (${forceUnit})`)}
      <DataTableSimple
        headerList={["Member ID", `Length (${lengthUnit})`, `Axial Demand (${forceUnit})`]}
        dataList={memberForces.memberForces.map((row) => [
          row[0],
          matrixNumTruncator(row[2], 4),
          matrixNumTruncator(row[3], 4),
        ])}
      />
      {caption("Table 5: Structure member demand summary (+Compression/-Tension)")}
    </div>
  );
}
