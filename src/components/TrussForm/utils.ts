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

export const numTruncator = (val: number, precision?: number) =>
  +val.toPrecision(precision ? precision : 3) / 1;
