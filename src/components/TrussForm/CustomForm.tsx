import React, { useCallback } from "react";
import { useState, useEffect } from "react";
import { BooleanParam, NumberParam, NumericObjectParam, useQueryParam } from "use-query-params";
import "./style.css";
import { Grid, Button, Box, Typography, useMediaQuery, Theme, Tabs, Tab } from "@mui/material";
import TrussGraph from "../TrussGraph";
import { Nodes, Members } from "../../Types/ApiGeometry";
import MemberForceResults from "../MemberForceResults";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import CalculationReport from "../CalculationReport";
import {
  unitToAreaFactorInputToCalc,
  unitToForce,
  unitToLength,
  unitToStressFactorInputToCalc,
} from "../UnitSelector";
import CalculateOnEmailButton from "../CalculateOnEmailButton";
import { hideCalculationsDiv, printPdf, showCalculationsDiv } from "./utils";
import { QueryCustomNodesArray } from "./QueryCustomNodesArray";
import {
  ApiCustomAnalysisResultsSuccess,
  CustomMember,
  CustomNode,
  MemberAnalysisResults,
} from "../../Types/ApiAnalysisResults";
import { FetchCustomAnalysis } from "../FetchCustomAnalysis";
import { QueryCustomMembersArray } from "./QueryCustomMembersArray";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";
import CustomNodes from "./CustomNodes/CustomNodes";
import CustomMembers from "./CustomMembers/CustomMembers";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Query2dNumberArray } from "./Query2dNumberArray";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-tabpanel-${index}`}
      aria-labelledby={`edit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `edit-tab-${index}`,
    "aria-controls": `edit-tabpanel-${index}`,
  };
}

type Props = {
  unitType: string;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
  showForceArrows: boolean;
  frameWidth: number;
  frameHeight: number;
  graphGridRef: React.RefObject<HTMLDivElement>;
  onRenderGraph: () => void;
  startingNodes?: CustomNode[];
  startingMembers?: CustomMember[];
};

