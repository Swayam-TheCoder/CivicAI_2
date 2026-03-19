import { C } from "../../utils/constants";
import Card from "../common/Card";
import Spinner from "../common/Spinner";

export default function StatsCards({ stats, loading }) {
  const cards = [
    { label: "Total Issues",  value: stats?.total     ?? "—", icon: "📋", color: C.navy },
    { label: "New",           value: stats?.byStatus?.New ?? 0, icon: "🆕", color: C.blue },
    { label: "In Progress",   value: (stats?.byStatus?.["In Progress"] || 0) + (stats?.byStatus?.Assigned || 0), icon: "⚙️", color: C.yellow },
    { label: "Resolved",      value: stats?.byStatus?.Resolved ?? 0, icon: "✅", color: C.green },
    { label: "Critical",      value: stats?.byStatus?.Critical  ?? 0, icon: "🚨", color: C.red },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 10,
    }}>
      {cards.map(item => (
        <Card key={item.label} style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: C.textLight, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {item.label}
            </div>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
          </div>
          {loading ? (
            <Spinner size={16} />
          ) : (
            <div style={{ fontSize: 24, fontWeight: 800, color: item.color, fontFamily: "var(--font-mono)" }}>
              {item.value}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
