import { Collapse, Container } from "@mui/material";
import { MemberAnalysisResults } from "../Types/ApiAnalysisResults";
import DataTable from "./DataTableControlled";
import { unitToForce, unitToLength } from "./UnitSelector";
import { memberNodesFormatter } from "./Utilities/memberNodesFormatter";

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
