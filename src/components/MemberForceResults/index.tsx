import React from "react";
import { Collapse, Container, Grid, Typography, Button } from "@mui/material";
import DataTable from "../DataTableControlled";
import ApiForces, { emptyApiForces } from "../Interfaces/ApiForces";

interface MemberForceResultProps {
  showResult: boolean;
  memberForceResults: ApiForces;
}

export default function MemberForceResults({
  showResult = false,
  memberForceResults = emptyApiForces,
}: MemberForceResultProps) {
  return (
    <Collapse in={showResult}>
      <Container className="top-space">
        <DataTable
          headerList={memberForceResults.memberForcesHeaders}
          dataList={memberForceResults.memberForces}
          title="Member Forces (-Tension/+Compression) [kips]"
        />
      </Container>
    </Collapse>
  );
}
