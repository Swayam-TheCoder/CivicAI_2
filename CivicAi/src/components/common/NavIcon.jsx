import { C } from "../../utils/constants";

export function NavIcon({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
        background: active ? "rgba(255,255,255,0.15)" : "transparent",
        color: active ? C.white : "rgba(255,255,255,0.5)",
        fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", marginBottom: 4,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {icon}
    </button>
  );
}