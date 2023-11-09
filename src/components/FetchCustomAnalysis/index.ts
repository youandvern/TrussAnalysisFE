import { API_URL } from "../FetchGeometry";
import {
  ApiCustomAnalysisResults,
  CustomAnalysisRequest,
  MemberAnalysisResults,
} from "../../Types/ApiAnalysisResults";

export const FetchCustomAnalysis = async (
  request: CustomAnalysisRequest
): Promise<ApiCustomAnalysisResults> => {
  const res = await fetch(`${API_URL}/api/truss-analysis/custom-analysis/`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (res.ok) {
    return (await res.json()) as ApiCustomAnalysisResults;
  } else {
    return Promise.reject(`${res.status} - ${res.statusText}`);
  }
};
