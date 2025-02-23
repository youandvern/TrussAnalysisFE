import { Collapse, Container } from "@mui/material";
import DataTable from "../../shared/components/DataTableControlled";
import { unitToForce, unitToLength } from "../../shared/components/UnitSelector";
import { MemberAnalysisResults } from "../../shared/types/ApiAnalysisResults";
import { memberNodesFormatter } from "../../shared/utils/memberNodesFormatter";

interface MemberForceResultProps {
  showResult: boolean;
  results: MemberAnalysisResults[];
  unitType?: string;
}

export default function MemberForceResults({
  showResult = false,
  results,
  unitType,
}: MemberForceResultProps) {
  const lengthUnit = unitToLength(unitType);
  const forceUnit = unitToForce(unitType);

  const headers = [
    "Member ID",
    "Start -> End Node",
    `Length (${lengthUnit})`,
    `Axial Force (${forceUnit})`,
  ];
  const memberForceResults = results.map((member) => [
    member.index,
    memberNodesFormatter(member.start, member.end),
    Math.abs(member.length) < 0.0001 ? 0 : +member.length.toPrecision(4),
    Math.abs(member.axial) < 0.0001 ? 0 : +member.axial.toPrecision(4),
  ]);
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
