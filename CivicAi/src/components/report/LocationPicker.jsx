import { useState } from "react";
import { C } from "../../utils/constants";

export default function LocationPicker({ value, onChange }) {
  const [mode, setMode] = useState("auto");

  const handleAutoDetect = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      onChange(coords);
    });
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        📍 Location
      </div>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
        {["auto", "manual"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${C.border}`,
              background: mode === m ? C.navy : C.white,
              color: mode === m ? C.white : C.text,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Auto */}
      {mode === "auto" && (
        <button
          onClick={handleAutoDetect}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            background: "#2563EB",
            color: "white",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Detect Location
        </button>
      )}

      {/* Manual */}
      {mode === "manual" && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter location..."
          style={{
            width: "100%",
            padding: 6,
            borderRadius: 6,
            border: `1px solid ${C.border}`,
          }}
        />
      )}
    </div>
  );
}