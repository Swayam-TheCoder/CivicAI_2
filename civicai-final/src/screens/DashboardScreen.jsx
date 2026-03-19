import { useState, useEffect, useCallback } from "react";
import { C, DEPTS, STATUS_COLORS } from "../utils/constants";
import { IssueItem } from "../components/issues/IssueItem";
import MapPanel from "../components/map/MapPanel";
import Spinner from "../components/common/Spinner";
import { issuesApi } from "../services/api";
import { useIssues } from "../hooks/useIssues";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardScreen({ selectedId, setSelectedId }) {
  const { user }  = useAuth();
  const [tab, setTab] = useState("recent");

  // Recent issues
  const { issues: recentIssues, loading: recentLoading, vote: voteRecent } = useIssues(true);

  // My issues (lazy)
  const [myIssues, setMyIssues]     = useState([]);
  const [myLoading, setMyLoading]   = useState(false);
  const [myLoaded, setMyLoaded]     = useState(false);

  const loadMine = useCallback(async () => {
    if (myLoaded || !user) return;
    setMyLoading(true);
    try {
      const res = await issuesApi.myReports();
      setMyIssues(res.data);
      setMyLoaded(true);
    } catch (_) {}
    setMyLoading(false);
  }, [myLoaded, user]);

  useEffect(() => { if (tab === "mine") loadMine(); }, [tab, loadMine]);

  const displayIssues = tab === "mine" ? myIssues : recentIssues;
  const displayLoading = tab === "mine" ? myLoading : recentLoading;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "clamp(260px, 28%, 340px) 1fr",
      height: "100%",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      border: `1px solid ${C.border}`,
      animation: "fadeIn 0.2s ease",
    }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        background: C.white,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Legend */}
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
            Legend
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 8px", marginBottom: 12 }}>
            {Object.entries(DEPTS).filter(([k]) => k !== "unknown").map(([key, d]) => (
              <div key={key} style={{ fontSize: 11, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
                <span>{d.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            Status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
            {Object.entries(STATUS_COLORS).map(([s, cfg]) => (
              <div key={s} style={{ fontSize: 10, color: C.textMid, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[
            { id: "recent", label: "Recent Issues" },
            { id: "mine",   label: "My Reports" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 8px", fontSize: 11, fontWeight: 700,
              background: "transparent", border: "none", cursor: "pointer",
              color: tab === t.id ? C.navy : C.textLight,
              borderBottom: tab === t.id ? `2px solid ${C.navy}` : "2px solid transparent",
              transition: "var(--transition)",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Issue list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {displayLoading ? (
            <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
              <Spinner />
            </div>
          ) : !user && tab === "mine" ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 12 }}>
              Sign in to track your reports
            </div>
          ) : displayIssues.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.textLight, fontSize: 12 }}>
              {tab === "mine" ? "You haven't reported any issues yet" : "No issues found"}
            </div>
          ) : (
            displayIssues.slice(0, 10).map(issue => (
              <IssueItem
                key={issue._id || issue.id}
                issue={issue}
                onVote={voteRecent}
                selected={selectedId === (issue._id || issue.id)}
                onClick={() => {
                  const id = issue._id || issue.id;
                  setSelectedId(selectedId === id ? null : id);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── MAP ── */}
      <MapPanel
        issues={recentIssues}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}
