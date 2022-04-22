import React from "react";
import { Collapse, Container } from "@mui/material";
import DataTable from "../DataTableControlled";
import { ApiForcesParsed, emptyApiForcesParsed } from "../Interfaces/ApiForces";

interface MemberForceResultProps {
  showResult: boolean;
  memberForceResults: ApiForcesParsed;
}

export default function MemberForceResults({
  showResult = false,
  memberForceResults = emptyApiForcesParsed,
}: MemberForceResultProps) {
  return (
    <Collapse in={showResult}>
      <Container className="top-space">
        <DataTable
          headerList={memberForceResults.memberForcesHeaders}
          dataList={memberForceResults.memberForces}
          title="Member Forces (-Tension/+Compression)"
        />
      </Container>
    </Collapse>
  );
}
