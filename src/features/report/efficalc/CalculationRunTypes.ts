export interface CalcTypeToParse {
  type: string;
  [key: string]: any;
}

export interface CalculationTitle {
  value?: string;
}

export interface Assumption {
  value?: string;
}

export type InputT = "number" | "select" | "text";

export interface InputVariable {
  value?: number | string;
  name?: string;
  unit?: string;
  description?: string;
  reference?: string;
  inputType?: InputT;
  numStep?: number | "any" | null;
  minValue?: number | null;
  maxValue?: number | null;
  selectOptions?: string[] | number[] | null;
  tex?: string;
}

export interface CalcVariable {
  value?: number | string;
  name?: string;
  unit?: string;
  description?: string;
  reference?: string;
  finalResult?: boolean;
  calcLength?: "long" | "number" | "short";
  symbolic?: string;
  substituted?: string;
  resultWithUnit?: string;
  error?: string | null;
}

export interface Canvas {
  svg?: string;
  displayType?: "report-only" | "report-input" | "report-result";
  centered?: boolean;
  caption?: string;
}

export interface Comparison {
  value?: boolean;
  resultMessage?: string;
  unit?: string;
  description?: string;
  reference?: string;
  finalResult?: boolean; // rename finalResult
  symbolic?: string;
  substituted?: string;
  detailedDisplay?: string;
  resultWithUnit?: string;
}

export interface ComparisonForced {
  unit?: string;
  description?: string;
  reference?: string;
  finalResult?: boolean;
  symbolic?: string;
}

export interface TextBlock {
  value?: string;
  reference?: string;
}

export interface FigureBase {
  data?: string;
  caption?: string;
  isFullWidth?: boolean;
  displayType?: "report-only" | "report-input" | "report-result";
}

export interface BodyHeading {
  value?: string;
  reference?: string;
  level?: number;
  numbered?: boolean;
}

export interface Symbolic {
  value?: string;
  name?: string;
  description?: string;
  reference?: string;
  finalResult?: boolean;
  calcLength?: "long" | "number" | "short";
  symbolic?: string;
  error?: string;
}

export interface CalcTable {
  name?: string;
  data?: (string | number)[][];
  headers?: string[];
  title?: string;
  striped?: boolean;
  fullWidth?: boolean;
  resultCheck?: boolean;
  numberedRows?: boolean;
}

export interface InputTableSuperceded {
  value?: (string | number | null)[][];
  name?: string;
  description?: string;
  reference?: string;
}

export interface ResultTableSuperceded {
  value?: (string | number | null)[][];
  name?: string;
  description?: string;
  reference?: string;
  finalResult?: boolean;
}
