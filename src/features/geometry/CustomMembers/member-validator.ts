import { allNumbers, isNotNumber } from "../../../app/TrussForm/utils";

type ValidatedMember =
  | { valid: false; error: string }
  | {
      valid: true;
      start: number;
      end: number;
      groupId: number;
    };

export function validateMember(
  nodeCount: number,
  start: string,
  end: string,
  memberGroup: number | string,
  memberGroupCount: number
): ValidatedMember {
  if (!allNumbers([start, end])) {
    return { valid: false, error: "All input values must be a valid number" };
  }

  if (isNotNumber(memberGroup)) {
    return { valid: false, error: "Selected member group is invalid" };
  }

  const startNum = +start;
  const endNum = +end;
  const groupNum = +memberGroup;

  if (!Number.isInteger(startNum) || !Number.isInteger(endNum)) {
    return { valid: false, error: "Start and end nodes must be valid integers" };
  }

  if (startNum < 0 || startNum >= nodeCount || endNum < 0 || endNum >= nodeCount) {
    return { valid: false, error: "Start and end nodes must be valid node ids" };
  }

  if (groupNum < 0 || groupNum >= memberGroupCount) {
    return { valid: false, error: "Selected member group is invalid" };
  }

  return {
    valid: true,
    start: startNum,
    end: endNum,
    groupId: groupNum,
  };
}
