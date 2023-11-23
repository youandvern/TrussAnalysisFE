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
import DataTableSimple from "../../DataTableSimple";
import { CustomMember } from "../../../Types/ApiAnalysisResults";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddOneMember from "./AddOneMember";
import AddMultipleMembers from "./AddMultipleMembers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import EditMemberForm from "./EditMemberForm";
import { unitToInputArea, unitToInputStress } from "../../UnitSelector";

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
}: Props) {
  const [currentMemberIndex, setCurrentMemberIndex] = useState<number>();

  const areaUnit = unitToInputArea(unitType);
  const stressUnit = unitToInputStress(unitType);

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
            headerList={[
              "Member ID",
              `Start Node`,
              `End Node`,
              `Section Area (${areaUnit})`,
              `Elastic Modulus (${stressUnit})`,
              "Edit/Delete",
            ]}
            dataList={customMembers.map((member, index) => [
              index,
              member.start,
              member.end,
              member.A,
              member.E,
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
          <AddOneMember unitType={unitType} onCreate={handleAddMembers} />
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
              currentA={customMembers[currentMemberIndex].A}
              currentE={customMembers[currentMemberIndex].E}
              unitType={unitType}
              onSubmit={onSubmitEdit}
              onClose={onCloseEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
