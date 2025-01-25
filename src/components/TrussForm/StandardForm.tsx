import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrayParam,
  BooleanParam,
  NumberParam,
  ObjectParam,
  StringParam,
  useQueryParam,
} from "use-query-params";
import "./style.css";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Container,
  Grid,
  Typography,
} from "@mui/material";

import { CustomMember, CustomNode, SupportType } from "../../Types/ApiAnalysisResults";
import { emptyApiForcesParsed, MemberForcesSummary } from "../../Types/ApiForces";
import ApiGeometry, { Members, Nodes } from "../../Types/ApiGeometry";
import CalculateOnEmailButton from "../CalculateOnEmailButton";
import CalculationReport from "../CalculationReport";
import DataTable from "../DataTableControlled";
import { fetchAnalysis } from "../FetchCustomAnalysis";
import { FetchGeometry } from "../FetchGeometry";
import MemberForceResults from "../MemberForceResults";
import MemberPropertiesForm, {
  MemberInputPropsType,
  MemberPropsType,
} from "../MemberPropertiesForm";
import NumInput from "../NumInput";
import NumSlider from "../NumSlider";
import { TrussCategory } from "../TrussCategorySelector";
import TrussGraph from "../TrussGraph";
import { ROOF_TRUSS_TYPES, TRUSS_TYPES } from "../TrussStyleSelector";
import { unitToForce, unitToLength } from "../UnitSelector";
import { dataToColorScale } from "../Utilities/DataToColorscale";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";
import LinearLoadForm, { LoadApplication, NodeGroup, OptionalForces } from "./LinearLoadForm";
import { Query2dNumberArray } from "./Query2dNumberArray";
import { QueryCustomMembersArray } from "./QueryCustomMembersArray";
import { QueryCustomNodesArray } from "./QueryCustomNodesArray";
import {
  allNumbers,
  distanceAlongAxis,
  distanceBetweenPoints,
  hideCalculationsDiv,
  numberValOrDefault,
  printPdf,
  showCalculationsDiv,
} from "./utils";

const debounce = require("lodash.debounce");

type MemberType = "top" | "bot" | "web";

const DEFAULT_SPAN = 16;
const DEFAULT_HEIGHT = 4;
const DEFAULT_DEPTH = 1.5;
const DEFAULT_DEPTH_END = 1;
const DEFAULT_NWEB = 1;
const DEFAULT_TRUSS_TYPE = TRUSS_TYPES[0].type;
const DEFAULT_A = "5";
const DEFAULT_E = "29000";
const DEFAULT_USE_DEFAULT_MEMBER = true;
const EMPTY_NODES: Nodes = { "0": { x: 0, y: 0, fixity: "free" } };
const VALIDATION_ERROR = "All input values must be a valid number";

const isDepthRelevant = (trussType: string) =>
  ["ParallelChordRoofTruss", "ScissorTruss", "SemiParallelChordRoofTruss"].includes(trussType);

const isEndDepthRelevant = (trussType: string) => trussType === "SemiParallelChordRoofTruss";

const generateForces = (nForces: number) => {
  let zeros = Array<number>(nForces).fill(0);
  return zeros.map((_zero, index) => [`${index}`, "0", "0"]);
};

const parseMemberType = (type: string): MemberType => {
  if (type === "top" || type === "topChord") {
    return "top";
  } else if (type === "bot" || type === "botChord") {
    return "bot";
  } else {
    return "web";
  }
};

const customGroups: string[] = ["Top Chord", "Bottom Chord", "Web Members"];

const getGroupIdFromType = (maybeType?: string): number => {
  if (!maybeType) return 0;
  const type = parseMemberType(maybeType);
  return type === "top" ? 0 : type === "bot" ? 1 : 2;
};

export function updateGroupId(members: Members): Members {
  const updatedMembers: Members = {};

  for (const key in members) {
    updatedMembers[key] = {
      ...members[key],
      groupId: getGroupIdFromType(members[key].type),
    };
  }

  return updatedMembers;
}

