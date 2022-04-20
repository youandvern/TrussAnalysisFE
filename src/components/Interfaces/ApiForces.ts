import { Nodes, Members } from "./ApiGeometry";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";

export default interface ApiForces {
  nodes: Nodes;
  members: Members;
  memberForces: number[][];
  memberForcesHeaders: string[];
}

export interface ApiForcesParsed {
  memberForces: [number, JSX.Element, number, number][];
  memberForcesHeaders: string[];
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
} as ApiForces;

export const emptyApiForcesParsed = {
  memberForces: [[0, memberNodesFormatter(0, 1), 1, 0]],
  memberForcesHeaders: ["Member ID", "Start -> End Node", "Length (ft)", "Axial Force (kips)"],
} as ApiForcesParsed;
