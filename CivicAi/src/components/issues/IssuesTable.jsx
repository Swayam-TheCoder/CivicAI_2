import { C, DEPTS, PRIORITY } from "../../utils/constants";
import Card from "../common/Card";
import StatusDot from "../common/StatusDot";
import Badge from "../common/Badge";

export default function IssuesTable({ issues, onVote, onSelect, selectedId }) {
  return (
    <Card>
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "grid",
          gridTemplateColumns: "80px 1fr 140px 100px 80px 80px 60px",
          gap: 12,
        }}
      >
        {["ID", "Description", "Location", "Status", "Priority", "Reporters", "Votes"].map(h => (
          <div
            key={h}
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.textLight,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {issues.map(issue => {
        const dept = DEPTS[issue.type];
        const pri = PRIORITY[issue.priority];

        return (
          <div
            key={issue.id}
            onClick={() => onSelect(issue.id)}
            style={{
              padding: "12px 18px",
              borderBottom: `1px solid ${C.border}`,
              display: "grid",
              gridTemplateColumns: "80px 1fr 140px 100px 80px 80px 60px",
              gap: 12,
              alignItems: "center",
              cursor: "pointer",
              background: selectedId === issue.id ? "#F0FDF4" : "transparent",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => {
              if (selectedId !== issue.id)
                e.currentTarget.style.background = "#F8FAFC";
            }}
            onMouseLeave={e => {
              if (selectedId !== issue.id)
                e.currentTarget.style.background = "transparent";
            }}
          >
            {/* ID */}
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>
              {issue.id}
            </div>

            {/* Description */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{dept.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 220,
                  }}
                >
                  {issue.desc}
                </div>
                <div style={{ fontSize: 10, color: C.textLight }}>
                  {issue.ward}
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ fontSize: 11, color: C.textMid }}>
              {issue.location}
            </div>

            {/* Status */}
            <StatusDot status={issue.status} />

            {/* Priority */}
            <Badge
              label={pri.label}
              color={pri.color}
              bg={pri.bg}
            />

            {/* Reporters */}
            <div style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>
              👥 {issue.reporters}
              {issue.merged && (
                <span title="Duplicates merged" style={{ marginLeft: 4 }}>
                  🔗
                </span>
              )}
            </div>

            {/* Votes */}
            <button
              onClick={e => {
                e.stopPropagation();
                onVote(issue.id);
              }}
              style={{
                background: C.blueLight,
                border: "none",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                fontSize: 12,
                color: C.navy,
                fontWeight: 700,
              }}
            >
              ▲ {issue.votes}
            </button>
          </div>
        );
      })}
    </Card>
  );
}
