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
