import ApiForces, { ApiForcesParsed, emptyApiForcesParsed } from "../../Types/ApiForces";
import { ApiGeometryGlobal } from "../../Types/ApiGeometry";
import { memberNodesFormatter } from "../Utilities/memberNodesFormatter";
import { unitToForce, unitToLength } from "../UnitSelector";
import { MemberPropsType } from "../MemberPropertiesForm";
import { API_URL } from "../FetchGeometry";

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
  trussDepth?: number,
  trussType?: string,
  unitType?: string,
  eMod?: MemberPropsType,
  aCross?: MemberPropsType
): Promise<FetchForcesObject> => {
  const depth = trussType === "ParallelChordRoofTruss" || "ScissorTruss" ? trussDepth : undefined;
  const request_dict = {
    span: span,
    height: height,
    nWeb: nWeb,
    forces: forces,
    trussDepth: depth,
    trussType: trussType,
    eMod: eMod,
    aCross: aCross,
  } as ApiGeometryGlobal;

  const fetchData = async () => {
    let show = false;
    let data = emptyApiForcesParsed;

    const res = await fetch(`${API_URL}/api/truss-analysis/analysis/`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(request_dict),
    });

    const unparsed_data = (await res.json()) as ApiForces;

    if (unparsed_data.nodes && unparsed_data.members && unparsed_data.memberForces) {
      data = {
        memberForcesHeaders: [
          "Member ID",
          "Start -> End Node",
          `Length (${unitToLength(unitType)})`,
          `Axial Force (${unitToForce(unitType)})`,
        ],
        memberForces: unparsed_data.memberForces.map((force) => [
          force[0],
          memberNodesFormatter(force[1], force[2]),
          Math.abs(force[3]) < 0.0001 ? 0 : +force[3].toPrecision(4),
          Math.abs(force[4]) < 0.0001 ? 0 : +force[4].toPrecision(4),
        ]),
        displacements: unparsed_data.displacements,
        member0StiffnessMatrix: unparsed_data.member0StiffnessMatrix,
        structureStiffnessMatrix: unparsed_data.structureStiffnessMatrix,
        structureReducedStiffnessMatrix: unparsed_data.structureReducedStiffnessMatrix,
        reducedForceMatrix: unparsed_data.reducedForceMatrix,
        reactions: unparsed_data.reactions,
      };
      show = true;
    }

    return { show, data };
  };

  return fetchData();
};
