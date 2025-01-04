import { allNumbers, isNotNumber } from "../utils";

type ValidatedMember =
  | { valid: false; error: string }
  | {
      valid: true;
      start: number;
      end: number;
      area: number;
      eMod: number;
      groupId: number;
    };

export function validateMember(
  nodeCount: number,
  start: string,
  end: string,
  area: string,
  eMod: string,
  memberGroup: number | string,
  memberGroupCount: number
): ValidatedMember {
  if (!allNumbers([start, end, area, eMod])) {
    return { valid: false, error: "All input values must be a valid number" };
  }

  if (isNotNumber(memberGroup)) {
    return { valid: false, error: "Selected member group is invalid" };
  }

  const startNum = +start;
  const endNum = +end;
  const areaNum = +area;
  const eModNum = +eMod;
  const groupNum = +memberGroup;

  if (!Number.isInteger(startNum) || !Number.isInteger(endNum)) {
    return { valid: false, error: "Start and end nodes must be valid integers" };
  }

  if (startNum < 0 || startNum >= nodeCount || endNum < 0 || endNum >= nodeCount) {
    return { valid: false, error: "Start and end nodes must be valid node ids" };
  }

  if (areaNum <= 0 || eModNum <= 0) {
    return { valid: false, error: "Area and Elastic Modulus must be greater than 0" };
  }

  if (groupNum < 0 || groupNum >= memberGroupCount) {
    return { valid: false, error: "Selected member group is invalid" };
  }

  return {
    valid: true,
    start: startNum,
    end: endNum,
    area: areaNum,
    eMod: eModNum,
    groupId: groupNum,
  };
}
