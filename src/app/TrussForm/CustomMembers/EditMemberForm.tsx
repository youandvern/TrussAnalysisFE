import { Alert, Button, FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { FormEvent, useState } from "react";
import NumInput from "../../../shared/components/FormComponents/NumInput";
import { CustomMember, MemberGroup } from "../../../shared/types/ApiAnalysisResults";
import { validateMember } from "./member-validator";

type Props = {
  currentStart: number;
  currentEnd: number;
  currentGroupId: number;
  nodeCount: number;
  memberGroups: MemberGroup[];
  onSubmit: (member: CustomMember) => void;
  onClose: () => void;
};

export default function EditMemberForm({
  currentStart,
  currentEnd,
  currentGroupId,
  nodeCount,
  memberGroups,
  onSubmit,
  onClose,
}: Props) {
  const [start, setStart] = useState(`${currentStart}`);
  const [end, setEnd] = useState(`${currentEnd}`);
  const [memberGroup, setMemberGroup] = useState(currentGroupId);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const validMember = validateMember(nodeCount, start, end, memberGroup, memberGroups.length);

    if (!validMember.valid) {
      setValidationError(validMember.error);
    } else {
      setValidationError("");
      onSubmit({
        start: validMember.start,
        end: validMember.end,
        groupId: validMember.groupId,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "0.5rem" }}>
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
        <Grid item xs={12}>
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
        <Grid item xs={6}>
          <Button variant="outlined" fullWidth color="primary" onClick={onClose}>
            Cancel
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" fullWidth color="primary" type="submit">
            Edit Member
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
