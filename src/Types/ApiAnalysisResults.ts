export type SupportType = "pin" | "roller" | "free";

export type CustomNode = {
  x: number;
  y: number;
  support?: SupportType;
  Fx?: number;
  Fy?: number;
};

export type CustomMember = {
  start: number;
  end: number;
  A?: number;
  E?: number;
};

export type CustomAnalysisRequest = {
  nodes: CustomNode[];
  members: CustomMember[];
};

export type MemberAnalysisResults = {
  index: number;
  start: number;
  end: number;
  length: number;
  axial: number;
};

export type SupportReaction = {
  index: number;
  x: number;
  y: number;
};

export type ApiCustomAnalysisResultsSuccess = {
  success: true;
  isStable: true;
  memberResults: MemberAnalysisResults[];
  displacements: number[];
  reactions: SupportReaction[];
  member0StiffnessMatrix: number[][];
  structureStiffnessMatrix: number[][];
  structureReducedStiffnessMatrix: number[][];
  reducedForceMatrix: number[];
};

export type ApiCustomAnalysisResults =
  | {
      success: false;
      isStable: boolean;
      error?: string;
    }
  | ApiCustomAnalysisResultsSuccess;
