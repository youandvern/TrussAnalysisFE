import {
  ApiCustomAnalysisResults,
  CustomAnalysisRequest,
} from "../../../shared/types/ApiAnalysisResults";
import { API_URL } from "../../geometry/hooks/FetchGeometry";

export const fetchAnalysis = async (
  request: CustomAnalysisRequest
): Promise<ApiCustomAnalysisResults> => {
  const res = await fetch(`${API_URL}/api/analyze/`, {
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
