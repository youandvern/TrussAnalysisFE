import { allNumbers } from "../utils";

type ValidatedMember =
  | { valid: false; error: string }
  | {
      valid: true;
      start: number;
      end: number;
      area: number;
      eMod: number;
    };

export function validateMember(
  nodeCount: number,
  start: string,
  end: string,
  area: string,
  eMod: string
): ValidatedMember {
  if (!allNumbers([start, end, area, eMod])) {
    return { valid: false, error: "All input values must be a valid number" };
  }

  const startNum = +start;
  const endNum = +end;
  const areaNum = +area;
  const eModNum = +eMod;

  if (!Number.isInteger(startNum) || !Number.isInteger(endNum)) {
    return { valid: false, error: "Start and end nodes must be valid integers" };
  }

  if (startNum < 0 || startNum >= nodeCount || endNum < 0 || endNum >= nodeCount) {
    return { valid: false, error: "Start and end nodes must be valid node ids" };
  }

  if (areaNum <= 0 || eModNum <= 0) {
    return { valid: false, error: "Area and Elastic Modulus must be greater than 0" };
  }

  return {
    valid: true,
    start: startNum,
    end: endNum,
    area: areaNum,
    eMod: eModNum,
  };
}
