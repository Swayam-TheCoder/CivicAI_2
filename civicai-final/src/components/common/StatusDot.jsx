import { STATUS_COLORS } from "../../utils/constants";

export default function StatusDot({ status }) {
  const cfg = STATUS_COLORS[status] || { dot: "#94A3B8", bg: "#F1F5F9", text: "#475569" };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 600, color: cfg.text,
      background: cfg.bg, padding: "3px 8px", borderRadius: 20,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
      {status}
    </div>
  );
}
