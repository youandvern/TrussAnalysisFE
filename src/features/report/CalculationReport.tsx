import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, styled, Theme, Typography, useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import DataTableSimple from "../../shared/components/DataTableSimple";
import TrussGraph from "../../shared/components/TrussGraph";
import {
  AnalysisMember,
  CustomMember,
  CustomNode,
  MemberAnalysisResults,
  MemberGroup,
  SupportReaction,
} from "../../shared/types/ApiAnalysisResults";
import { MemberGroupDesignResults } from "../../shared/types/ApiDesignResults";
import { dataToColorScale, getColorFromId } from "../../shared/utils/DataToColorscale";
import { summarizeMemberForces } from "../../shared/utils/memberForces";
import { memberNodesFormatter } from "../../shared/utils/memberNodesFormatter";
import {
  unitToAreaFactorInputToCalc,
  unitToForce,
  unitToInputLength,
  unitToInputStress,
  unitToLength,
  unitToStressFactorInputToCalc,
} from "../geometry/UnitSelector";
import CalcReport from "./efficalc/CalcReport";
import EndNodeSymbol from "./images/EndNodeSymbol.png";
import GeneralMemberDepiction from "./images/GeneralMemberDepiction.png";
import MemberAngleSymbol from "./images/MemberAngleSymbol.png";
import MemberDirectionSymbol from "./images/MemberDirectionSymbol.png";
import StartNodeSymbol from "./images/StartNodeSymbol.png";
import "./style.css";

const matrixNumTruncatorRelative0 = (val: number, absMax: number, precision?: number) => {
  const relativeFactor = Math.abs(val) / absMax;
  if (relativeFactor < 0.000001) {
    return 0;
  } else {
    return numTruncator(val, precision);
  }
};

const numTruncator = (val: number | string | undefined, precision?: number) =>
  val ? +(+val).toPrecision(precision ? precision : 3) : 0;

const arrayToMatrix = (array: any[]) => {
  let matrix = [];
  for (let j = 0; j < array.length; j += 2) {
    matrix.push([j / 2, numTruncator(array[j]), numTruncator(array[j + 1])]);
  }
  return matrix;
};

