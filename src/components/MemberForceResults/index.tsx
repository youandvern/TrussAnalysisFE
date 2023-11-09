import React from "react";
import { Collapse, Container } from "@mui/material";
import DataTable from "../DataTableControlled";
import { emptyApiForcesParsed } from "../../Types/ApiForces";

interface MemberForceResultProps {
  showResult: boolean;
  headers: string[];
  memberForceResults: (number | JSX.Element)[][];
}

export default function MemberForceResults({
  showResult = false,
  headers = emptyApiForcesParsed.memberForcesHeaders,
  memberForceResults = emptyApiForcesParsed.memberForces,
}: MemberForceResultProps) {
  return (
    <Collapse in={showResult}>
      <Container className="top-space">
        <DataTable
          headerList={headers}
          dataList={memberForceResults}
          title="Member Forces (-Tension/+Compression)"
        />
      </Container>
    </Collapse>
  );
}
