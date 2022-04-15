export interface NodeForceControlled {
  value: number;
  changeHandler: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ForceRow {
  label: string;
  fx: NodeForceControlled;
  fy: NodeForceControlled;
}
