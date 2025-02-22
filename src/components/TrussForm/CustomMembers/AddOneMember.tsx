import { Alert, Button, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { FormEvent, useState } from "react";
import { CustomMember, MemberGroup } from "../../../Types/ApiAnalysisResults";
import NumInput from "../../FormComponents/NumInput";
import { validateMember } from "./member-validator";

type Props = {
  unitType: string;
  onCreate: (members: CustomMember[]) => void;
  nodeCount: number;
  memberGroups: MemberGroup[];
};

export default function AddOneMember({ onCreate, unitType, nodeCount, memberGroups }: Props) {
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("0");
  const [memberGroup, setMemberGroup] = useState(0);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validMember = validateMember(nodeCount, start, end, memberGroup, memberGroups.length);

    if (!validMember.valid) {
      setValidationError(validMember.error);
    } else {
      setValidationError("");
      onCreate([
        {
          start: validMember.start,
          end: validMember.end,
          groupId: validMember.groupId,
        },
      ]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container columnSpacing={2} rowSpacing={3} sx={{ borderRadius: 1 }}>
        {validationError && (
          <Grid item xs={12}>
            <Alert severity="error">{validationError}</Alert>
          </Grid>
        )}
        <Grid item xs={6}>
          <NumInput
            label="starting node"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>
        <Grid item xs={6}>
          <NumInput
            label="ending node"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            unit=""
            min={0}
            max={999}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="member-group-select-label">member group</InputLabel>
            <Select
              labelId="member-group-select-label"
              id="member-group-select"
              value={memberGroup}
              label="member group"
              onChange={(e) => setMemberGroup(+e.target.value)}
            >
              {memberGroups.map((group) => (
                <MenuItem key={`item-${group.id}-${group.name}`} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            type="submit"
            sx={{ height: "100%" }}
          >
            Add Member
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
