import { MemberPropsType } from "../components/MemberPropertiesForm";

export default interface ApiGeometry {
  nodes: Nodes;
  members: Members;
  topNodeIds?: number[];
  botNodeIds?: number[];
}

export interface Nodes {
  [key: string]: Node;
}

export interface Node {
  x: number;
  y: number;
  fixity: string;
}

export interface Members {
  [key: string]: Member;
}

export interface Member {
  start: number;
  end: number;
  type?: string;
  color?: string;
}

export interface ApiGeometryGlobal {
  span: number;
  height: number;
  nWeb: number;
  trussDepth?: number;
  trussType?: string;
  eMod?: MemberPropsType;
  aCross?: MemberPropsType;
}
