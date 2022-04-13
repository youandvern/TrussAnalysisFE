export default interface ApiGeometry {
  nodes: Nodes;
  members: Members;
}

interface Nodes {
  [key: string]: Node;
}

export interface Node {
  x: number;
  y: number;
  fixity: string;
}

interface Members {
  [key: string]: Member;
}

export interface Member {
  start: number;
  end: number;
  type: string;
}

export interface ApiGeometryGlobal {
  span: number;
  height: number;
  nWeb: number;
}
