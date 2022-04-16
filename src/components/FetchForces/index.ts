import ApiForces, { emptyApiForces } from "../Interfaces/ApiForces";
import ApiGeometry from "../Interfaces/ApiGeometry";
import { ApiGeometryGlobal } from "../Interfaces/ApiGeometry";

// https://www.smashingmagazine.com/2020/07/custom-react-hook-fetch-cache-data/

interface FetchForcesObject {
  show: boolean;
  data: ApiForces;
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
    let data = emptyApiForces;

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
      unparsed_data.memberForces.map((force) => {
        force[3] = Math.abs(force[3]) < 0.0001 ? 0 : +force[3].toPrecision(4);
        return force;
      });
      data = unparsed_data;
      show = true;
    }

    return { show, data };
  };

  return fetchData();
};
