import { useState } from "react";
import { C } from "../../utils/constants";

export default function LocationPicker({ value, onChange }) {
  const [mode, setMode]   = useState("manual");
  const [detecting, setDetecting] = useState(false);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setDetecting(false);
      },
      () => setDetecting(false),
      { timeout: 8000 }
    );
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        📍 Location
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["manual", "auto"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "4px 12px", borderRadius: 20,
            border: `1px solid ${mode === m ? C.navy : C.border}`,
            background: mode === m ? C.navy : C.white,
            color: mode === m ? C.white : C.textMid,
            cursor: "pointer", fontSize: 11, fontWeight: 600,
            transition: "var(--transition)",
          }}>
            {m === "manual" ? "✏️ Type" : "📡 GPS"}
          </button>
        ))}
      </div>

      {mode === "manual" ? (
        <>
          <input
            value={value.address || value}
            onChange={e => onChange({ address: e.target.value })}
            placeholder="e.g. MG Road, Deccan, Pune"
            style={{
              width: "100%", padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${C.border}`, fontSize: 12,
              outline: "none", boxSizing: "border-box",
              transition: "border-color var(--transition)",
            }}
            onFocus={e => e.target.style.borderColor = C.navy}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <input
            value={value.ward || ""}
            onChange={e => onChange({ ...(typeof value === "object" ? value : { address: value }), ward: e.target.value })}
            placeholder="Ward (e.g. Ward 12)"
            style={{
              width: "100%", padding: "8px 12px", marginTop: 6,
              borderRadius: "var(--radius-sm)",
              border: `1px solid ${C.border}`, fontSize: 12,
              outline: "none", boxSizing: "border-box",
              transition: "border-color var(--transition)",
            }}
            onFocus={e => e.target.style.borderColor = C.navy}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </>
      ) : (
        <div>
          <button onClick={handleAutoDetect} disabled={detecting} style={{
            padding: "8px 14px", borderRadius: "var(--radius-sm)",
            border: "none", background: detecting ? C.textLight : C.navy,
            color: C.white, cursor: detecting ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600, transition: "var(--transition)",
          }}>
            {detecting ? "Detecting…" : "📡 Detect My Location"}
          </button>
          {(value.address || typeof value === "string") && (
            <div style={{ marginTop: 6, fontSize: 11, color: C.textMid, fontFamily: "var(--font-mono)" }}>
              ✅ {value.address || value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
