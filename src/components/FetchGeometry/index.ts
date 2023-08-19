import ApiGeometry from "../Interfaces/ApiGeometry";
import { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";

export const API_URL = "https://api.encompapp.com";
// export const API_URL = "http://127.0.0.1:8000";

// https://www.smashingmagazine.com/2020/07/custom-react-hook-fetch-cache-data/

interface FetchObject {
  show: boolean;
  data: ApiGeometry;
}

export const FetchGeometry = (
  span: number,
  height: number,
  nWeb: number,
  trussDepth?: number,
  trussType?: string
): Promise<FetchObject> => {
  const depth = trussType === "ParallelChordRoofTruss" || "ScissorTruss" ? trussDepth : undefined;

  const request_dict = {
    span: span,
    height: height,
    nWeb: nWeb,
    trussDepth: depth,
    trussType: trussType,
  } as ApiGeometryGlobal;

  const fetchData = async () => {
    let show = false;
    let data = {
      nodes: { 1: { x: 0, y: 0, fixity: "pinned" }, 2: { x: 0, y: 1, fixity: "pinned" } },
      members: { 1: { start: 2, end: 1, type: "chord" } },
    } as ApiGeometry;

    const res = await fetch(`${API_URL}/api/truss-analysis/geometry/`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request_dict),
    });

    const unparsed_data = (await res.json()) as ApiGeometry;

    if (unparsed_data.nodes && unparsed_data.members) {
      data = unparsed_data;
      show = true;
    }

    return { show, data };
  };

  return fetchData();
};
