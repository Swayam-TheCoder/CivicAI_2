import { useState } from "react";
import { C } from "../utils/constants";
import { useAuth } from "../contexts/AuthContext";
import Spinner from "../components/common/Spinner";

export default function AuthScreen() {
  const { login, register, loading } = useAuth();
  const [mode, setMode]   = useState("login");
  const [error, setError] = useState("");
  const [form, setForm]   = useState({ name: "", email: "", password: "" });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const res = mode === "login"
      ? await login(form.email, form.password)
      : await register({ name: form.name, email: form.email, password: form.password });
    if (!res.ok) setError(res.error);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: `1px solid ${C.border}`, fontSize: 13,
    outline: "none", boxSizing: "border-box",
    fontFamily: "var(--font)",
    transition: "border-color var(--transition)",
  };

  return (
    <div style={{
      height: "100%", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0F2756 0%, #1B3F7A 60%, #2451A0 100%)",
    }}>
      <div style={{
        background: C.white, borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)", padding: "40px 36px",
        width: "100%", maxWidth: 400,
        animation: "fadeIn 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏛️</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>
            Civic<span style={{ color: C.teal }}>AI</span>
          </div>
          <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>
            Pune Municipal Smart Governance
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#F1F5F9",
          borderRadius: "var(--radius-md)", padding: 3, marginBottom: 24,
        }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "8px", borderRadius: "var(--radius-sm)",
              border: "none", cursor: "pointer",
              background: mode === m ? C.white : "transparent",
              color: mode === m ? C.navy : C.textMid,
              fontWeight: 700, fontSize: 13,
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              transition: "var(--transition)",
            }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 4 }}>
                FULL NAME
              </label>
              <input
                value={form.name} onChange={set("name")}
                placeholder="Swayam Sagarkar" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.navy}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 4 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email" value={form.email} onChange={set("email")}
              placeholder="yourEmail@example.com" required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = C.navy}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 4 }}>
              PASSWORD
            </label>
            <input
              type="password" value={form.password} onChange={set("password")}
              placeholder={mode === "register" ? "Min 6 characters" : "••••••••"}
              required minLength={6}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = C.navy}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {error && (
            <div style={{
              background: C.redLight, border: `1px solid ${C.red}`,
              borderRadius: "var(--radius-sm)", padding: "8px 12px",
              fontSize: 12, color: C.red, fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: "11px",
            background: loading ? C.textLight : C.navy,
            color: C.white, border: "none",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "var(--transition)",
          }}>
            {loading ? <><Spinner size={16} color="#fff" /> Processing…</> : (mode === "login" ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.textLight }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} style={{
            background: "none", border: "none", color: C.navy, fontWeight: 700,
            cursor: "pointer", fontSize: 11, textDecoration: "underline",
          }}>
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </div>

        {/* Demo hint */}
        <div style={{
          marginTop: 16, padding: "8px 12px",
          background: "#F8FAFC", borderRadius: "var(--radius-sm)",
          fontSize: 10, color: C.textLight, textAlign: "center", lineHeight: 1.6,
        }}>
          Demo: register with any email + password (min 6 chars)
        </div>
      </div>
    </div>
  );
}
