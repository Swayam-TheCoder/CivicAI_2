import { C } from "../../utils/constants";

export default function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.bgCard, borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}