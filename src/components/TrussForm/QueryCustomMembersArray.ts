import { CustomMember } from "../../Types/ApiAnalysisResults";

function stringArrayToMember(ar?: string[]): CustomMember {
  try {
    if (!ar || ar.length < 4) {
      return { start: 0, end: 1 };
    }

    return { start: parseInt(ar[0]), end: parseInt(ar[1]), A: +ar[2], E: +ar[3] };
  } catch (e) {
    return { start: 0, end: 1 };
  }
}

const MEMBER_DELIMITER = "_";
const PARAM_DELIMITER = "~";

/**
 * Encodes a CustomMember array as a delimited JSON string.
 *
 * @param {CustomMember[]} array The array to be encoded
 * @return {String} The array as a delimited string
 */
function encodeCustomMemberArrayDelimited(
  array: CustomMember[] | null | undefined
): string | null | undefined {
  if (array == null) {
    return array;
  }

  return array
    .map((member) => [member.start, member.end, member.A || 1, member.E || 1].join(PARAM_DELIMITER))
    .join(MEMBER_DELIMITER);
}

/**
 * Decodes a CustomMember array string and returns it as a typed array
 * or undefined if falsy. Filters out undefined values.
 *
 * @param {String | Array} input The input value
 * @return {Array} The javascript representation
 */
function decodeCustomMemberArrayDelimited(
  input: string | (string | null)[] | null | undefined
): CustomMember[] {
  const arrayStr = input instanceof Array ? input[0] : input;
  if (arrayStr == null || arrayStr === "") return [];

  return arrayStr
    .split(MEMBER_DELIMITER)
    .map((innerString) => innerString.split(PARAM_DELIMITER))
    .map((memberArray) => stringArrayToMember(memberArray));
}

export const QueryCustomMembersArray = {
  encode: (array: CustomMember[] | null | undefined) => encodeCustomMemberArrayDelimited(array),
  decode: (arrayStr: string | (string | null)[] | null | undefined) =>
    decodeCustomMemberArrayDelimited(arrayStr),
};
