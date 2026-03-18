export default function Badge({ label, color, bg }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 10px", letterSpacing: 0.3 }}>
      {label}
    </span>
  );
}