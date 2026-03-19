import { C, DEPTS } from "../../utils/constants";
import { timeAgo } from "../../utils/helpers";

export function IssueItem({ issue, onVote, selected, onClick, loading }) {
  const dept = DEPTS[issue.type] || DEPTS.unknown;
  const issueId = issue.issueId || issue.id || issue._id;
  const desc    = issue.description || issue.desc || "";
  const loc     = issue.location?.address || (typeof issue.location === "string" ? issue.location : "Unknown");
  const reporters = issue.reporterCount || issue.reporters?.length || 1;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", gap: 10, padding: "11px 14px", cursor: "pointer",
        borderBottom: `1px solid ${C.border}`,
        background: selected ? C.tealLight : C.white,
        transition: "background var(--transition)",
        borderLeft: selected ? `3px solid ${C.teal}` : "3px solid transparent",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#F8FAFC"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = selected ? C.tealLight : C.white; }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 8, background: dept.bg,
        flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 20, border: `1px solid ${C.border}`,
      }}>
        {dept.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: C.navy,
          fontFamily: "var(--font-mono)", marginBottom: 1,
        }}>
          {issueId}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, color: C.text,
          marginBottom: 3, whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {desc}
        </div>
        <div style={{ fontSize: 10, color: C.textMid, marginBottom: 6 }}>
          📍 {loc} · {timeAgo(issue.createdAt || issue.timestamp)}
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 10, background: C.border }}>
            <div style={{
              height: "100%", borderRadius: 10,
              width: {
                Resolved: "100%", "In Progress": "60%",
                Assigned: "30%", Critical: "15%", New: "5%",
              }[issue.status] || "5%",
              background: issue.status === "Resolved" ? C.green
                : issue.status === "Critical" ? C.red : C.teal,
              transition: "width 0.4s",
            }} />
          </div>
          <div style={{ fontSize: 10, color: C.textLight }}>
            👥 {reporters}
          </div>
          <button
            onClick={e => { e.stopPropagation(); if (!loading) onVote(issue._id || issue.id); }}
            disabled={loading}
            style={{
              background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 10, color: C.orange, fontWeight: 700, padding: "0 2px",
              opacity: loading ? 0.5 : 1,
            }}
          >
            ▲ {issue.votes || 1}
          </button>
        </div>
      </div>
    </div>
  );
}
