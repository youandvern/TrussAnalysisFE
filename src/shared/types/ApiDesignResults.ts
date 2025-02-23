import { CalcTypeToParse } from "../../features/report/efficalc/CalculationRunTypes";
import { ApiCustomAnalysisResults } from "./ApiAnalysisResults";

export type ApiDesignResults = {
  analysis: ApiCustomAnalysisResults;
  groupDesigns: Record<number, MemberGroupDesignResults>;
  status: "success";
};

export type MemberGroupDesignResults = {
  designSize: string;
  designSizeArea: number;
  designSizeElasticMod: number;
  totalLength: number;
  totalWeight: number;
  designCalcItems: CalcTypeToParse[];
};
