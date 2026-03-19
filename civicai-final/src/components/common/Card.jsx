export default function Card({ children, style = {}, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
