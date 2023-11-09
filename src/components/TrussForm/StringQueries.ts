import { TrussCategory } from "../TrussCategorySelector";

/**
 * Encodes a CustomMember array as a delimited JSON string.
 *
 * @param {TrussCategory} category The category to be encoded
 * @return {String} The category as a string
 */
function encodeCategory(category: TrussCategory | null | undefined): string | null | undefined {
  return `${category}`;
}

/**
 * Decodes a string and returns it as a category
 * or undefined if falsy. Filters out undefined values.
 *
 * @param {String | Array} input The input value
 * @return {TrussCategory} The javascript representation
 */
function decodeCategory(
  input: string | (string | null)[] | null | undefined
): TrussCategory | null {
  const categoryString = input instanceof Array ? input[0] : input;
  if (categoryString == null || categoryString === "") return null;

  if (categoryString == "custom") {
    return "custom";
  } else if (categoryString == "roof") {
    return "roof";
  } else {
    return "bridge";
  }
}

export const CategoryParam = {
  encode: (category: TrussCategory | null | undefined) => encodeCategory(category),
  decode: (categoryStr: string | (string | null)[] | null | undefined) =>
    decodeCategory(categoryStr),
};
