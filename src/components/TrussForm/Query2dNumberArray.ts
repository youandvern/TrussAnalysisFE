// Create datatype for using 2D number arrays with use_query_params:
// https://github.com/pbeshai/use-query-params

const ROW_DELIMITER = ",";
const COLUMN_DELIMITER = "_";

/**
 * Encodes a 2D array as a delimited JSON string.
 *
 * @param {Number[][]} array The array to be encoded
 * @return {String} The array as a delimited string
 */
function encodeNumeric2DArrayDelimited(
  array: number[][] | null | undefined
): string | null | undefined {
  if (array == null) {
    return array;
  }

  return array
    .map((innerArray) => innerArray.map(String).join(COLUMN_DELIMITER))
    .join(ROW_DELIMITER);
}

/**
 * Decodes a 2D number array string and returns it as an array of arrays
 * or undefined if falsy. Filters out undefined values.
 *
 * @param {String | Array} input The input value
 * @return {Array} The javascript representation
 */
function decodeNumeric2DArrayDelimited(
  input: string | (string | null)[] | null | undefined
): number[][] | null | undefined {
  const arrayStr = input instanceof Array ? input[0] : input;
  if (arrayStr == null || arrayStr === "") return null;

  return arrayStr
    .split(ROW_DELIMITER)
    .map((innerString) => innerString.split(COLUMN_DELIMITER).map(Number));
}

export const Query2dNumberArray = {
  encode: (array: number[][] | null | undefined) => encodeNumeric2DArrayDelimited(array),
  decode: (arrayStr: string | (string | null)[] | null | undefined) =>
    decodeNumeric2DArrayDelimited(arrayStr),
};
