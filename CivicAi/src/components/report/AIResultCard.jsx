import { DEPTS, PRIORITY } from "../../utils/constants";
import Card from "../common/Card";

export default function AIResultCard({ result }) {
  if (!result) return null;

  const dept = DEPTS[result.type];
  const pri = PRIORITY[result.severity];

  return (
    <Card style={{ padding: 14, marginTop: 10 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        🤖 AI Analysis
      </div>

      <div style={{ fontSize: 13, marginBottom: 6 }}>
        <b>Type:</b> {dept?.icon} {result.type}
      </div>

      <div style={{ fontSize: 13, marginBottom: 6 }}>
        <b>Description:</b> {result.description}
      </div>

      <div style={{ fontSize: 13, marginBottom: 6 }}>
        <b>Priority:</b>{" "}
        <span
          style={{
            color: pri?.color,
            fontWeight: 700,
          }}
        >
          {pri?.label}
        </span>
      </div>

      <div style={{ fontSize: 13 }}>
        <b>Department:</b> {dept?.label}
      </div>
    </Card>
  );
}