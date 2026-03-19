import { DEPTS, PRIORITY, C } from "../../utils/constants";
import Card from "../common/Card";

export default function AIResultCard({ result }) {
  if (!result) return null;

  const dept = DEPTS[result.type] || DEPTS.unknown;
  const pri  = PRIORITY[result.severity] || PRIORITY.medium;

  return (
    <Card style={{ padding: 14, marginTop: 10, borderLeft: `4px solid ${dept.color}`, animation: "fadeIn 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>AI Analysis Complete</div>
        <div style={{
          marginLeft: "auto", fontSize: 10, fontWeight: 700,
          color: C.teal, background: C.tealLight,
          padding: "2px 8px", borderRadius: 10,
        }}>
          {result.confidence || 0}% confident
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
        <div style={{ background: dept.bg, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, marginBottom: 2 }}>TYPE</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: dept.color }}>
            {dept.icon} {result.type}
          </div>
        </div>
        <div style={{ background: pri.bg, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontSize: 10, color: C.textLight, fontWeight: 600, marginBottom: 2 }}>SEVERITY</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: pri.color }}>{pri.label}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6, lineHeight: 1.5 }}>
        <b style={{ color: C.text }}>Description:</b> {result.description}
      </div>

      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>
        <b style={{ color: C.text }}>Department:</b> {dept.label}
      </div>

      <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
        <b style={{ color: C.text }}>Recommended Action:</b> {result.action}
      </div>

      {result.hazard && (
        <div style={{
          marginTop: 10, background: C.redLight, border: `1px solid ${C.red}`,
          borderRadius: 6, padding: "6px 10px", fontSize: 11,
          color: C.red, fontWeight: 700,
        }}>
          ⚠️ Immediate safety hazard detected
        </div>
      )}
    </Card>
  );
}
