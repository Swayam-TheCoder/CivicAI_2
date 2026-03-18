import { C, DEPTS, PRIORITY } from "../../utils/constants";
import StatusDot from "../common/StatusDot";

export default function MapPanel({ issues, selectedId, onSelect }) {
  const typeIcons = { pothole: "🚧", garbage: "🗑️", streetlight: "💡", flooding: "💧", graffiti: "🎨", unknown: "⚠️" };
  const typeColors = { pothole: C.navy, garbage: C.teal, streetlight: C.yellow, flooding: C.blue, graffiti: C.purple, unknown: C.textMid };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#E8EEF4", overflow: "hidden", borderRadius: 14 }}>
      {/* Simulated map grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94A3B8" strokeWidth="0.5" />
          </pattern>
          <pattern id="road-h" width="120" height="60" patternUnits="userSpaceOnUse">
            <rect width="120" height="8" y="26" fill="#CBD5E1" />
          </pattern>
          <pattern id="road-v" width="60" height="120" patternUnits="userSpaceOnUse">
            <rect width="8" height="120" x="26" fill="#CBD5E1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#road-h)" opacity="0.6" />
        <rect width="100%" height="100%" fill="url(#road-v)" opacity="0.6" />
        {/* Water body */}
        <ellipse cx="85%" cy="75%" rx="12%" ry="18%" fill="#BFDBFE" opacity="0.6" />
        {/* Parks */}
        <rect x="10%" y="15%" width="12%" height="8%" rx="4" fill="#BBF7D0" opacity="0.7" />
        <rect x="65%" y="65%" width="10%" height="10%" rx="4" fill="#BBF7D0" opacity="0.7" />
      </svg>

      {/* Zoom controls */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", gap: 2, zIndex: 10 }}>
        {["+", "−"].map(s => (
          <button key={s} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 16, fontWeight: 700, color: C.textMid, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            {s}
          </button>
        ))}
      </div>

      {/* City label */}
      <div style={{ position: "absolute", bottom: 12, left: 14, fontSize: 10, color: C.textLight, fontWeight: 600, letterSpacing: 0.5 }}>
        PUNE METROPOLITAN AREA
      </div>

      {/* Issue pins */}
      {issues.map(issue => {
        const isSelected = selectedId === issue.id;
        const color = typeColors[issue.type];
        const icon = typeIcons[issue.type];
        return (
          <div
            key={issue.id}
            onClick={() => onSelect(isSelected ? null : issue.id)}
            style={{
              position: "absolute",
              left: `${issue.coords.x}%`,
              top: `${issue.coords.y}%`,
              transform: "translate(-50%, -100%)",
              cursor: "pointer",
              zIndex: isSelected ? 20 : 10,
              filter: isSelected ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            }}
          >
            {/* Pin shape */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: isSelected ? 46 : 38, height: isSelected ? 46 : 38,
                borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
                background: isSelected ? C.navyDark : color,
                border: `2px solid ${C.white}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}>
                <span style={{ transform: "rotate(45deg)", fontSize: isSelected ? 18 : 15 }}>{icon}</span>
              </div>
              {/* Reporter count badge */}
              {issue.reporters > 1 && (
                <div style={{
                  position: "absolute", top: -6, right: -6,
                  background: issue.priority === "critical" ? C.red : C.orange,
                  color: C.white, borderRadius: "50%", width: 18, height: 18,
                  fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${C.white}`,
                }}>
                  {issue.reporters}
                </div>
              )}
              {/* Flame for high priority */}
              {(issue.priority === "high" || issue.priority === "critical") && (
                <div style={{ position: "absolute", top: -14, right: -4, fontSize: 14 }}>🔥</div>
              )}
            </div>

            {/* Tooltip */}
            {isSelected && (
              <div style={{
                position: "absolute", bottom: "115%", left: "50%", transform: "translateX(-50%)",
                background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "10px 14px", whiteSpace: "nowrap", zIndex: 30,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 200,
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, marginBottom: 3 }}>
                  Issue {issue.id}: {DEPTS[issue.type].label.replace(".", "")}
                </div>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 6 }}>
                  {issue.reporters} Reports
                  {issue.priority === "high" || issue.priority === "critical" ? (
                    <span style={{ color: C.red, fontWeight: 700, marginLeft: 4 }}>— {PRIORITY[issue.priority].label} PRIORITY</span>
                  ) : null}
                </div>
                {issue.merged && (
                  <div style={{ fontSize: 11, color: C.orange, fontWeight: 600 }}>
                    🔗 Duplicates detected! 3 reports merged
                  </div>
                )}
                <div style={{ marginTop: 4 }}><StatusDot status={issue.status} /></div>
                {/* Arrow */}
                <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: C.white, borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}