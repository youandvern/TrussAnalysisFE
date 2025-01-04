import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, IconButton, OutlinedInput } from "@mui/material";
import { useState } from "react";
import { MemberGroup } from "../../../Types/ApiAnalysisResults";
import DataTableSimple from "../../DataTableSimple";
import { getColorFromId } from "../../Utilities/DataToColorscale";

const GroupActions = ({
  handleDeleteGroup,
  disabled,
}: {
  handleDeleteGroup: () => void;
  disabled: boolean;
}) => (
  <span style={{ whiteSpace: "nowrap" }}>
    <IconButton aria-label="delete" onClick={handleDeleteGroup} disabled={disabled}>
      <DeleteIcon />
    </IconButton>
  </span>
);

const GroupName = ({
  group,
  handleEditGroup,
}: {
  group: MemberGroup;
  handleEditGroup: Props["onEditGroup"];
}) => {
  const [val, setVal] = useState(group.name);
  return (
    <OutlinedInput
      margin="dense"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={(e) => handleEditGroup({ ...group, name: e.target.value })}
    />
  );
};

const GroupColor = ({ id }: { id: number }) => (
  <Box minWidth={"3em"} height={"1em"} bgcolor={getColorFromId(id)}></Box>
);

type Props = {
  memberGroups: MemberGroup[];
  onAddGroup: () => void;
  onDeleteGroup: (i: number) => void;
  onEditGroup: (group: MemberGroup) => void;
};

export default function MemberGroups({
  memberGroups,
  onAddGroup,
  onDeleteGroup,
  onEditGroup,
}: Props) {
  return (
    <Box overflow="auto" padding={1}>
      <DataTableSimple
        condensed
        centered
        useGenericCells
        headerList={["Group ID", `Name (editable)`, "Color", "Delete"]}
        dataList={memberGroups.map((group) => [
          group.id,
          <GroupName
            group={group}
            handleEditGroup={onEditGroup}
            key={`name-${group.id}-${group.name}`}
          />,
          <GroupColor key={`color-${group.id}-${group.name}`} id={group.id} />,
          <GroupActions
            key={`actions-${group.id}-${group.name}`}
            handleDeleteGroup={() => onDeleteGroup(group.id)}
            disabled={memberGroups.length <= 1}
          />,
        ])}
      />

      <Button
        onClick={onAddGroup}
        sx={{ marginInline: "auto", display: "flex", gap: 1, marginTop: 2 }}
      >
        <AddCircleOutlineIcon /> Add Group
      </Button>
    </Box>
  );
}