const getFromMemberPropsType = (props: MemberPropsType, type?: string) => {
  const memberType: MemberType = type ? parseMemberType(type) : "web";
  if (memberType === "top") {
    return props.top;
  } else if (memberType === "bot") {
    return props.bot;
  } else {
    return props.web;
  }
};

const queryToMemberProps = (
  defaultVal: string,
  objectVal:
    | {
        [key: string]: string | null | undefined;
      }
    | null
    | undefined
) =>
  ({
    top: +(objectVal?.top ?? defaultVal),
    bot: +(objectVal?.bot ?? defaultVal),
    web: +(objectVal?.web ?? defaultVal),
  } as MemberPropsType);

const queryToMemberInputProps = (
  defaultVal: string,
  objectVal:
    | {
        [key: string]: string | null | undefined;
      }
    | null
    | undefined
) =>
  ({
    top: objectVal?.top ?? defaultVal,
    bot: objectVal?.bot ?? defaultVal,
    web: objectVal?.web ?? defaultVal,
  } as MemberInputPropsType);

type Props = {
  trussCategory: TrussCategory;
  trussType: string | null;
  unitType: string;
  showNodeLabels: boolean;
  showMemberLabels: boolean;
  showForceArrows: boolean;
  frameWidth: number;
  frameHeight: number;
  graphGridRef: React.RefObject<HTMLDivElement>;
  onRenderGraph: () => void;
  setTrussCategory: (
    newValue: TrussCategory | null | undefined,
    updateType?: any | undefined
  ) => void;
  onUnmount: (nodes: CustomNode[], members: CustomMember[], groups: string[]) => void;
};

