import { C, DEPTS, PRIORITY } from "../../utils/constants";
import Card from "../common/Card";
import StatusDot from "../common/StatusDot";
import Badge from "../common/Badge";
import Spinner from "../common/Spinner";
import { timeAgo } from "../../utils/helpers";

const COLS = "80px 1fr 150px 110px 85px 70px 65px";

export default function IssuesTable({ issues, onVote, onSelect, selectedId, loading, votingId }) {
  return (
    <Card>
      {/* Header */}
      <div style={{
        padding: "12px 18px", borderBottom: `1px solid ${C.border}`,
        display: "grid", gridTemplateColumns: COLS, gap: 12,
      }}>
        {["ID", "Description", "Location", "Status", "Priority", "Reports", "Votes"].map(h => (
          <div key={h} style={{
            fontSize: 10, fontWeight: 700, color: C.textLight,
            textTransform: "uppercase", letterSpacing: 0.6,
          }}>{h}</div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      )}

      {/* Empty */}
      {!loading && issues.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", color: C.textLight }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>No issues found</div>
        </div>
      )}

      {/* Rows */}
      {!loading && issues.map(issue => {
        const dept    = DEPTS[issue.type] || DEPTS.unknown;
        const pri     = PRIORITY[issue.priority];
        const issueId = issue.issueId || issue.id || issue._id;
        const desc    = issue.description || issue.desc || "";
        const loc     = issue.location?.address || (typeof issue.location === "string" ? issue.location : "—");
        const ward    = issue.location?.ward || issue.ward || "";
        const reporters = issue.reporterCount || issue.reporters?.length || 1;
        const rawId   = issue._id || issue.id;
        const isSel   = selectedId === rawId || selectedId === issueId;

        return (
          <div
            key={rawId}
            onClick={() => onSelect && onSelect(isSel ? null : rawId)}
            style={{
              padding: "11px 18px",
              borderBottom: `1px solid ${C.border}`,
              display: "grid", gridTemplateColumns: COLS,
              gap: 12, alignItems: "center", cursor: "pointer",
              background: isSel ? "#F0FDF4" : "transparent",
              transition: "background var(--transition)",
              animation: "fadeIn 0.2s ease",
            }}
            onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#F8FAFC"; }}
            onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
          >
            {/* ID */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, fontFamily: "var(--font-mono)" }}>
              {issueId}
            </div>

            {/* Description */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{dept.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 600, color: C.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {desc}
                </div>
                <div style={{ fontSize: 10, color: C.textLight }}>
                  {ward} · {timeAgo(issue.createdAt)}
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ fontSize: 11, color: C.textMid, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              📍 {loc}
            </div>

            {/* Status */}
            <StatusDot status={issue.status} />

            {/* Priority */}
            {pri ? <Badge label={pri.label} color={pri.color} bg={pri.bg} /> : <span>—</span>}

            {/* Reporters */}
            <div style={{ fontSize: 11, color: C.textMid, fontWeight: 600 }}>
              👥 {reporters}
              {issue.isMerged && <span title="Merged" style={{ marginLeft: 4 }}>🔗</span>}
            </div>

            {/* Vote */}
            <button
              onClick={e => { e.stopPropagation(); onVote && onVote(rawId); }}
              disabled={votingId === rawId}
              style={{
                background: C.blueLight, border: "none", borderRadius: 8,
                padding: "4px 10px", cursor: votingId === rawId ? "not-allowed" : "pointer",
                fontSize: 12, color: C.navy, fontWeight: 700,
                opacity: votingId === rawId ? 0.5 : 1,
                transition: "var(--transition)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#DBEAFE"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.blueLight; }}
            >
              {votingId === rawId ? "…" : `▲ ${issue.votes || 1}`}
            </button>
          </div>
        );
      })}
    </Card>
  );
}
