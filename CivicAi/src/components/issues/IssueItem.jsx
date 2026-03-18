import { C, DEPTS } from "../../utils/constants";

export function IssueItem({ issue, onVote, selected, onClick }) {
  const dept = DEPTS[issue.type];
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", gap: 10, padding: "12px 14px", cursor: "pointer",
        borderBottom: `1px solid ${C.border}`, background: selected ? C.tealLight : C.white,
        transition: "background 0.12s", borderLeft: selected ? `3px solid ${C.teal}` : "3px solid transparent",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#F8FAFC"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = C.white; }}
    >
      {/* Thumb placeholder */}
      <div style={{ width: 52, height: 52, borderRadius: 8, background: dept.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${C.border}` }}>
        {dept.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {issue.id}: {issue.desc}
        </div>
        <div style={{ fontSize: 11, color: C.textMid, marginBottom: 5 }}>
          Assigned to {dept.label}
          {issue.status === "Resolved" && <span style={{ color: C.green, marginLeft: 4, fontWeight: 600 }}>· Resolved</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 10, background: C.border }}>
            <div style={{ height: "100%", borderRadius: 10, width: issue.status === "Resolved" ? "100%" : issue.status === "In Progress" ? "60%" : issue.status === "Assigned" ? "30%" : "5%", background: issue.status === "Resolved" ? C.green : issue.status === "Critical" ? C.red : C.teal, transition: "width 0.4s" }} />
          </div>
          <button
            onClick={e => { e.stopPropagation(); onVote(issue.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: C.orange, fontWeight: 700, padding: "0 2px" }}
          >
            ▲ {issue.votes}
          </button>
        </div>
      </div>
    </div>
  );
}