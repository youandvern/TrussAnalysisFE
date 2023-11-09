import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { useQueryParam } from "use-query-params";
import "./style.css";
import { Grid, Button, Box } from "@mui/material";
import TrussGraph from "../TrussGraph";
import { Nodes, Members } from "../../Types/ApiGeometry";
import MemberForceResults from "../MemberForceResults";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import CalculationReport from "../CalculationReport";
import { unitToForce, unitToLength } from "../UnitSelector";
import CalculateOnEmailButton from "../CalculateOnEmailButton";
import { hideCalculationsDiv, printPdf, showCalculationsDiv } from "./utils";
import { QueryCustomNodesArray } from "./QueryCustomNodesArray";
import {
  ApiCustomAnalysisResultsSuccess,
  MemberAnalysisResults,
} from "../../Types/ApiAnalysisResults";
import { FetchCustomAnalysis } from "../FetchCustomAnalysis";
import { QueryCustomMembersArray } from "./QueryCustomMembersArray";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";

const summarizeMemberForces = (results: MemberAnalysisResults[]) => {
  // Get spread of forces for color calculations
  let max = results[0].axial;
  let min = results[0].axial;
  results.forEach((res) => {
    max = Math.max(max, res.axial);
    min = Math.min(min, res.axial);
  });
  return { max: max, min: min };
};

type Props = {
  unitType: string;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
  showForceArrows: boolean;
  frameWidth: number;
  frameHeight: number;
  graphGridRef: React.RefObject<HTMLDivElement>;
  onRenderGraph: () => void;
};

