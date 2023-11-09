import { Nodes, Members } from "./ApiGeometry";
import { memberNodesFormatter } from "../components/Utilities/memberNodesFormatter";

export default interface ApiForces {
  nodes: Nodes;
  members: Members;
  memberForces: number[][];
  memberForcesHeaders: string[];
  displacements: number[];
  member0StiffnessMatrix: number[][];
  structureStiffnessMatrix: number[][];
  structureReducedStiffnessMatrix: number[][];
  reducedForceMatrix: number[];
}

export interface ApiForcesParsed {
  memberForces: (number | JSX.Element)[][];
  memberForcesHeaders: string[];
  displacements: number[];
  member0StiffnessMatrix: number[][];
  structureStiffnessMatrix: number[][];
  structureReducedStiffnessMatrix: number[][];
  reducedForceMatrix: number[];
}

export interface NodeForceControlled {
  value: number;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ForceRow {
  label: string;
  fx: NodeForceControlled;
  fy: NodeForceControlled;
}

export interface NodeForcesSimple {
  [key: string]: NodeForceSimple;
}

export interface NodeForceSimple {
  fx: number;
  fy: number;
}

export interface MemberForcesSummary {
  min: number;
  max: number;
}

export const emptyApiForces = {
  nodes: { 1: { x: 0, y: 0, fixity: "pinned" }, 2: { x: 0, y: 1, fixity: "pinned" } },
  members: { 1: { start: 2, end: 1, type: "chord" } },
  memberForces: [[0, 0, 1, 0]],
  memberForcesHeaders: ["Member ID", "Start Node", "End Node", "Length", "Axial Force"],
  displacements: [0, 0, 0, 0],
  member0StiffnessMatrix: [
    [0, 0],
    [0, 0],
  ],
  structureStiffnessMatrix: [
    [0, 0],
    [0, 0],
  ],
  structureReducedStiffnessMatrix: [
    [0, 0],
    [0, 0],
  ],
  reducedForceMatrix: [0, 0, 0, 0],
} as ApiForces;

export const emptyApiForcesParsed = {
  ...emptyApiForces,
  memberForces: [[0, memberNodesFormatter(0, 1), 1, 0]],
  memberForcesHeaders: ["Member ID", "Start -> End Node", "Length (ft)", "Axial Force (kips)"],
} as ApiForcesParsed;
