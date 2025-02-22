import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, Button, Grid, Tab, Tabs, Theme, Typography, useMediaQuery } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import {
  ArrayParam,
  BooleanParam,
  NumberParam,
  NumericObjectParam,
  StringParam,
  useQueryParam,
} from "use-query-params";
import {
  ApiCustomAnalysisResultsSuccess,
  CustomMember,
  CustomNode,
  MemberGroup,
} from "../../Types/ApiAnalysisResults";
import { Nodes } from "../../Types/ApiGeometry";
import { fetchAnalysis } from "../ApiHooks/FetchAnalysis";
import CalculationReport from "../CalculationReport";
import MemberForceResults from "../MemberForceResults";
import CalculateOnEmailButton from "../SubmitButtons/AnalyzeOnEmail";
import TrussGraph from "../TrussGraph";
import { unitToForce, unitToLength } from "../UnitSelector";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import { summarizeMemberForces } from "../Utilities/memberForces";
import CustomMembers from "./CustomMembers/CustomMembers";
import CustomNodes from "./CustomNodes/CustomNodes";
import { Query2dNumberArray } from "./Query2dNumberArray";
import { QueryCustomMembersArray } from "./QueryCustomMembersArray";
import { QueryCustomNodesArray } from "./QueryCustomNodesArray";
import "./style.css";
import { hideCalculationsDiv, printPdf, showCalculationsDiv } from "./utils";

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
  showMemberGroups: boolean;
  setShowMemberGroups: React.Dispatch<React.SetStateAction<boolean>>;
  frameWidth: number;
  frameHeight: number;
  graphGridRef: React.RefObject<HTMLDivElement>;
  onRenderGraph: () => void;
  startingNodes?: CustomNode[];
  startingMembers?: CustomMember[];
  startingMemberGroups?: string[];
};

export default function CustomForm({
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  showMemberGroups,
  setShowMemberGroups,
  unitType,
  frameWidth,
  frameHeight,
  graphGridRef,
  onRenderGraph,
  startingNodes,
  startingMembers,
  startingMemberGroups,
}: Props) {
  // Standard form query params to clean up
  const [_sp_none, setSpan] = useQueryParam("span", StringParam);
  const [_he_none, setHeight] = useQueryParam("height", StringParam);
  const [_de_none, setDepth] = useQueryParam("depth", StringParam);
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

  const defaultMemberGroup: MemberGroup = { id: 0, name: "All Members" };
  const [memberGroupNames = startingMemberGroups || [defaultMemberGroup.name], setMemberGroups] =
    useQueryParam("grps", ArrayParam);

  const memberGroups: MemberGroup[] = memberGroupNames?.map((name, id) => ({
    id,
    name: name ?? `Group ${id}`,
  })) || [defaultMemberGroup];

  const [isStable, setIsStable] = useState<boolean>();
  const [customError, setCustomError] = useState<string>();
  const [customResults, setCustomResults] = useState<ApiCustomAnalysisResultsSuccess>();

  const [hideCalculations, setHideCalculations] = useState(true);
  const [showMemberForces, setShowMemberForces] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const nNodes = customNodes.length || 0;
  const isGeometryEntered = nNodes >= 2;
  const isResultCalculated = !!customResults && customResults.isStable;

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

  const memberForcesSummary =
    customResults?.memberResults && summarizeMemberForces(customResults.memberResults);

  const memberForceColors: string[] = memberForcesSummary
    ? customResults.memberResults.map((res) =>
        dataToColorScale(res.axial, memberForcesSummary.max, memberForcesSummary.min)
      )
    : [];

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

  const handleAddGroup = () => {
    setMemberGroups((cur) => (!cur ? [defaultMemberGroup.name] : [...cur, `Group ${cur.length}`]));
  };

  const handleEditGroup = (group: MemberGroup) => {
    setMemberGroups((cur) => {
      const newGroups = [...(cur ?? [defaultMemberGroup.name])];
      if (newGroups.length >= group.id + 1) {
        newGroups[group.id] = group.name;
      }
      return newGroups;
    });
  };

  const handleDeleteGroup = (i: number) => {
    if (i < 0) return;

    setMemberGroups((cur) => {
      const newGroups = [...(cur ?? [defaultMemberGroup.name])];
      if (newGroups.length > 0 && newGroups.length > i) {
        newGroups.splice(i, 1);
      }
      return newGroups;
    });

    setCustomMembers((cur) =>
      [...(cur || [])].map((mem) => ({
        ...mem,
        groupId: mem.groupId < i ? mem.groupId : Math.max(0, mem.groupId - 1),
      }))
    );
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

    const forceCorrectedNodes = customNodes.map((node) => ({ ...node, Fy: -1 * (node.Fy || 0) }));
    fetchAnalysis({ nodes: forceCorrectedNodes, members: customMembers })
      .then((result) => {
        setIsStable(result.isStable);
        if (!result.success) {
          setCustomError(result.error);
        } else {
          setCustomError(undefined);
          setShowMemberForces(result.isStable);
          setCustomResults(result);
          setShowMemberGroups(false);
        }
      })
      .catch((reason) => {
        setCustomError(`There was a problem analyzing this truss. ${reason}`);
      });
  }, [customNodes, customMembers, unitType, setShowMemberGroups]);

  useEffect(() => {
    handleHideAllResults();
  }, [customNodes, customMembers]);

  // Populate passed-in query params when provided
  useEffect(() => {
    if (!customNodes?.length && !!startingNodes?.length) {
      setCustomNodes(startingNodes);
    }
  }, [startingNodes]);

  useEffect(() => {
    if (!customMembers?.length && !!startingMembers?.length) {
      setCustomMembers(startingMembers);
    }
  }, [startingMembers]);

  useEffect(() => {
    if (!!startingMemberGroups?.length) {
      setMemberGroups(startingMemberGroups);
    }
  }, [startingMembers]);

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
                  nodes={customNodes}
                  members={customMembers}
                  memberForceColors={memberForceColors}
                  memberColorStyle={showMemberGroups ? "group" : "force"}
                  frameWidth={frameWidth}
                  frameHeight={frameHeight}
                  showNodeLabels={showNodeLabels}
                  showMemberLabels={showMemberLabels}
                  showForceArrows={showForceArrows}
                  showAxes={true}
                  memberForcesSummary={memberForcesSummary}
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
                    memberGroups={memberGroups}
                    onAddGroup={handleAddGroup}
                    onDeleteGroup={handleDeleteGroup}
                    onEditGroup={handleEditGroup}
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
                  results={customResults?.memberResults || []}
                  unitType={unitType}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
      <div id="print-only-calc-report" className="print-only-calc-report">
        {isResultCalculated && customMembers.length && customNodes.length && (
          <CalculationReport
            nodes={customNodes}
            members={customResults.members}
            memberGroups={memberGroups || []}
            memberResults={customResults.memberResults}
            displacements={customResults.displacements || []}
            reactions={customResults.reactions}
            member0StiffnessMatrix={customResults.member0StiffnessMatrix}
            structureStiffnessMatrix={customResults.structureStiffnessMatrix}
            structureReducedStiffnessMatrix={customResults.structureReducedStiffnessMatrix}
            reducedForceMatrix={customResults.reducedForceMatrix}
            frameHeight={frameHeight}
            frameWidth={frameWidth}
            unitType={unitType}
          />
        )}
      </div>
    </>
  );
}
