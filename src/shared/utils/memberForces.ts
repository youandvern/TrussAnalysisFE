import { MemberAnalysisResults } from "../types/ApiAnalysisResults";

export const summarizeMemberForces = (results: MemberAnalysisResults[]) => {
  // Get spread of forces for color calculations
  let max = results[0].axial;
  let min = results[0].axial;
  results.forEach((res) => {
    max = Math.max(max, res.axial);
    min = Math.min(min, res.axial);
  });
  return { max, min };
};
