import { useState } from "react";
import { C, DEPTS, STATUS_COLORS } from "../utils/constants";
import { IssueItem } from "../components/issues/IssueItem";
import MapPanel from "../components/map/MapPanel";

export default function DashboardScreen({
  issues,
  selectedId,
  setSelectedId,
  handleVote,
}) {
  const [sidebarTab, setSidebarTab] = useState("recent");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
      }}
    >
      {/* ── SIDEBAR ── */}
      <div
        style={{
          background: C.white,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Legend */}
        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            Legend
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {Object.entries(DEPTS)
              .filter(([k]) => k !== "unknown")
              .map(([key, d]) => (
                <div key={key} style={{ fontSize: 12 }}>
                  {d.icon} {key}
                </div>
              ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700 }}>
            Status
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            {Object.entries(STATUS_COLORS).map(([s, cfg]) => (
              <div key={s} style={{ fontSize: 11 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cfg.dot,
                    display: "inline-block",
                    marginRight: 4,
                  }}
                />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
          {["recent", "mine"].map((id) => (
            <button
              key={id}
              onClick={() => setSidebarTab(id)}
              style={{
                flex: 1,
                padding: 12,
                fontSize: 12,
                fontWeight: 700,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: sidebarTab === id ? C.navy : C.textLight,
                borderBottom:
                  sidebarTab === id ? `2px solid ${C.navy}` : "none",
              }}
            >
              {id === "recent" ? "Recent Issues" : "Track My Reports"}
            </button>
          ))}
        </div>

        {/* Issue List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {issues.slice(0, 6).map((issue) => (
            <IssueItem
              key={issue.id}
              issue={issue}
              onVote={handleVote}
              selected={selectedId === issue.id}
              onClick={() =>
                setSelectedId(selectedId === issue.id ? null : issue.id)
              }
            />
          ))}
        </div>
      </div>

      {/* ── MAP ── */}
      <MapPanel
        issues={issues}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}