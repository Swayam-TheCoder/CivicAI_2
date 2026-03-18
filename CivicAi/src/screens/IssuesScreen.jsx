import { useState } from "react";
import IssuesTable from "../components/issues/IssuesTable";
import Card from "../components/common/Card";
import StatsCards from "../components/issues/StatsCards";
import { C } from "../utils/constants";

export default function IssuesScreen({
  issues,
  handleVote,
  selectedId,
  setSelectedId,
  setActiveNav,
}) {
  const [filterStatus, setFilterStatus] = useState("All");

  // ── FILTER LOGIC ──
  const filteredIssues =
    filterStatus === "All"
      ? issues
      : issues.filter((i) => i.status === filterStatus);

  
  // ── STATS ──
  const stats = {
    total: issues.length,
    new: issues.filter((i) => i.status === "New").length,
    inProgress: issues.filter(
      (i) => i.status === "In Progress" || i.status === "Assigned"
    ).length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* ── STATS CARDS ── */}
      <StatsCards stats={stats} />

      {/* ── FILTER BAR ── */}
      <Card style={{ padding: "10px 14px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: C.textMid,
              fontWeight: 600,
            }}
          >
            Filter:
          </span>

          {["All", "New", "Assigned", "In Progress", "Critical", "Resolved"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                style={{
                  background: filterStatus === f ? C.navy : C.white,
                  border: `1px solid ${
                    filterStatus === f ? C.navy : C.border
                  }`,
                  color: filterStatus === f ? C.white : C.textMid,
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {f}
              </button>
            )
          )}
        </div>
      </Card>

      {/* ── TABLE ── */}
      <IssuesTable
        issues={filteredIssues}
        onVote={handleVote}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id === selectedId ? null : id);
          setActiveNav("map");
        }}
      />
    </div>
  );
}