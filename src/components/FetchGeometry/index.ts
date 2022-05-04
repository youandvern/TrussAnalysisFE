import ApiGeometry from "../Interfaces/ApiGeometry";
import { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";

// https://www.smashingmagazine.com/2020/07/custom-react-hook-fetch-cache-data/

interface FetchObject {
  show: boolean;
  data: ApiGeometry;
}

export const FetchGeometry = (
  span: number,
  height: number,
  nWeb: number,
  trussType?: string
): Promise<FetchObject> => {
  const request_dict = {
    span: span,
    height: height,
    nWeb: nWeb,
    trussType: trussType,
  } as ApiGeometryGlobal;

  // https://encompapp.com/
  // http://127.0.0.1:5000

  const fetchData = async () => {
    let show = false;
    let data = {
      nodes: { 1: { x: 0, y: 0, fixity: "pinned" }, 2: { x: 0, y: 1, fixity: "pinned" } },
      members: { 1: { start: 2, end: 1, type: "chord" } },
    } as ApiGeometry;

    const res = await fetch("http://127.0.0.1:5000/api/TrussGeometry", {
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
