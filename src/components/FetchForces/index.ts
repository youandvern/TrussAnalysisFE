import ApiForces, {
  ApiForcesParsed,
  emptyApiForces,
  emptyApiForcesParsed,
} from "../Interfaces/ApiForces";
import ApiGeometry from "../Interfaces/ApiGeometry";
import { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";

// https://www.smashingmagazine.com/2020/07/custom-react-hook-fetch-cache-data/

interface FetchForcesObject {
  show: boolean;
  data: ApiForcesParsed;
}

export const FetchForces = (
  span: number,
  height: number,
  nWeb: number,
  forces: number[][],
  type?: string
): Promise<FetchForcesObject> => {
  const request_dict = {
    span: span,
    height: height,
    nWeb: nWeb,
    forces: forces,
    type: type,
  } as ApiGeometryGlobal;

  // https://encompapp.com/
  // http://127.0.0.1:5000

  const fetchData = async () => {
    let show = false;
    let data = emptyApiForcesParsed;

    const res = await fetch("http://127.0.0.1:5000/api/TrussForces", {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request_dict),
    });

    const unparsed_data = (await res.json()) as ApiForces;
    console.log("unparsed data");
    console.log(unparsed_data);

    if (unparsed_data.nodes && unparsed_data.members && unparsed_data.memberForces) {
      data = {
        memberForcesHeaders: [
          "Member ID",
          "Start -> End Node",
          "Length (ft)",
          "Axial Force (kips)",
        ],
        memberForces: unparsed_data.memberForces.map((force) => [
          force[0],
          memberNodesFormatter(force[1], force[2]),
          Math.abs(force[3]) < 0.0001 ? 0 : +force[3].toPrecision(4),
          Math.abs(force[4]) < 0.0001 ? 0 : +force[4].toPrecision(4),
        ]),
      };
      show = true;
    }

    return { show, data };
  };

  return fetchData();
};
