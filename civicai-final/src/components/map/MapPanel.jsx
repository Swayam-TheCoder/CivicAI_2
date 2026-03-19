import { C, DEPTS, PRIORITY } from "../../utils/constants";
import StatusDot from "../common/StatusDot";

const TYPE_COLORS = {
  pothole: C.navy, garbage: C.teal, streetlight: C.yellow,
  flooding: C.blue, graffiti: C.purple, unknown: C.textMid,
};

// Spread pins across the map deterministically from issueId
function pinPosition(issue) {
  const seed = issue.issueId || issue._id || "";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  const x = 10 + (Math.abs(h) % 80);
  const y = 10 + (Math.abs(h >> 8) % 75);
  return { x, y };
}

export default function MapPanel({ issues = [], selectedId, onSelect }) {
  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "#E8EEF4", overflow: "hidden", borderRadius: "var(--radius-lg)",
    }}>
      {/* SVG map grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
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
        <ellipse cx="85%" cy="75%" rx="12%" ry="18%" fill="#BFDBFE" opacity="0.6" />
        <rect x="10%" y="15%" width="12%" height="8%" rx="4" fill="#BBF7D0" opacity="0.7" />
        <rect x="65%" y="65%" width="10%" height="10%" rx="4" fill="#BBF7D0" opacity="0.7" />
      </svg>

      {/* Zoom controls (decorative) */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", flexDirection: "column", gap: 2, zIndex: 10 }}>
        {["+", "−"].map(s => (
          <button key={s} style={{
            width: 30, height: 30, borderRadius: 6,
            border: `1px solid ${C.border}`, background: C.white,
            cursor: "default", fontSize: 16, fontWeight: 700, color: C.textMid,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}>{s}</button>
        ))}
      </div>

      {/* City label */}
      <div style={{
        position: "absolute", bottom: 12, left: 14,
        fontSize: 10, color: C.textLight, fontWeight: 700, letterSpacing: 0.8,
        background: "rgba(255,255,255,0.8)", padding: "3px 8px", borderRadius: 4,
      }}>
        PUNE METROPOLITAN AREA
      </div>

      {/* Issue count badge */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: C.navy, color: C.white,
        fontSize: 11, fontWeight: 700,
        padding: "4px 10px", borderRadius: 20,
        boxShadow: "var(--shadow-sm)",
      }}>
        {issues.length} issue{issues.length !== 1 ? "s" : ""}
      </div>

      {/* Issue pins */}
      {issues.map(issue => {
        const pos       = pinPosition(issue);
        const isSelected = (selectedId === issue._id || selectedId === issue.issueId || selectedId === issue.id);
        const color     = TYPE_COLORS[issue.type] || C.textMid;
        const dept      = DEPTS[issue.type] || DEPTS.unknown;
        const pri       = PRIORITY[issue.priority];
        const reporters = issue.reporterCount || issue.reporters?.length || 1;
        const isCritical = issue.priority === "critical" || issue.priority === "high";

        return (
          <div
            key={issue._id || issue.id}
            onClick={() => onSelect && onSelect(isSelected ? null : (issue._id || issue.id))}
            style={{
              position: "absolute",
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: "translate(-50%, -100%)",
              cursor: "pointer", zIndex: isSelected ? 20 : 10,
              filter: isSelected
                ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
                : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
              transition: "filter 0.2s",
            }}
          >
            <div style={{ position: "relative" }}>
              {/* Pin body */}
              <div style={{
                width: isSelected ? 46 : 36, height: isSelected ? 46 : 36,
                borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
                background: isSelected ? C.navyDark : color,
                border: `2px solid ${C.white}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                animation: isSelected ? "pinBounce 0.5s ease" : "none",
              }}>
                <span style={{ transform: "rotate(45deg)", fontSize: isSelected ? 18 : 14 }}>
                  {dept.icon}
                </span>
              </div>

              {/* Reporter count badge */}
              {reporters > 1 && (
                <div style={{
                  position: "absolute", top: -6, right: -6,
                  background: isCritical ? C.red : C.orange,
                  color: C.white, borderRadius: "50%",
                  width: 17, height: 17, fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1.5px solid ${C.white}`,
                }}>
                  {reporters > 9 ? "9+" : reporters}
                </div>
              )}

              {/* Flame for high/critical */}
              {isCritical && (
                <div style={{ position: "absolute", top: -14, right: -4, fontSize: 13 }}>🔥</div>
              )}
            </div>

            {/* Tooltip on selection */}
            {isSelected && (
              <div style={{
                position: "absolute", bottom: "115%", left: "50%",
                transform: "translateX(-50%)",
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: "var(--radius-md)", padding: "10px 14px",
                whiteSpace: "nowrap", zIndex: 30,
                boxShadow: "var(--shadow-lg)", minWidth: 210,
                animation: "fadeIn 0.15s ease",
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, marginBottom: 2 }}>
                  {issue.issueId || issue.id} · {dept.label}
                </div>
                <div style={{ fontSize: 11, color: C.textMid, marginBottom: 6, maxWidth: 220, whiteSpace: "normal" }}>
                  {(issue.description || issue.desc || "").slice(0, 80)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <StatusDot status={issue.status} />
                  {pri && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: pri.color,
                      background: pri.bg, padding: "2px 7px", borderRadius: 10,
                    }}>
                      {pri.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>
                  👥 {reporters} reporter{reporters !== 1 ? "s" : ""} · ▲ {issue.votes || 1} votes
                </div>
                {issue.isMerged && (
                  <div style={{ fontSize: 10, color: C.orange, fontWeight: 600, marginTop: 3 }}>
                    🔗 Duplicates merged
                  </div>
                )}
                {/* Arrow */}
                <div style={{
                  position: "absolute", bottom: -6, left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 10, height: 10, background: C.white,
                  borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                }} />
              </div>
            )}
          </div>
        );
      })}

      {issues.length === 0 && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontSize: 32, opacity: 0.3 }}>🗺️</div>
          <div style={{ fontSize: 13, color: C.textLight, fontWeight: 600 }}>No issues to show</div>
        </div>
      )}
    </div>
  );
}
