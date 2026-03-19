import { C } from "../../utils/constants";

export default function Footer() {
  return (
    <footer style={{
      height: 36, background: C.white, borderTop: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: C.textLight, flexShrink: 0,
      gap: 16,
    }}>
      <span>© 2026 CivicAI — Pune Municipal Corporation</span>
      <span style={{ color: C.border }}>|</span>
      <span>Smart Governance Platform 🚀</span>
    </footer>
  );
}
