import { C } from "../../utils/constants";


export default function Header({ activeNav, setActiveNav }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "issues", label: "Issues" },
    { id: "report", label: "Report Issue" },
  ];

  return (
    <div
      style={{
        height: 60,
        background: C.navy,
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      {/* Logo */}
      <div style={{ fontWeight: 800, fontSize: 18 }}>
        CivicAI 🚀
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 16 }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            style={{
              background: activeNav === item.id ? C.white : "transparent",
              color: activeNav === item.id ? C.navy : C.white,
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{ fontSize: 12 }}>
        👤 Admin
      </div>
    </div>
  );
}