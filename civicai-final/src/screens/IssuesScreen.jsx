import { useState, useEffect, useCallback } from "react";
import IssuesTable from "../components/issues/IssuesTable";
import Card from "../components/common/Card";
import StatsCards from "../components/issues/StatsCards";
import { C, STATUS_LIST, ISSUE_TYPES } from "../utils/constants";
import { useIssues, useStats } from "../hooks/useIssues";
import Spinner from "../components/common/Spinner";
import { showToast } from "../components/common/Toast";

export default function IssuesScreen({ selectedId, setSelectedId, setActiveNav }) {
  const [filters, setFilters]   = useState({ status: "", type: "", page: 1 });
  const [votingId, setVotingId] = useState(null);
  const { stats, loading: statsLoading } = useStats();
  const { issues, loading, pagination, load, vote } = useIssues(false);

  // Load on filter change
  useEffect(() => {
    load({ status: filters.status, type: filters.type, page: filters.page, limit: 15 });
  }, [filters, load]);

  const setFilter = useCallback((key, val) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }));
  }, []);

  const handleVote = useCallback(async (id) => {
    if (votingId) return;
    setVotingId(id);
    try {
      const res = await vote(id);
      if (res) showToast(res.voted ? "Vote added! ▲" : "Vote removed.", "success");
    } catch (_) { showToast("Could not vote right now", "error"); }
    setVotingId(null);
  }, [votingId, vote]);

  const filterBtn = (val, label, key) => (
    <button key={val} onClick={() => setFilter(key, filters[key] === val ? "" : val)} style={{
      background: filters[key] === val ? C.navy : C.white,
      border: `1px solid ${filters[key] === val ? C.navy : C.border}`,
      color: filters[key] === val ? C.white : C.textMid,
      borderRadius: 20, padding: "4px 13px",
      fontSize: 11, fontWeight: 600, cursor: "pointer",
      transition: "var(--transition)", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeIn 0.2s ease" }}>
      {/* Stats */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Filter bar */}
      <Card style={{ padding: "10px 14px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Status filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Status:</span>
            {filterBtn("", "All", "status")}
            {STATUS_LIST.map(s => filterBtn(s, s, "status"))}
          </div>

          <div style={{ width: 1, height: 20, background: C.border, flexShrink: 0 }} />

          {/* Type filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Type:</span>
            {filterBtn("", "All", "type")}
            {ISSUE_TYPES.filter(t => t !== "unknown").map(t => filterBtn(t, t, "type"))}
          </div>

          {/* Report Issue button */}
          <button onClick={() => setActiveNav("report")} style={{
            marginLeft: "auto", padding: "6px 14px",
            background: C.teal, color: C.white, border: "none",
            borderRadius: 20, fontSize: 12, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            flexShrink: 0,
          }}>
            📸 Report Issue
          </button>
        </div>
      </Card>

      {/* Table */}
      <IssuesTable
        issues={issues}
        loading={loading}
        votingId={votingId}
        onVote={handleVote}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id === selectedId ? null : id);
          setActiveNav("dashboard");
        }}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 8 }}>
          <button
            disabled={!pagination.hasPrev}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-sm)",
              border: `1px solid ${C.border}`, background: C.white,
              cursor: pagination.hasPrev ? "pointer" : "not-allowed",
              fontSize: 12, color: pagination.hasPrev ? C.navy : C.textLight,
              fontWeight: 600,
            }}
          >
            ← Prev
          </button>
          <div style={{
            padding: "6px 14px", fontSize: 12, color: C.textMid,
            fontWeight: 600, display: "flex", alignItems: "center",
          }}>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            style={{
              padding: "6px 14px", borderRadius: "var(--radius-sm)",
              border: `1px solid ${C.border}`, background: C.white,
              cursor: pagination.hasNext ? "pointer" : "not-allowed",
              fontSize: 12, color: pagination.hasNext ? C.navy : C.textLight,
              fontWeight: 600,
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
