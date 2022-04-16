import { Nodes, Members } from "./ApiGeometry";

export default interface ApiForces {
  nodes: Nodes;
  members: Members;
  memberForces: number[][];
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

export const emptyApiForces = {
  nodes: { 1: { x: 0, y: 0, fixity: "pinned" }, 2: { x: 0, y: 1, fixity: "pinned" } },
  members: { 1: { start: 2, end: 1, type: "chord" } },
  memberForces: [[0, 0, 1, 0]],
  memberForcesHeaders: ["Member ID", "Start Node", "End Node", "Axial Force"],
} as ApiForces;
