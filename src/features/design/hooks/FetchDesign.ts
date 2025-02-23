import { CustomAnalysisRequest } from "../../../shared/types/ApiAnalysisResults";
import { ApiDesignResults } from "../../../shared/types/ApiDesignResults";
import { API_URL } from "../../geometry/hooks/FetchGeometry";

export const fetchDesign = async (request: CustomAnalysisRequest): Promise<ApiDesignResults> => {
  const res = await fetch(`${API_URL}/api/design/`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  if (res.ok) {
    const design = (await res.json()) as ApiDesignResults;
    console.log("\n\nNew Design ~~~~~~~");
    Object.entries(design.groupDesigns).forEach(([k, v]) => {
      console.log(`Design Group ${k}  --  size ${v.designSize}`);
    });

    const trussWeight = Object.values(design.groupDesigns).reduce(
      (prev, cur) => prev + cur.totalWeight,
      0
    );
    console.log(`Total truss weight = ${trussWeight} lbs`);
    return design;
  } else {
    return Promise.reject(`${res.status} - ${res.statusText}`);
  }
};