export default function CustomForm({
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  unitType,
  frameWidth,
  frameHeight,
  graphGridRef,
  onRenderGraph,
  startingNodes,
  startingMembers,
}: Props) {
  // Standard form query params to clean up
  const [_sp_none, setSpan] = useQueryParam("span", NumberParam);
  const [_he_none, setHeight] = useQueryParam("height", NumberParam);
  const [_de_none, setDepth] = useQueryParam("depth", NumberParam);
  const [_nW_none, setNWeb] = useQueryParam("nWeb", NumberParam);
  const [_el_none, setElasticModulusProps] = useQueryParam("eMod", NumericObjectParam);
  const [_ar_none, setAreaProps] = useQueryParam("area", NumericObjectParam);
  const [_us_none, setUseDefaultMember] = useQueryParam("defaultProps", BooleanParam);
  const [_fo_none, setForces] = useQueryParam("zforces", Query2dNumberArray);

  const [customNodes = startingNodes || [], setCustomNodes] = useQueryParam(
    "cnodes",
    QueryCustomNodesArray
  );
  const [customMembers = startingMembers || [], setCustomMembers] = useQueryParam(
    "cmems",
    QueryCustomMembersArray
  );

  const [isStable, setIsStable] = useState<boolean>();
  const [customError, setCustomError] = useState<string>();
  const [customResults, setCustomResults] = useState<ApiCustomAnalysisResultsSuccess>();

  const [hideCalculations, setHideCalculations] = useState(true);
  const [showMemberForces, setShowMemberForces] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const nNodes = customNodes.length || 0;
  const isGeometryEntered = nNodes >= 2;
  const isResultCalculated = !!customResults && customResults.isStable;

  const memberForcesSummary =
    customResults?.memberResults && summarizeMemberForces(customResults.memberResults);

  const nodesForGraph: Nodes =
    customNodes
      .map((node) => ({ x: node.x, y: node.y, fixity: node.support || "free" }))
      .reduce((ob, val, index) => ({ ...ob, [index]: val }), {}) || {};

  const nodeYs = Object.values(nodesForGraph).map((n) => n.y);
  const nodeXs = Object.values(nodesForGraph).map((n) => n.x);
  const trussHeight = Math.max(...nodeYs) - Math.min(...nodeYs);
  const trussWidth = Math.max(...nodeXs) - Math.min(...nodeXs);

  const lengthUnit = unitToLength(unitType);
  const forceUnit = unitToForce(unitType);
  const smallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const membersForGraph: Members =
    customMembers
      .map((member, index) => ({
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

  const forcesForGraph: number[][] = customNodes.map((node, index) => [
    index,
    node.Fx || 0,
    node.Fy || 0,
  ]) || [[0, 0, 0]];

  const memberResultHeaders = [
    "Member ID",
    "Start -> End Node",
    `Length (${lengthUnit})`,
    `Axial Force (${forceUnit})`,
  ];
  const memberResultsForDisplay = customResults?.memberResults.map((member) => [
    member.index,
    memberNodesFormatter(member.start, member.end),
    Math.abs(member.length) < 0.0001 ? 0 : +member.length.toPrecision(4),
    Math.abs(member.axial) < 0.0001 ? 0 : +member.axial.toPrecision(4),
  ]);

  const handleAddNodes = (nodes: CustomNode[]) => {
    setCustomNodes((cur) => (cur ? [...cur, ...nodes] : [...nodes]));
  };

  const handleEditNode = (id: number, node: CustomNode) => {
    setCustomNodes((cur) => {
      const newNodes = [...(cur || [])];
      newNodes[id] = node;
      return newNodes;
    });
  };

  const handleDeleteNode = (id: number) => {
    setCustomNodes((cur) => {
      const newNodes = [...(cur || [])];
      newNodes.splice(id, 1);
      return newNodes;
    });

    setCustomMembers((cur) =>
      [...(cur || [])]
        .filter((mem) => mem.start !== id && mem.end !== id)
        .map((mem) => ({
          ...mem,
          start: mem.start < id ? mem.start : mem.start - 1,
          end: mem.end < id ? mem.end : mem.end - 1,
        }))
    );
  };

  const handleAddMembers = (members: CustomMember[]) => {
    setCustomMembers((cur) => (cur ? [...cur, ...members] : [...members]));
  };

  const handleEditMember = (id: number, member: CustomMember) => {
    setCustomMembers((cur) => {
      const newMembers = [...(cur || [])];
      newMembers[id] = member;
      return newMembers;
    });
  };

  const handleDeleteMember = (id: number) => {
    setCustomMembers((cur) => {
      const newMembers = [...(cur || [])];
      newMembers.splice(id, 1);
      return newMembers;
    });
  };

  const handleDeleteAll = () => {
    setCustomMembers([]);
    setCustomNodes([]);
  };

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

    const areaUnitConversionFactor = unitToAreaFactorInputToCalc(unitType);
    const stressUnitConversionFactor = unitToStressFactorInputToCalc(unitType);
    const unitCorrectedMembers = customMembers.map((member) => ({
      ...member,
      A: (member.A || 1) * areaUnitConversionFactor,
      E: (member.E || 1) * stressUnitConversionFactor,
    }));
    const forceCorrectedNodes = customNodes.map((node) => ({ ...node, Fy: -1 * (node.Fy || 0) }));
    FetchCustomAnalysis({ nodes: forceCorrectedNodes, members: unitCorrectedMembers })
      .then((result) => {
        setIsStable(result.isStable);
        if (!result.success) {
          setCustomError(result.error);
        } else {
          setCustomError(undefined);
          setShowMemberForces(result.isStable);
          setCustomResults(result);
        }
      })
      .catch((reason) => {
        setCustomError(`There was a problem analyzing this truss. ${reason}`);
      });
  }, [customNodes, customMembers, unitType]);

  useEffect(() => {
    handleHideAllResults();
  }, [customNodes, customMembers]);

  useEffect(() => {
    if (!customNodes?.length && !!startingNodes?.length) {
      setCustomNodes(startingNodes);
    }
    if (!customMembers?.length && !!startingMembers?.length) {
      setCustomMembers(startingMembers);
    }
  }, [startingNodes, startingMembers]);

  useEffect(() => {
    // clean up all unused query params
    setSpan(undefined);
    setHeight(undefined);
    setDepth(undefined);
    setNWeb(undefined);
    setElasticModulusProps(undefined);
    setAreaProps(undefined);
    setUseDefaultMember(undefined);
    setForces(undefined);
  }, []);

  return (
    <>
      <div className="not-calc-report">
        <Grid container columnSpacing={2} rowSpacing={3} marginTop={1}>
          <Grid item xs={12}>
            {isGeometryEntered ? (
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
            ) : (
              <Box
                marginTop={1}
                height={smallScreen ? 120 : 240}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border={1}
                borderRadius={4}
                sx={{ backgroundColor: (theme) => theme.palette.grey[200] }}
              >
                <Typography fontWeight="bold" textAlign="center">
                  Add at least 2 nodes to see geometry
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", md: "row" }}
                  justifyContent={{ xs: "start", md: "space-between" }}
                  gap={2}
                >
                  <Box borderBottom={1} borderColor="divider" flexGrow={1}>
                    <Tabs
                      value={tabIndex}
                      onChange={(e, v) => setTabIndex(v)}
                      aria-label="edit nodes or members tabs"
                    >
                      <Tab label="Edit Nodes" {...a11yProps(0)} />
                      <Tab label="Edit Members" {...a11yProps(1)} />
                    </Tabs>
                  </Box>
                  <Button onClick={handleDeleteAll}>
                    <DeleteIcon /> <b>Clear All</b>
                  </Button>
                </Box>
                <CustomTabPanel value={tabIndex} index={0}>
                  <CustomNodes
                    lengthUnit={lengthUnit}
                    forceUnit={forceUnit}
                    customNodes={customNodes}
                    unitType={unitType}
                    handleAddNodes={handleAddNodes}
                    handleEditNode={handleEditNode}
                    handleDeleteNode={handleDeleteNode}
                  />
                </CustomTabPanel>
                <CustomTabPanel value={tabIndex} index={1}>
                  <CustomMembers
                    customMembers={customMembers}
                    unitType={unitType}
                    handleAddMembers={handleAddMembers}
                    handleEditMember={handleEditMember}
                    handleDeleteMember={handleDeleteMember}
                    nodeCount={customNodes.length}
                  />
                </CustomTabPanel>
              </Grid>

              {isStable === false && (
                <Grid item xs={12}>
                  <Typography
                    display="flex"
                    color={(theme) => theme.palette.error.dark}
                    padding={{ xs: 0, sm: 2 }}
                  >
                    <ErrorIcon /> Truss is not stable. Cannot complete analysis.
                  </Typography>
                </Grid>
              )}

              {customError && (
                <Grid item xs={12}>
                  <Typography
                    display="flex"
                    color={(theme) => theme.palette.error.dark}
                    padding={{ xs: 0, sm: 2 }}
                  >
                    <ErrorIcon /> Error: {customError}
                  </Typography>
                </Grid>
              )}

              {customResults && (
                <Typography
                  display="flex"
                  color={(theme) => theme.palette.success.dark}
                  padding={{ xs: 0, sm: 2 }}
                >
                  <CheckCircleIcon /> Analysis succeeded! View member results below or display
                  complete calculations and results by clicking "Show Calculations"
                </Typography>
              )}

              <Grid item xs={12} md={4}>
                <CalculateOnEmailButton updateForces={updateMemberForcesCustom} filled />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={printPdf}
                  disabled={!isResultCalculated}
                >
                  Print Calculation Report
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
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

              <Grid item xs={12}>
                <MemberForceResults
                  showResult={showMemberForces && hideCalculations}
                  headers={memberResultHeaders}
                  memberForceResults={memberResultsForDisplay || [[0, 0, 0, 0]]}
                />
              </Grid>
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
              customMembers.map((mem, index) => ({ id: index, A: mem.A || 1, E: mem.E || 1 })) || []
            }
            displacements={customResults.displacements || []}
            member0StiffnessMatrix={customResults.member0StiffnessMatrix}
            structureStiffnessMatrix={customResults.structureStiffnessMatrix}
            structureReducedStiffnessMatrix={customResults.structureReducedStiffnessMatrix}
            reducedForceMatrix={customResults.reducedForceMatrix}
            useDefaultMemberProps={false}
            unitType={unitType}
            reactions={customResults.reactions}
          />
        )}
      </div>
    </>
  );
}
