import { STATUS_COLORS } from "../../utils/constants";

export default function StatusDot({ status }) {
  const cfg = STATUS_COLORS[status] || {
    dot: "#94A3B8",
    bg: "#F1F5F9",
    text: "#475569",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: cfg.text,
        background: cfg.bg,
        padding: "4px 8px",
        borderRadius: 20,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: cfg.dot,
        }}
      />
      {status}
    </div>
  );
}