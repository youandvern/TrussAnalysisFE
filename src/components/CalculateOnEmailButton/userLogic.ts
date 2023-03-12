const EMAIL_SAVED = "emailSaved";
const CALC_COUNT = "calculationCount";

export function userNeedsToSaveEmail(): boolean {
  const storedEmailSaved = localStorage.getItem(EMAIL_SAVED);
  const storedCalcCount = localStorage.getItem(CALC_COUNT);

  const calcCount = storedCalcCount ? +storedCalcCount : 0;
  const emailNotSaved = storedEmailSaved !== "true";

  return emailNotSaved && calcCount > 1;
}

export function incrementCalculationRun(): void {
  const storedCalcCount = localStorage.getItem(CALC_COUNT);

  if (storedCalcCount != null && !isNaN(+storedCalcCount)) {
    localStorage.setItem(CALC_COUNT, `${+storedCalcCount + 1}`);
  } else {
    localStorage.setItem(CALC_COUNT, "1");
  }
}

export function emailConfirmed(): void {
  localStorage.setItem(EMAIL_SAVED, "true");
}