const StyledLink = styled("a")({
  textDecoration: "none",
  color: "inherit",
  fontWeight: "bold",
});

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
          <tr key={`row-${indexI}`}>
            {val.map((cell, indexJ) => (
              <td key={`cell-${indexJ}`}>{cell}</td>
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

const getMemberGroupToMemberMap = (members: CustomMember[]) => {
  return members.reduce<Record<number, number[]>>((acc, member, id) => {
    const groupId = member.groupId ?? 0;
    acc[groupId] = acc[groupId] || []; // Initialize the group if it doesn't exist
    acc[groupId].push(id); // Add the member to the group
    return acc;
  }, {});
};

export type MemberProperty = { id: number; A: number; E: number };

// expected properties given to Labeled Switch
interface CalcReportProps {
  nodes: CustomNode[];
  members: AnalysisMember[];
  memberGroups: MemberGroup[];
  memberResults: MemberAnalysisResults[];
  displacements: number[];
  reactions: SupportReaction[];
  member0StiffnessMatrix: number[][];
  structureStiffnessMatrix: number[][];
  structureReducedStiffnessMatrix: number[][];
  reducedForceMatrix: number[];
  frameWidth: number;
  frameHeight: number;
  memberGroupDesigns?: Record<number, MemberGroupDesignResults>;
  unitType?: string;
}

// TODO: add design groups summary and designs in new design section

// Div holding calculation report
export default function CalculationReport({
  nodes,
  members,
  memberGroups,
  memberResults,
  displacements,
  reactions,
  member0StiffnessMatrix,
  structureStiffnessMatrix,
  structureReducedStiffnessMatrix,
  reducedForceMatrix,
  unitType,
  frameWidth,
  frameHeight,
  memberGroupDesigns,
}: CalcReportProps) {
  const lengthUnit = unitToLength(unitType);
  const inputLengthUnit = unitToInputLength(unitType);
  const forceUnit = unitToForce(unitType);

  const nodeYs = Object.values(nodes).map((n) => n.y);
  const nodeXs = Object.values(nodes).map((n) => n.x);
  const trussHeight = Math.max(...nodeYs) - Math.min(...nodeYs);
  const trussWidth = Math.max(...nodeXs) - Math.min(...nodeXs);

  const nodeSizeEst = Math.max(trussHeight * 3, trussWidth) / 100;
  const totalWidth = trussWidth + 8 * nodeSizeEst;
  const totalHeight = trussHeight + 9 * nodeSizeEst;
  const trussOnlyFrameHeight = Math.min(frameHeight, (frameWidth * totalHeight) / totalWidth);
  const nNodes = nodes.length;

  const member0A = members[0].aCross * 144;
  const member0E = members[0].eMod / 144;

  const member0Length = memberResults[0].length;
  const factoredK0 = member0StiffnessMatrix.map((row) =>
    row.map((cell) =>
      numTruncator(
        (cell * member0Length) /
          (unitToAreaFactorInputToCalc(unitType) *
            member0A *
            unitToStressFactorInputToCalc(unitType) *
            member0E)
      )
    )
  );

  const memberForcesSummary = summarizeMemberForces(memberResults);

  const memberForceColors: string[] = memberResults.map((res) =>
    dataToColorScale(res.axial, memberForcesSummary.max, memberForcesSummary.min)
  );

  const kFull = structureStiffnessMatrix.map((row) => row.map((val) => numTruncator(val)));
  const kReduced = structureReducedStiffnessMatrix.map((row) =>
    row.map((val) => numTruncator(val))
  );
  const fReduced = [reducedForceMatrix.map((val) => numTruncator(val))];
  const absMaxReaction =
    reactions?.reduce(
      (max, reaction) => Math.max(Math.abs(reaction.x), Math.abs(reaction.y), max),
      0
    ) || 0;
  const roundedReactions =
    reactions?.map((r) => ({
      ...r,
      x: matrixNumTruncatorRelative0(r.x, absMaxReaction, 4),
      y: matrixNumTruncatorRelative0(r.y, absMaxReaction, 4),
    })) || [];

  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const groupIdToMemberIds = useMemo(() => getMemberGroupToMemberMap(members), [members]);

  return (
    <div className="calc-report-container" id="calc-report-container">
      <h1>Truss Analysis Calculations</h1>
      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: "bold" }} gutterBottom>
        Powered by Efficalc
      </Typography>
      <h3 className="no-break">1. Truss Geometry</h3>
      <p>
        The overall configuration of the 2-dimensional truss is shown in Figure 1. The specific node
        and member configurations are also summarized in Table 1 and Table 2 below.
      </p>
      <p>
        The total span of the truss is {trussWidth} {lengthUnit} and overall height of the truss is{" "}
        {trussHeight} {lengthUnit}.
      </p>
      {TrussGraph({
        trussHeight,
        trussWidth,
        nodes,
        members,
        memberForceColors,
        memberForcesSummary: undefined,
        frameHeight: trussOnlyFrameHeight,
        frameWidth,
        showAxes: false,
        showNodeLabels: true,
        showMemberLabels: true,
        showForceArrows: false,
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
        dataList={nodes.map((val, index) => [
          index,
          numTruncator(val.x),
          numTruncator(val.y),
          val.support === "free" ? "--" : val.support,
        ])}
      />
      {caption("Table 1: Structure node geometry")}

      <DataTableSimple
        headerList={["Member ID", "Start -> End Node", `Length (${lengthUnit})`]}
        dataList={memberResults.map((mem, index) => [
          index,
          memberNodesFormatter(mem.start, mem.end),
          Math.abs(mem.length) < 0.0001 ? 0 : +mem.length.toPrecision(4),
        ])}
      />

      {caption("Table 2: Structure member geometry")}
      <h3>2. Applied Loading to Nodes</h3>
      <p>
        The loads applied to this truss structure are represented in Figure 2 and summarized in
        detail below in Table 3. Note that if a node is omitted from Table 3, no loads have been
        applied to it.
      </p>
      {TrussGraph({
        trussHeight,
        trussWidth,
        nodes,
        members,
        memberForceColors,
        memberForcesSummary,
        frameWidth,
        frameHeight: trussOnlyFrameHeight,
        showAxes: false,
        showNodeLabels: true,
        showMemberLabels: false,
        showForceArrows: true,
        keySeed: "2",
      })}
      {caption(
        "Figure 2: Graphical representation of loads applied to the structure (arrow length not to scale)"
      )}

      <DataTableSimple
        headerList={["Node ID", `Fx (${forceUnit})`, `Fy (${forceUnit})`]}
        dataList={
          nodes
            .filter((node) => (node.Fx && node.Fx !== 0) || (node.Fy && node.Fy !== 0))
            .map((node, index) => [index, numTruncator(node.Fx, 4), -numTruncator(node.Fy)]) || [
            [0, 0, 0],
          ]
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
      <div className={smallScreen ? "equation-div small-equation" : "equation-div"}>
        <div className="matrix-eq-div">
          <span>
            k <sub>0</sub> ={" "}
          </span>
          {fraction(
            <span>
              {member0A} {inputLengthUnit} <sup>2</sup> * {member0E} {unitToInputStress(unitType)}
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
        stiffness matrix elements. For this 2-dimensional truss with {nNodes} nodes, the global
        stiffness matrix will be {2 * nNodes}x{2 * nNodes}.
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
        The unknown nodal displacements are calculated by inverting the reduced stiffness matrix and
        multiplying it with the reduced structure force matrix: K<sub>R</sub>
        <sup>-1</sup> &#183; Q<sub>R</sub>
      </p>
      <p>
        Then, the known support displacements of 0 are added to compose the global stiffness matrix,
        D.
      </p>

      <p>
        The resulting displacement at each node along with known support displacements are given
        below:
      </p>

      <DataTableSimple
        headerList={["Node ID", `Δx (${lengthUnit})`, `Δy (${lengthUnit})`]}
        dataList={arrayToMatrix(displacements)}
      />
      {caption("Table 4: Structure node displacements derived from global stiffness matrix")}
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
        trussHeight,
        trussWidth,
        nodes,
        members,
        memberForceColors,
        frameWidth,
        memberForcesSummary,
        frameHeight: trussOnlyFrameHeight,
        showAxes: false,
        showNodeLabels: false,
        showMemberLabels: true,
        showForceArrows: false,
        keySeed: "3",
        memberColorStyle: "force",
      })}
      {caption(`Figure 4: Structure member loading (${forceUnit})`)}

      <DataTableSimple
        headerList={["Member ID", `Length (${lengthUnit})`, `Axial Demand (${forceUnit})`]}
        dataList={memberResults.map((res) => [
          res.index,
          numTruncator(res.length, 4),
          numTruncator(res.axial, 4),
        ])}
      />
      {caption("Table 5: Structure member demand summary (+Compression/-Tension)")}

      <h4>3.7 Calculate support reactions</h4>
      <p>
        First, the unknown values in the global force matrix, Q, is assembled by multiplying the
        global stiffness matrix by the global displacement matrix: Q = K &#183; D{" "}
      </p>
      <p>
        The total force at the truss supports are then found by removing all of the free degrees of
        freedom (reduced structural load matrix, Q<sub>R</sub>) from the force matrix so that only
        the supported degrees of freedom remain.
      </p>
      <p>
        Finally, to calculate the supports, any loads applied to the supports are subtracted out of
        this reduced force matrix yielding the following support reactions:
      </p>
      <DataTableSimple
        headerList={["Node ID", `Rx (${forceUnit})`, `Ry (${forceUnit})`]}
        dataList={roundedReactions.map((r) => [r.index, r.x, r.y])}
      />
      {caption("Table 6: Structure support reaction summary")}

      <h3>4. Member Design</h3>
      <p>
        Members will be designed based on their grouping. An appropriate section size which passes
        the design checks for every member of a given group will be selected and assigned to each
        member in that group.
      </p>
      <h4>4.1 Member Design Groups</h4>

      {TrussGraph({
        trussHeight,
        trussWidth,
        nodes,
        members,
        memberForceColors,
        frameWidth,
        frameHeight: trussOnlyFrameHeight,
        showAxes: false,
        showNodeLabels: false,
        showMemberLabels: true,
        showForceArrows: false,
        memberForcesSummary: undefined,
        keySeed: "4",
        memberColorStyle: "group",
      })}
      {caption("Figure 5: Truss with member ids and colored members based on member design group")}

      <DataTableSimple
        headerList={["Group ID", "Group Name", "Color (above)", "Members in group"]}
        dataList={memberGroups.map((group) => [
          group.id,
          group.name,
          <Box
            key={`gcolor-${group.id}`}
            width={"3em"}
            height={"1em"}
            bgcolor={getColorFromId(group.id)}
          ></Box>,
          (groupIdToMemberIds[group.id] || []).join(", "),
        ])}
      />
      {caption("Table 7: Member group definitions")}

      <h4>4.2 Member Design Summary</h4>
      <DataTableSimple
        headerList={["Group ID", "Designed Size", `Total Length (${lengthUnit})`]}
        dataList={Object.entries(memberGroupDesigns || {}).map(([groupId, groupDesign]) => [
          groupId,
          groupDesign.designSize,
          numTruncator(groupDesign.totalLength, 4),
        ])}
      />
      {caption("Table 8: Member group design summary")}

      <h2>Appendix 1: Member design calculations</h2>
      {Object.entries(memberGroupDesigns || {}).map(([groupId, groupDesign]) => (
        <>
          <h4>Member Design For Group {groupId}</h4>
          <CalcReport runResults={groupDesign.designCalcItems} paperView={false} />
        </>
      ))}

      <Typography marginTop="3rem" textAlign="right">
        Powered by{" "}
        <StyledLink href="https://encompapp.com" target="_blank" rel="noopener noreferrer">
          encompapp.com
        </StyledLink>
      </Typography>
    </div>
  );
}
