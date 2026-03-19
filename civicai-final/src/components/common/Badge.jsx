export default function Badge({ label, color, bg, style = {} }) {
  return (
    <span style={{
      background: bg,
      color,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 20,
      padding: "3px 9px",
      letterSpacing: 0.4,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {label}
    </span>
  );
}