// clean up standard query params when unmounting
export default function StandardForm({
  showNodeLabels,
  showMemberLabels,
  showForceArrows,
  trussCategory,
  trussType,
  unitType,
  frameWidth,
  frameHeight,
  graphGridRef,
  onRenderGraph,
  setTrussCategory,
  onUnmount,
}: Props) {
  // Custom form query params to clean up
  const [_cnode, setCustomNodes] = useQueryParam("cnodes", QueryCustomNodesArray);
  const [_cmem, setCustomMembers] = useQueryParam("cmems", QueryCustomMembersArray);
  const [_cgroup, setCustomMemberGroups] = useQueryParam("grps", ArrayParam);

  const [span = DEFAULT_SPAN, setSpan] = useQueryParam("span", StringParam);
  const [height = DEFAULT_HEIGHT, setHeight] = useQueryParam("height", StringParam);
  const [depth = DEFAULT_DEPTH, setDepth] = useQueryParam("depth", StringParam);
  const [depthEnd = DEFAULT_DEPTH_END, setDepthEnd] = useQueryParam("depthEnd", StringParam);
  const [nWeb = DEFAULT_NWEB, setNWeb] = useQueryParam("nWeb", NumberParam);
  const [elasticModulusProps, setElasticModulusProps] = useQueryParam("eMod", ObjectParam);
  const [areaProps, setAreaProps] = useQueryParam("area", ObjectParam);
  const [useDefaultMember, setUseDefaultMember] = useQueryParam("defaultProps", BooleanParam);
  const [expandTrussLoads, setExpandTrussLoads] = useState(false);
  const [expandSectionProperties, setExpandSectionProperties] = useState(false);
  const [memberForcesSummary, setMemberForcesSummary] = useState<MemberForcesSummary>();

  const includeDepth = isDepthRelevant(trussType || "");
  const includeDepthEnd = isEndDepthRelevant(trussType || "");

  const [geometry, setGeometry] = useState<ApiGeometry>();
  const nNodes = geometry?.nodes ? Object.keys(geometry.nodes).length : 0;
  const DEFAULT_FORCES = useMemo(() => generateForces(nNodes), [nNodes]);
  const [forces, setForces] = useQueryParam("zforces", Query2dNumberArray);

  const [standardizedForceResults, setStandardizedForceResults] = useState(emptyApiForcesParsed);
  const [hideCalculations, setHideCalculations] = useState(true);
  const [showMemberForces, setShowMemberForces] = useState(false);

  const nodeYs = Object.values(geometry?.nodes || EMPTY_NODES).map((n) => n.y);
  const nodeXs = Object.values(geometry?.nodes || EMPTY_NODES).map((n) => n.x);

  const trussHeight = Math.max(...nodeYs) - Math.min(...nodeYs);
  const trussWidth = Math.max(...nodeXs) - Math.min(...nodeXs);

  const forceUnit = unitToForce(unitType);

  const areaPropsParsed = useRef(queryToMemberProps(DEFAULT_A, areaProps));
  const elasticModulusPropsParsed = useRef(queryToMemberProps(DEFAULT_E, elasticModulusProps));

  const geometryRef = useRef(geometry);
  const forcesRef = useRef(forces);

  const [validationError, setValidationError] = useState("");

  const clearValidationError = () => setValidationError("");

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
    setMemberForcesSummary(undefined);
    handleHideCalculations();
  };

  const updateForces = (
    row: number,
    col: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForces((oldForces) => {
      const newForces = (oldForces || DEFAULT_FORCES).map((rowArray, rindex) => {
        if (rindex === row) {
          const newRow = [...rowArray];
          newRow[col] = e.target.value;
          return newRow;
        }
        return rowArray;
      });
      forcesRef.current = [...newForces];
      return newForces;
    });
    handleHideAllResults();
    clearValidationError();
  };

  const resetForces = useCallback(() => {
    setForces(undefined);
    forcesRef.current = undefined;
    handleHideAllResults();
    clearValidationError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nNodes, setForces]);

  const updateMemberForcesStandard = useCallback(() => {
    // Flip y-axis direction
    const forcesCorrected = (
      forces ?? generateForces(Object.keys(geometry?.nodes ?? {}).length ?? 0)
    ).map((force) => [+force[0], +force[1], -1 * +force[2]]);

    const customNodes: CustomNode[] = Object.entries(geometry?.nodes ?? {}).map(
      ([k, node], idx) => ({
        x: node.x,
        y: node.y,
        support: node.fixity as SupportType,
        Fx: forcesCorrected[idx][1],
        Fy: forcesCorrected[idx][2],
      })
    );

    const customMembers: CustomMember[] = Object.entries(geometry?.members ?? {}).map(
      ([k, mem], idx) => ({
        start: mem.start,
        end: mem.end,
        A: 1,
        E: 29000,
        groupId: mem.type === "topChord" ? 0 : mem.type === "botChord" ? 1 : 2,
      })
    );

    fetchAnalysis({ nodes: customNodes, members: customMembers }).then((result) => {
      if (!result.isStable || !result.success) {
        setValidationError("Analysis failed. Please refresh the page and try again.");
        return;
      }
      // Get spread of forces for color calculations
      let max = result.memberResults[0].axial;
      let min = result.memberResults[0].axial;
      result.memberResults.forEach((mr) => {
        max = Math.max(max, mr.axial);
        min = Math.min(min, mr.axial);
      });

      // Set colors based on forces
      result.memberResults.forEach((mr) => {
        const member = geometry?.members[mr.index.toString()];
        if (member) {
          member.forceColor = dataToColorScale(mr.axial, max, min);
        }
      });

      setMemberForcesSummary({ max, min });
      setExpandTrussLoads(false);
      setExpandSectionProperties(false);
      setShowMemberForces(true);

      const lengthUnit = unitToLength(unitType);
      const forceUnit = unitToForce(unitType);

      const memberForcesHeaders = [
        "Member ID",
        "Start -> End Node",
        `Length (${lengthUnit})`,
        `Axial Force (${forceUnit})`,
      ];

      const memberForces = result?.memberResults.map((member) => [
        member.index,
        memberNodesFormatter(member.start, member.end),
        Math.abs(member.length) < 0.0001 ? 0 : +member.length.toPrecision(4),
        Math.abs(member.axial) < 0.0001 ? 0 : +member.axial.toPrecision(4),
      ]);

      setStandardizedForceResults({
        memberForcesHeaders,
        memberForces,
        displacements: result.displacements || [],
        member0StiffnessMatrix: result.member0StiffnessMatrix,
        structureStiffnessMatrix: result.structureStiffnessMatrix,
        structureReducedStiffnessMatrix: result.structureReducedStiffnessMatrix,
        reducedForceMatrix: result.reducedForceMatrix,
        reactions: result.reactions,
      });
    });
  }, [geometry?.nodes, geometry?.members, forces, unitType]);

  const handleSetSpan = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSpan(event?.target?.value);
  };

  const handleSetHeight = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setHeight(event?.target?.value);
  };

  const handleSetDepth = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setDepth(event?.target?.value);
  };

  const handleSetDepthEnd = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setDepthEnd(event?.target?.value);
  };

  const handleSetArea = (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newArea = e?.target?.value;
    setAreaProps((oldAreaProps) => {
      const newAreaProps = oldAreaProps ? { ...oldAreaProps } : {};
      newAreaProps[memberType] = newArea;
      areaPropsParsed.current = queryToMemberProps(DEFAULT_A, newAreaProps);
      return newAreaProps;
    });
  };

  const handleSetElasticMod = (
    memberType: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newElasticMod = e?.target?.value;
    setElasticModulusProps((oldElasticModProps) => {
      const newElasticModProps = oldElasticModProps ? { ...oldElasticModProps } : {};
      newElasticModProps[memberType] = newElasticMod;
      elasticModulusPropsParsed.current = queryToMemberProps(DEFAULT_E, newElasticModProps);
      return newElasticModProps;
    });
  };

  const handleDistributeLoad = (
    linearForce: OptionalForces,
    nodes: NodeGroup,
    loadApplication: LoadApplication
  ) => {
    const nodeIds = (nodes === "top" ? geometry?.topNodeIds : geometry?.botNodeIds) || [];
    const nodeLoads = spreadLoad(nodeIds, linearForce, loadApplication);

    if (nodeLoads) setNodeForces(nodeLoads);
  };

  // Distribute line load to nodes
  const spreadLoad = (
    nodeIds: number[],
    forcePerLength: OptionalForces,
    loadApplication: LoadApplication
  ) => {
    if (!geometry?.nodes) return;

    const nodeLoads = {} as { [key: number]: OptionalForces };
    for (let i = 0; i < nodeIds.length; i++) {
      let nodeLoadX;
      let nodeLoadY;

      if (loadApplication === "member-length") {
        let prevLength = 0;
        let nextLength = 0;

        const currentNode = geometry.nodes[`${nodeIds[i]}`];
        const prevNode = i > 0 ? geometry.nodes[`${nodeIds[i - 1]}`] : null;
        const nextNode = i < nodeIds.length ? geometry.nodes[`${nodeIds[i + 1]}`] : null;

        if (prevNode) {
          prevLength = distanceBetweenPoints(prevNode.x, prevNode.y, currentNode.x, currentNode.y);
        }

        if (nextNode) {
          nextLength = distanceBetweenPoints(currentNode.x, currentNode.y, nextNode.x, nextNode.y);
        }

        const tributaryLength = (prevLength + nextLength) / 2;

        nodeLoadX = forcePerLength.fx != null ? tributaryLength * forcePerLength.fx : undefined;
        nodeLoadY = forcePerLength.fy != null ? tributaryLength * forcePerLength.fy : undefined;
      } else {
        let prevDistX = 0;
        let prevDistY = 0;
        let nextDistX = 0;
        let nextDistY = 0;

        const currentNode = geometry.nodes[`${nodeIds[i]}`];
        const prevNode = i > 0 ? geometry.nodes[`${nodeIds[i - 1]}`] : null;
        const nextNode = i < nodeIds.length ? geometry.nodes[`${nodeIds[i + 1]}`] : null;

        if (prevNode) {
          prevDistX = distanceAlongAxis(prevNode.x, currentNode.x);
          prevDistY = distanceAlongAxis(prevNode.y, currentNode.y);
        }

        if (nextNode) {
          nextDistX = distanceAlongAxis(nextNode.x, currentNode.x);
          nextDistY = distanceAlongAxis(nextNode.y, currentNode.y);
        }

        const tributaryLengthX = (prevDistX + nextDistX) / 2;
        const tributaryLengthY = (prevDistY + nextDistY) / 2;

        nodeLoadX = forcePerLength.fx != null ? tributaryLengthY * forcePerLength.fx : undefined;
        nodeLoadY = forcePerLength.fy != null ? tributaryLengthX * forcePerLength.fy : undefined;
      }

      nodeLoads[nodeIds[i]] = { fx: nodeLoadX, fy: nodeLoadY };
    }

    return nodeLoads;
  };

  const setNodeForces = (nodeForces: { [key: number]: OptionalForces }) => {
    setForces((oldForces) => {
      const newForces = (oldForces || DEFAULT_FORCES).map((rowArray, rindex) => {
        const nodeIndex = rindex;
        if (nodeIndex in nodeForces) {
          const newRow = [...rowArray];
          const forces = nodeForces[nodeIndex];

          const fx = forces.fx ?? newRow[1];
          const fy = forces.fy ?? newRow[2];

          newRow[1] = `${fx}`;
          newRow[2] = `${fy}`;
          return newRow;
        }
        return rowArray;
      });
      forcesRef.current = [...newForces];
      return newForces;
    });

    handleHideAllResults();
    clearValidationError();
  };

  const handleUseDefaultMember = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event?.target?.checked;
    setUseDefaultMember(checked ? undefined : false);
    if (checked) {
      setElasticModulusProps(undefined);
      elasticModulusPropsParsed.current = queryToMemberProps(DEFAULT_E, undefined);
      setAreaProps(undefined);
      areaPropsParsed.current = queryToMemberProps(DEFAULT_A, undefined);
    }
  };

  // Make sure category is set correctly on mounting for old links with only the truss type in the query params
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      const implicitCategory: TrussCategory = ROOF_TRUSS_TYPES.map((type) => type.type).includes(
        trussType || DEFAULT_TRUSS_TYPE
      )
        ? "roof"
        : "bridge";

      if (implicitCategory !== trussCategory) {
        setTrussCategory(implicitCategory);
      }

      isInitialMount.current = false;
    }
  });

  // nNodes is 0 on initial render, then geometry is fetched for the first time and forces would be reset.
  // If forces are given in URL then we don't want to reset these forces after the initial render, only afterwards.
  const geometryFetchCount = useRef(0);
  useEffect(() => {
    if (geometryFetchCount.current > 1) resetForces();
  }, [nWeb, nNodes, resetForces]);

  const throttledFetchGeometry = useMemo(
    () =>
      debounce(
        (
          span1: number,
          height1: number,
          nWeb1: number,
          depth1: number,
          depthEnd1: number,
          trussType1: string
        ) => {
          if (allNumbers([span1, height1, nWeb1, depth1, depthEnd1])) {
            if (+span1 === 0 || height1 === 0 || depth1 === 0 || depthEnd1 === 0) {
              setValidationError("Span, height, and depth must be non-zero");
              return;
            }
            clearValidationError();
          } else {
            setValidationError(VALIDATION_ERROR);
            return;
          }
          return FetchGeometry(span1, height1, nWeb1, depth1, depthEnd1, trussType1).then(
            (result) => {
              setGeometry(result.data);
              geometryRef.current = result.data;
              geometryFetchCount.current++;
            }
          );
        },
        300
      ),
    []
  );

  useEffect(() => {
    throttledFetchGeometry(
      numberValOrDefault(span, DEFAULT_SPAN),
      numberValOrDefault(height, DEFAULT_HEIGHT),
      nWeb || DEFAULT_NWEB,
      numberValOrDefault(depth, DEFAULT_DEPTH),
      numberValOrDefault(depthEnd, DEFAULT_DEPTH_END),
      trussType || DEFAULT_TRUSS_TYPE
    );
  }, [span, height, nWeb, depth, depthEnd, trussType, throttledFetchGeometry]);

  // hide results if any input changes
  useEffect(() => {
    handleHideAllResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [span, height, nWeb, trussType, unitType, elasticModulusProps, areaProps]);

  // All data has to come from refs, not from state. When unmount, state is not defined.
  const unmountWithGeometry = () => {
    if (geometryRef.current) {
      const customNodes: CustomNode[] = Object.values(geometryRef.current.nodes).map(
        (node, index) => ({
          x: node.x,
          y: node.y,
          support: node.fixity ? (node.fixity as SupportType) : "free",
          Fx: forcesRef.current ? +forcesRef.current[index][1] : 0,
          Fy: forcesRef.current ? +forcesRef.current[index][2] : 0,
        })
      );

      const customMembers: CustomMember[] = Object.values(geometryRef.current.members).map(
        (mem) => ({
          start: mem.start,
          end: mem.end,
          groupId: getGroupIdFromType(mem.type),
          A: getFromMemberPropsType(areaPropsParsed.current, mem.type),
          E: getFromMemberPropsType(elasticModulusPropsParsed.current, mem.type),
        })
      );

      onUnmount(customNodes, customMembers, customGroups);
    }
  };

  useEffect(() => {
    // clean up unused query params on mounting
    setCustomNodes(undefined);
    setCustomMembers(undefined);
    setCustomMemberGroups(undefined);
    return () => {
      unmountWithGeometry();
    };
  }, []);
  return (
    <>
      <div className="not-calc-report">
        <Grid container columnSpacing={2} rowSpacing={3} marginTop={1}>
          <Grid item xs={12}>
            {geometry && (
              <Box ref={graphGridRef}>
                <TrussGraph
                  trussHeight={trussHeight}
                  trussWidth={trussWidth}
                  nodes={geometry.nodes}
                  members={geometry.members}
                  frameWidth={frameWidth}
                  frameHeight={frameHeight}
                  showNodeLabels={showNodeLabels}
                  showMemberLabels={showMemberLabels}
                  showForceArrows={showForceArrows}
                  showAxes={true}
                  memberForcesSummary={memberForcesSummary}
                  nodeForces={(forces ?? DEFAULT_FORCES).map((row) => row.map((f) => +f))}
                  onRender={onRenderGraph}
                  memberColor={"force"}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={includeDepth && !includeDepthEnd ? 4 : 6} md={2}>
                <NumInput
                  label="Truss Span"
                  value={span ?? ""}
                  onChange={handleSetSpan}
                  unit={unitToLength(unitType)}
                  min={0}
                  max={500}
                  step={1}
                />
              </Grid>
              <Grid item xs={includeDepth && !includeDepthEnd ? 4 : 6} md={2}>
                <NumInput
                  label="Truss Height"
                  value={height ?? ""}
                  onChange={handleSetHeight}
                  unit={unitToLength(unitType)}
                  min={1}
                  max={200}
                  step={1}
                />
              </Grid>
              {includeDepth && (
                <Grid item xs={includeDepthEnd ? 6 : 4} md={2}>
                  <NumInput
                    label={includeDepthEnd ? "Middle Depth" : "Truss Depth"}
                    value={depth ?? ""}
                    onChange={handleSetDepth}
                    unit={unitToLength(unitType)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </Grid>
              )}

              {includeDepthEnd && (
                <Grid item xs={6} md={2}>
                  <NumInput
                    label="Depth at Ends"
                    value={depthEnd ?? ""}
                    onChange={handleSetDepthEnd}
                    unit={unitToLength(unitType)}
                    min={1}
                    max={50}
                    step={1}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={includeDepthEnd ? 4 : 6}>
                <Container>
                  <NumSlider
                    label="Number of Web Bays (per side):"
                    value={nWeb ?? DEFAULT_NWEB}
                    onChange={setNWeb}
                    min={1}
                    max={
                      trussType === "ParallelChordRoofTruss" ||
                      trussType === "SemiParallelChordRoofTruss"
                        ? 18
                        : 10
                    }
                    step={1}
                  />
                </Container>
              </Grid>
              {validationError && (
                <Grid item xs={12}>
                  <Alert severity="error">{validationError}</Alert>
                </Grid>
              )}
              <Grid item xs={12} md={8}>
                <Accordion
                  expanded={expandTrussLoads}
                  onChange={(_e, expanded) => {
                    setExpandTrussLoads(expanded);
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
                    <LinearLoadForm
                      forceUnit={forceUnit}
                      lengthUnit={unitToLength(unitType)}
                      applyLoads={handleDistributeLoad}
                    />
                    <Button
                      variant="outlined"
                      fullWidth
                      color="primary"
                      onClick={resetForces}
                      sx={{ height: "100%", marginY: "2em" }}
                    >
                      Reset Forces to Zero
                    </Button>
                    <DataTable
                      headerList={["Node", `Fx (${forceUnit})`, `Fy (${forceUnit})`]}
                      dataList={forces || DEFAULT_FORCES}
                      setDataList={updateForces}
                      firstColumnEditable={false}
                      title="Individual Node Forces"
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion
                  expanded={expandSectionProperties}
                  onChange={(_e, expanded) => {
                    setExpandSectionProperties(expanded);
                  }}
                  sx={{ marginTop: "1em" }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1b-content"
                    id="panel1b-header"
                  >
                    <Typography>Cross-sectional Properties of Members (Optional)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MemberPropertiesForm
                      useDefault={
                        useDefaultMember == null ? DEFAULT_USE_DEFAULT_MEMBER : useDefaultMember
                      }
                      setUseDefault={handleUseDefaultMember}
                      areaProps={queryToMemberInputProps(DEFAULT_A, areaProps)}
                      setAreaProps={handleSetArea}
                      eModulusProps={queryToMemberInputProps(DEFAULT_E, elasticModulusProps)}
                      setEModProps={handleSetElasticMod}
                      unitType={unitType}
                    />
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid item xs={12} md={4} className="stacked-buttons">
                <CalculateOnEmailButton updateForces={updateMemberForcesStandard} />
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={printPdf}
                  disabled={!showMemberForces}
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
                    headers={standardizedForceResults.memberForcesHeaders}
                    memberForceResults={standardizedForceResults.memberForces}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
      <div id="print-only-calc-report" className="print-only-calc-report">
        {geometry && (
          <CalculationReport
            geometryProps={{
              trussHeight: trussHeight,
              trussWidth: trussWidth,
              nodes: geometry.nodes,
              members: updateGroupId(geometry.members),
              frameWidth: frameWidth,
              frameHeight: frameHeight,
              showNodeLabels: showNodeLabels,
              showMemberLabels: showMemberLabels,
              showForceArrows: showForceArrows,
              memberForcesSummary: memberForcesSummary,
              nodeForces: (forces ?? DEFAULT_FORCES).map((row) => row.map((f) => +f)),
            }}
            memberForces={standardizedForceResults.memberForces}
            memberForcesHeaders={standardizedForceResults.memberForcesHeaders}
            memberProperties={Object.values(geometry.members).map((mem, index) => ({
              id: index,
              A: getFromMemberPropsType(queryToMemberProps(DEFAULT_A, areaProps), mem.type),
              E: getFromMemberPropsType(
                queryToMemberProps(DEFAULT_E, elasticModulusProps),
                mem.type
              ),
            }))}
            displacements={standardizedForceResults.displacements || []}
            member0StiffnessMatrix={standardizedForceResults.member0StiffnessMatrix}
            structureStiffnessMatrix={standardizedForceResults.structureStiffnessMatrix}
            structureReducedStiffnessMatrix={
              standardizedForceResults.structureReducedStiffnessMatrix
            }
            reducedForceMatrix={standardizedForceResults.reducedForceMatrix}
            useDefaultMemberProps={useDefaultMember == null ? DEFAULT_USE_DEFAULT_MEMBER : false}
            unitType={unitType}
            reactions={standardizedForceResults.reactions || []}
            memberGroups={customGroups.map((name, id) => ({ id, name }))}
          />
        )}
      </div>
    </>
  );
}
