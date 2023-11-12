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
import { CustomNode } from "../../../Types/ApiAnalysisResults";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddOneNode from "./AddOneNode";
import AddMultipleNodes from "./AddMultipleNodes";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import EditNodeForm from "./EditNodeForm";
import { numTruncator } from "../utils";

const NodeActions = (
  nodeIndex: number,
  handleEditNode: (id: number) => void,
  handleDeleteNode: (id: number) => void
) => (
  <span style={{ whiteSpace: "nowrap" }}>
    <IconButton
      aria-label="edit"
      onClick={() => {
        handleEditNode(nodeIndex);
      }}
    >
      <EditIcon />
    </IconButton>
    <IconButton
      aria-label="delete"
      onClick={() => {
        handleDeleteNode(nodeIndex);
      }}
    >
      <DeleteIcon />
    </IconButton>
  </span>
);

type Props = {
  lengthUnit: string;
  forceUnit: string;
  customNodes: CustomNode[];
  unitType: string;
  handleAddNodes: (nodes: CustomNode[]) => void;
  handleEditNode: (id: number, node: CustomNode) => void;
  handleDeleteNode: (id: number) => void;
};

export default function CustomNodes({
  lengthUnit,
  forceUnit,
  customNodes,
  unitType,
  handleAddNodes,
  handleEditNode,
  handleDeleteNode,
}: Props) {
  const [currentNodeIndex, setCurrentNodeIndex] = useState<number>();

  const onClickEdit = (index: number) => {
    setCurrentNodeIndex(index);
  };

  const onCloseEdit = () => {
    setCurrentNodeIndex(undefined);
  };

  const onSubmitEdit = (node: CustomNode) => {
    if (currentNodeIndex) {
      handleEditNode(currentNodeIndex, node);
      onCloseEdit();
    }
  };

  return (
    <>
      {customNodes.length > 0 && (
        <Box overflow="auto" padding={1}>
          <DataTableSimple
            condensed
            centered
            headerList={[
              "Node ID",
              `X-Position (${lengthUnit})`,
              `Y-Position (${lengthUnit})`,
              "Support",
              `Fx (${forceUnit})`,
              `Fy (${forceUnit})`,
              "Edit/Delete",
            ]}
            dataList={customNodes.map((node, index) => [
              index,
              numTruncator(node.x, 6),
              numTruncator(node.y, 6),
              node.support,
              node.Fx,
              node.Fy,
              NodeActions(index, onClickEdit, handleDeleteNode),
            ])}
          />
        </Box>
      )}

      <Accordion sx={{ marginTop: "1em" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Add one Node</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddOneNode unitType={unitType} onCreate={handleAddNodes} />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ marginTop: "1em" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Add multiple Nodes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <AddMultipleNodes
            lengthUnit={lengthUnit}
            forceUnit={forceUnit}
            onCreate={handleAddNodes}
          />
        </AccordionDetails>
      </Accordion>

      <Dialog open={currentNodeIndex !== undefined} onClose={onCloseEdit}>
        <DialogTitle>Edit Node #{currentNodeIndex}</DialogTitle>
        <DialogContent>
          {currentNodeIndex !== undefined && (
            <EditNodeForm
              currentX={customNodes[currentNodeIndex].x}
              currentY={customNodes[currentNodeIndex].y}
              currentSupport={customNodes[currentNodeIndex].support}
              currentFx={customNodes[currentNodeIndex].Fx}
              currentFy={customNodes[currentNodeIndex].Fy}
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
