import { C } from "../../utils/constants";

export default function Sidebar({ activeNav, setActiveNav }) {
  const menu = [
    { id: "dashboard", label: "Dashboard",    icon: "📊" },
    { id: "issues",    label: "Issues",       icon: "📋" },
    { id: "report",    label: "Report Issue", icon: "📸" },
  ];

  return (
    <aside className="hide-mobile" style={{
      width: 200, background: C.white,
      borderRight: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column",
      paddingTop: 8, flexShrink: 0,
    }}>
      {menu.map(item => (
        <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
          padding: "11px 16px",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10,
          background: activeNav === item.id ? "#F0F4F9" : "transparent",
          fontWeight: activeNav === item.id ? 700 : 500,
          fontSize: 13,
          color: activeNav === item.id ? C.navy : C.textMid,
          border: "none",
          borderLeft: activeNav === item.id ? `3px solid ${C.navy}` : "3px solid transparent",
          textAlign: "left",
          width: "100%",
          transition: "var(--transition)",
        }}
        onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = "#F8FAFC"; }}
        onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Version tag */}
      <div style={{
        marginTop: "auto", padding: "12px 16px",
        fontSize: 10, color: C.textLight, fontWeight: 600,
        letterSpacing: 0.5, borderTop: `1px solid ${C.border}`,
      }}>
        CIVICAI v1.0 · PMC
      </div>
    </aside>
  );
}
