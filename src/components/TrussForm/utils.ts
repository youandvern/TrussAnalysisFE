export const printPdf = () => {
  document
    .querySelectorAll(".not-calc-report")
    .forEach((element) => element?.classList.add("no-print"));
  window.print();
  setTimeout(() => {
    document
      .querySelectorAll(".not-calc-report")
      .forEach((element) => element?.classList.remove("no-print"));
  }, 500);
};

export const showCalculationsDiv = () => {
  document.querySelector(".print-only-calc-report")?.classList.add("show-calc-report");
};

export const hideCalculationsDiv = () => {
  document.querySelector(".print-only-calc-report")?.classList.remove("show-calc-report");
};

export function csvToArray(text: string) {
  let p = "",
    row = [""],
    ret = [row],
    i = 0,
    r = 0,
    s = !0,
    l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if ("," === l && s) l = row[++i] = "";
    else if ("\n" === l && s) {
      if ("\r" === p) row[i] = row[i].slice(0, -1);
      row = ret[++r] = [(l = "")];
      i = 0;
    } else row[i] += l;
    p = l;
  }
  return ret;
}

type Numberish = string | number | null | undefined;

export const numTruncator = (val: number, precision?: number) =>
  +val.toPrecision(precision ? precision : 3) / 1;

export const numberValOrDefault = (val: Numberish, fallback: number) =>
  val != null ? +val : fallback;

export const isNotNumber = (val: Numberish) => (val == null ? true : isNaN(+val));

export const allNumbers = (vals: Numberish[]) => !vals.some(isNotNumber);

export const distanceBetweenPoints = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

export const distanceAlongAxis = (x1: number, x2: number) => Math.abs(x2 - x1);
