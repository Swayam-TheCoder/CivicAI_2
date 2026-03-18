import { C } from "../../utils/constants";

export default function Sidebar({ activeNav, setActiveNav }) {
  const menu = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "issues", label: "Issues", icon: "📋" },
    { id: "report", label: "Report", icon: "📸" },
  ];

  return (
    <div
      style={{
        width: 200,
        background: C.white,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        paddingTop: 10,
      }}
    >
      {menu.map((item) => (
        <div
          key={item.id}
          onClick={() => setActiveNav(item.id)}
          style={{
            padding: "12px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background:
              activeNav === item.id ? "#F1F5F9" : "transparent",
            fontWeight: activeNav === item.id ? 700 : 500,
            color: C.text,
          }}
        >
          <span>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}