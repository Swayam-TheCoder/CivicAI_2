import { C } from "../../utils/constants";
import Card from "../common/Card";

export default function StatsCards({ stats }) {
  const data = [
    { label: "Total Issues", value: stats.total, color: C.navy },
    { label: "New", value: stats.new, color: "#2563EB" },
    { label: "In Progress", value: stats.inProgress, color: "#F59E0B" },
    { label: "Resolved", value: stats.resolved, color: "#10B981" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
      }}
    >
      {data.map((item) => (
        <Card key={item.label} style={{ padding: 16 }}>
          <div
            style={{
              fontSize: 11,
              color: C.textLight,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {item.label}
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: item.color,
            }}
          >
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}