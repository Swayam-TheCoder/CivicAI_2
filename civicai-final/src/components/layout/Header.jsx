import { useState } from "react";
import { C } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";

export default function Header({ activeNav, setActiveNav }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "issues",    label: "Issues",    icon: "📋" },
    { id: "report",    label: "Report",    icon: "📸" },
  ];

  return (
    <header style={{
      height: 60, background: C.navy, color: C.white,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.3, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 22 }}>🏛️</span>
        <span>Civic<span style={{ color: C.teal }}>AI</span></span>
      </div>

      {/* Desktop nav */}
      <nav className="hide-mobile" style={{ display: "flex", gap: 4 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
            background: activeNav === item.id ? "rgba(255,255,255,0.15)" : "transparent",
            color: C.white,
            border: "none",
            borderRadius: "var(--radius-sm)",
            padding: "7px 14px",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            transition: "var(--transition)",
            display: "flex", alignItems: "center", gap: 6,
            borderBottom: activeNav === item.id ? `2px solid ${C.teal}` : "2px solid transparent",
          }}
          onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>

      {/* User area */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(v => !v)} style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "var(--radius-sm)",
          color: C.white, padding: "5px 12px",
          cursor: "pointer", fontSize: 12, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          transition: "var(--transition)",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: C.teal, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.navyDark,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "G"}
          </div>
          <span className="hide-mobile">{user?.name?.split(" ")[0] || "Guest"}</span>
          <span style={{ fontSize: 10 }}>▾</span>
        </button>

        {menuOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: C.white, border: `1px solid ${C.border}`,
            borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)",
            minWidth: 180, zIndex: 200, overflow: "hidden",
            animation: "fadeIn 0.15s ease",
          }} onMouseLeave={() => setMenuOpen(false)}>
            {user ? (
              <>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{user.name}</div>
                  <div style={{ fontSize: 11, color: C.textLight }}>{user.email}</div>
                  <div style={{
                    marginTop: 4, fontSize: 10, fontWeight: 700,
                    color: user.role === "admin" ? C.red : user.role === "officer" ? C.orange : C.teal,
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    {user.role}
                  </div>
                </div>
                <button onClick={() => { setActiveNav("report"); setMenuOpen(false); }} style={{
                  width: "100%", padding: "10px 16px", border: "none",
                  background: "transparent", cursor: "pointer", textAlign: "left",
                  fontSize: 13, color: C.text, display: "flex", alignItems: "center", gap: 8,
                }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  📸 Report Issue
                </button>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                  width: "100%", padding: "10px 16px", border: "none",
                  background: "transparent", cursor: "pointer", textAlign: "left",
                  fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8,
                  borderTop: `1px solid ${C.border}`,
                }} onMouseEnter={e => e.currentTarget.style.background = C.redLight}
                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { setActiveNav("login"); setMenuOpen(false); }} style={{
                width: "100%", padding: "10px 16px", border: "none",
                background: "transparent", cursor: "pointer", textAlign: "left", fontSize: 13, color: C.navy,
              }}>
                🔐 Sign In
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <div className="hide-desktop" style={{ display: "flex", gap: 4 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
            background: activeNav === item.id ? "rgba(255,255,255,0.15)" : "transparent",
            border: "none", borderRadius: 6, padding: "6px 8px",
            fontSize: 16, cursor: "pointer",
          }}>{item.icon}</button>
        ))}
      </div>
    </header>
  );
}
