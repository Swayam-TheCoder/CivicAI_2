import { useState, useEffect } from "react";

let _show = null;

export function showToast(message, type = "success") {
  if (_show) _show({ message, type });
}

export default function ToastContainer() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    _show = (t) => {
      setToast(t);
      setTimeout(() => setToast(null), 3200);
    };
    return () => { _show = null; };
  }, []);

  if (!toast) return null;

  const colors = {
    success: { bg: "var(--green)",  border: "#16A34A" },
    error:   { bg: "var(--red)",    border: "#DC2626" },
    info:    { bg: "var(--navy)",   border: "var(--navy-dark)" },
    warning: { bg: "var(--orange)", border: "#EA580C" },
  };
  const c = colors[toast.type] || colors.info;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, color: "#fff",
      padding: "12px 20px", borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-lg)", fontSize: 13, fontWeight: 600,
      animation: "fadeIn 0.2s ease",
      border: `1px solid ${c.border}`,
      maxWidth: 320,
    }}>
      {toast.message}
    </div>
  );
}
