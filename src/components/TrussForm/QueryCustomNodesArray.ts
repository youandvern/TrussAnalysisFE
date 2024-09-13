import { CustomNode, SupportType } from "../../Types/ApiAnalysisResults";

type MinSupportType = "p" | "r" | "f" | "y";

function minimizeSupportType(type?: SupportType): MinSupportType {
  return type === "roller" ? "r" : type === "pin" ? "p" : type === "yroller" ? "y" : "f";
}

function maximizeMinSupportType(type?: string): SupportType {
  return type === "r" ? "roller" : type === "p" ? "pin" : type === "y" ? "yroller" : "free";
}

function stringArrayToNode(ar?: string[]): CustomNode {
  try {
    if (!ar || ar.length < 5) {
      return { x: 0, y: 0 };
    }

    return { x: +ar[0], y: +ar[1], support: maximizeMinSupportType(ar[2]), Fx: +ar[3], Fy: +ar[4] };
  } catch (e) {
    return { x: 0, y: 0 };
  }
}

const NODE_DELIMITER = "_";
const PARAM_DELIMITER = "~";

/**
 * Encodes a CustomNode array as a delimited JSON string.
 *
 * @param {CustomNode[]} array The array to be encoded
 * @return {String} The array as a delimited string
 */
function encodeCustomNodeArrayDelimited(
  array: CustomNode[] | null | undefined
): string | null | undefined {
  if (array == null) {
    return array;
  }

  return array
    .map((node) =>
      [node.x, node.y, minimizeSupportType(node.support), node.Fx || 0, node.Fy || 0].join(
        PARAM_DELIMITER
      )
    )
    .join(NODE_DELIMITER);
}

/**
 * Decodes a CustomNode array string and returns it as a typed array
 * or undefined if falsy. Filters out undefined values.
 *
 * @param {String | Array} input The input value
 * @return {Array} The javascript representation
 */
function decodeCustomNodeArrayDelimited(
  input: string | (string | null)[] | null | undefined
): CustomNode[] {
  const arrayStr = input instanceof Array ? input[0] : input;
  if (arrayStr == null || arrayStr === "") return [];

  return arrayStr
    .split(NODE_DELIMITER)
    .map((innerString) => innerString.split(PARAM_DELIMITER))
    .map((nodeArray) => stringArrayToNode(nodeArray));
}

export const QueryCustomNodesArray = {
  encode: (array: CustomNode[] | null | undefined) => encodeCustomNodeArrayDelimited(array),
  decode: (arrayStr: string | (string | null)[] | null | undefined) =>
    decodeCustomNodeArrayDelimited(arrayStr),
};