// clean up standard query params when unmounting
export default function CustomForm({
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  unitType,
  frameWidth,
  frameHeight,
  graphGridRef,
  onRenderGraph,
}: Props) {
  const [customNodes, setCustomNodes] = useQueryParam("cnodes", QueryCustomNodesArray);
  const [customMembers, setCustomMembers] = useQueryParam("cmems", QueryCustomMembersArray);
  const [isStable, setIsStable] = useState(false);
  const [customError, setCustomError] = useState<string>();
  const [customResults, setCustomResults] = useState<ApiCustomAnalysisResultsSuccess>();

  const [hideCalculations, setHideCalculations] = useState(true);
  const [showMemberForces, setShowMemberForces] = useState(false);

  const nNodes = customNodes?.length || 0;
  const isGeometryEntered = nNodes >= 2;
  const isResultCalculated = !!customResults && customResults.isStable;

  const memberForcesSummary =
    customResults?.memberResults && summarizeMemberForces(customResults.memberResults);

  const nodesForGraph: Nodes =
    customNodes
      ?.map((node) => ({ x: node.x, y: node.y, fixity: node.support || "free" }))
      .reduce((ob, val, index) => ({ ...ob, [index]: val }), {}) || {};

  const nodeYs = Object.values(nodesForGraph).map((n) => n.y);
  const nodeXs = Object.values(nodesForGraph).map((n) => n.x);

  const trussHeight = Math.max(...nodeYs) - Math.min(...nodeYs);
  const trussWidth = Math.max(...nodeXs) - Math.min(...nodeXs);

  const membersForGraph: Members =
    customMembers
      ?.map((member, index) => ({
        start: member.start,
        end: member.end,
        color:
          memberForcesSummary &&
          dataToColorScale(
            customResults.memberResults[index].axial,
            memberForcesSummary.max,
            memberForcesSummary.min
          ),
      }))
      .reduce((ob, val, index) => ({ ...ob, [index]: val }), {}) || {};

  const forcesForGraph: number[][] = customNodes?.map((node, index) => [
    index,
    node.Fx || 0,
    node.Fy || 0,
  ]) || [[0, 0, 0]];

  const memberResultHeaders = [
    "Member ID",
    "Start -> End Node",
    `Length (${unitToLength(unitType)})`,
    `Axial Force (${unitToForce(unitType)})`,
  ];
  const memberResultsForDisplay = customResults?.memberResults.map((member) => [
    member.index,
    memberNodesFormatter(member.start, member.end),
    Math.abs(member.length) < 0.0001 ? 0 : +member.length.toPrecision(4),
    Math.abs(member.axial) < 0.0001 ? 0 : +member.axial.toPrecision(4),
  ]);

  const handleHideCalculations = () => {
    setHideCalculations(true);
    hideCalculationsDiv();
  };

  const handleShowCalculations = () => {
    setHideCalculations(false);
    showCalculationsDiv();
  };

  const handleHideAllResults = () => {
    setShowMemberForces(false);
    setCustomResults(undefined);
    handleHideCalculations();
  };

  const updateMemberForcesCustom = useCallback(() => {
    if (!customNodes || !customMembers) {
      return;
    }

    FetchCustomAnalysis({ nodes: customNodes, members: customMembers })
      .then((result) => {
        setIsStable(result.isStable);
        if (!result.success) {
          setCustomError(result.error);
        } else {
          setCustomResults(result);
        }
      })
      .catch((reason) => {
        setCustomError(`There was a problem analyzing this truss. ${reason}`);
      });
  }, [customNodes, customMembers]);

  const cleanUpAllQueryParams = () => {
    setCustomNodes(undefined);
    setCustomMembers(undefined);
  };

  useEffect(() => {
    handleHideAllResults();
  }, [customNodes, customMembers]);

  useEffect(() => {
    return cleanUpAllQueryParams;
  }, []);

  return (
    <>
      <div className="not-calc-report">
        <Grid container columnSpacing={2} rowSpacing={3}>
          <Grid item xs={12}>
            {isGeometryEntered && (
              <Box ref={graphGridRef}>
                <TrussGraph
                  trussHeight={trussHeight}
                  trussWidth={trussWidth}
                  nodes={nodesForGraph}
                  members={membersForGraph}
                  frameWidth={frameWidth}
                  frameHeight={frameHeight}
                  showNodeLabels={showNodeLabels}
                  showMemberLabels={showMemberLabels}
                  showForceArrows={showForceArrows}
                  showAxes={true}
                  memberForcesSummary={memberForcesSummary}
                  nodeForces={forcesForGraph}
                  onRender={onRenderGraph}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <div>This is for adding nodes</div>
              </Grid>
              <Grid item xs={12}>
                <div>This is for adding members</div>
              </Grid>

              <Grid item xs={12} md={4} className="stacked-buttons">
                <CalculateOnEmailButton updateForces={updateMemberForcesCustom} />
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={printPdf}
                  disabled={!isResultCalculated}
                >
                  Print Calculation Report
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={hideCalculations ? handleShowCalculations : handleHideCalculations}
                  disabled={!showMemberForces}
                >
                  {hideCalculations ? "Show Calculations" : "Hide Calculations"}
                </Button>
              </Grid>

              {!hideCalculations || (
                <Grid item xs={12}>
                  <MemberForceResults
                    showResult={showMemberForces}
                    headers={memberResultHeaders}
                    memberForceResults={memberResultsForDisplay || [[0, 0, 0, 0]]}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
      <div id="print-only-calc-report" className="print-only-calc-report">
        {isResultCalculated && (
          <CalculationReport
            geometryProps={{
              trussHeight: trussHeight,
              trussWidth: trussWidth,
              nodes: nodesForGraph,
              members: membersForGraph,
              frameWidth: frameWidth,
              frameHeight: frameHeight,
              showNodeLabels: showNodeLabels,
              showMemberLabels: showMemberLabels,
              showForceArrows: showForceArrows,
              memberForcesSummary: memberForcesSummary,
              nodeForces: forcesForGraph,
            }}
            memberForces={memberResultsForDisplay || [[]]}
            memberForcesHeaders={memberResultHeaders}
            memberProperties={
              customMembers?.map((mem, index) => ({ id: index, A: mem.A || 1, E: mem.E || 1 })) ||
              []
            }
            displacements={customResults.displacements || []}
            member0StiffnessMatrix={customResults.member0StiffnessMatrix}
            structureStiffnessMatrix={customResults.structureStiffnessMatrix}
            structureReducedStiffnessMatrix={customResults.structureReducedStiffnessMatrix}
            reducedForceMatrix={customResults.reducedForceMatrix}
            useDefaultMemberProps={false}
            unitType={unitType}
          />
        )}
      </div>
    </>
  );
}
