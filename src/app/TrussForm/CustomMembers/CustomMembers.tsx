import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { ComponentProps, useState } from "react";
import DataTableSimple from "../../../shared/components/DataTableSimple";
import { CustomMember } from "../../../shared/types/ApiAnalysisResults";
import AddMultipleMembers from "./AddMultipleMembers";
import AddOneMember from "./AddOneMember";
import EditMemberForm from "./EditMemberForm";
import MemberGroups from "./MemberGroups";

const MemberActions = (
  memberIndex: number,
  handleEditMember: (id: number) => void,
  handleDeleteMember: (id: number) => void
) => (
  <span style={{ whiteSpace: "nowrap" }}>
    <IconButton
      aria-label="edit"
      onClick={() => {
        handleEditMember(memberIndex);
      }}
    >
      <EditIcon />
    </IconButton>
    <IconButton
      aria-label="delete"
      onClick={() => {
        handleDeleteMember(memberIndex);
      }}
    >
      <DeleteIcon />
    </IconButton>
  </span>
);

type Props = {
  customMembers: CustomMember[];
  unitType: string;
  handleAddMembers: (members: CustomMember[]) => void;
  handleEditMember: (id: number, member: CustomMember) => void;
  handleDeleteMember: (id: number) => void;
  nodeCount: number;
};

export default function CustomMembers({
  customMembers,
  unitType,
  handleAddMembers,
  handleEditMember,
  handleDeleteMember,
  nodeCount,
  // MemberGroupsProps
  memberGroups,
  onAddGroup,
  onDeleteGroup,
  onEditGroup,
}: Props & ComponentProps<typeof MemberGroups>) {
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>();

  const onClickEdit = (index: number) => {
    setCurrentMemberIndex(index);
  };

  const onCloseEdit = () => {
    setCurrentMemberIndex(undefined);
  };

  const onSubmitEdit = (member: CustomMember) => {
    if (currentMemberIndex !== undefined) {
      handleEditMember(currentMemberIndex, member);
      onCloseEdit();
    }
  };

  return (
    <>
      {customMembers.length > 0 && (
        <Box overflow="auto" padding={1}>
          <DataTableSimple
            condensed
            centered
            headerList={["Member ID", `Start Node`, `End Node`, "Group ID", "Edit/Delete"]}
            dataList={customMembers.map((member, index) => [
              index,
              member.start,
              member.end,
              member.groupId,
              MemberActions(index, onClickEdit, handleDeleteMember),
            ])}
          />
        </Box>
      )}

      <Accordion sx={{ marginTop: "1em" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Add one Member</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddOneMember
            unitType={unitType}
            onCreate={handleAddMembers}
            nodeCount={nodeCount}
            memberGroups={memberGroups}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ marginTop: "1em" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Add multiple Members</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddMultipleMembers
            unitType={unitType}
            onCreate={handleAddMembers}
            nodeCount={nodeCount}
            memberGroups={memberGroups}
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ marginTop: "1em" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Member Groups</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Members will be designed based on their grouping. An appropriate section size which
            passes the design checks for every member of a given group will be selected and assigned
            to each member in that group.
          </Typography>
          <MemberGroups
            memberGroups={memberGroups}
            onAddGroup={onAddGroup}
            onDeleteGroup={onDeleteGroup}
            onEditGroup={onEditGroup}
          />
        </AccordionDetails>
      </Accordion>

      <Dialog open={currentMemberIndex !== undefined} onClose={onCloseEdit}>
        <DialogTitle>Edit Member #{currentMemberIndex}</DialogTitle>
        <DialogContent>
          {currentMemberIndex !== undefined && (
            <EditMemberForm
              currentStart={customMembers[currentMemberIndex].start}
              currentEnd={customMembers[currentMemberIndex].end}
              currentGroupId={customMembers[currentMemberIndex].groupId}
              memberGroups={memberGroups}
              nodeCount={nodeCount}
              onSubmit={onSubmitEdit}
              onClose={onCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
