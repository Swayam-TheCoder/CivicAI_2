import { C } from "../../utils/constants";

export default function Footer() {
  return (
    <div
      style={{
        height: 40,
        background: C.white,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        color: C.textLight,
      }}
    >
      © 2026 CivicAI • Smart Governance System 🚀
    </div>
  );
}