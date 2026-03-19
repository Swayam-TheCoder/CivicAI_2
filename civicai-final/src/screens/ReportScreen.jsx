import { useState } from "react";
import { C, ISSUE_TYPES, DEPTS } from "../utils/constants";
import Card from "../components/common/Card";
import MapPanel from "../components/map/MapPanel";
import UploadBox from "../components/report/UploadBox";
import AIResultCard from "../components/report/AIResultCard";
import LocationPicker from "../components/report/LocationPicker";
import Spinner from "../components/common/Spinner";
import { aiApi, issuesApi } from "../services/api";
import { toB64 } from "../utils/helpers";
import { showToast } from "../components/common/Toast";
import { useAuth } from "../contexts/AuthContext";

export default function ReportScreen({ setActiveNav }) {
  const { user } = useAuth();
  const [imgFile, setImgFile]       = useState(null);
  const [preview, setPreview]       = useState(null);
  const [aiResult, setAiResult]     = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(null);
  const [location, setLocation]     = useState({ address: "", ward: "" });
  const [notes, setNotes]           = useState("");
  const [manualType, setManualType] = useState("");

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    setImgFile(file);
    setPreview(URL.createObjectURL(file));
    setAiResult(null);
  };

  const handleAnalyze = async () => {
    if (!imgFile) return;
    setAnalyzing(true);
    try {
      const b64 = await toB64(imgFile);
      const res = await aiApi.analyzeBase64(b64, imgFile.type);
      setAiResult(res.data.analysis);
      showToast("AI analysis complete ✅", "success");
    } catch (err) {
      showToast(err.message || "AI analysis failed", "error");
      setAiResult({ type: "unknown", severity: "medium", confidence: 0, description: "Manual review required.", action: "Submit for inspection.", hazard: false });
    }
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!user) { showToast("Please sign in to report an issue", "error"); return; }

    const type = aiResult?.type !== "unknown" ? aiResult?.type : manualType;
    if (!type) { showToast("Select an issue type", "error"); return; }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("type", type);
      if (aiResult?.description) form.append("description", aiResult.description);
      if (notes) form.append("notes", notes);

      const locObj = {
        address: location.address || location,
        ward:    location.ward || "",
        coords:  { type: "Point", coordinates: [0, 0] },
      };
      form.append("location", JSON.stringify(locObj));

      if (imgFile) form.append("photo", imgFile);

      const res = await issuesApi.create(form);

      if (res.data?.merged) {
        showToast(`Merged with existing issue ${res.data.issue?.issueId}`, "info");
      } else {
        showToast(`Issue ${res.data.issue?.issueId} submitted! ✅`, "success");
      }

      setSubmitted(res.data.issue);
    } catch (err) {
      showToast(err.message || "Submission failed", "error");
    }
    setSubmitting(false);
  };

  // Success state
  if (submitted) {
    const dept = DEPTS[submitted.type] || DEPTS.unknown;
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", animation: "fadeIn 0.3s ease",
      }}>
        <Card style={{ padding: 40, textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 6 }}>
            Issue Submitted!
          </div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: C.textMid,
            fontFamily: "var(--font-mono)", marginBottom: 16,
          }}>
            {submitted.issueId}
          </div>
          <div style={{
            background: dept.bg, borderRadius: "var(--radius-md)",
            padding: 16, marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, color: dept.color, fontWeight: 700, marginBottom: 4 }}>
              {dept.icon} Routed to {dept.label}
            </div>
            <div style={{ fontSize: 11, color: C.textMid }}>
              Officer: {dept.officer} · ETA: {dept.eta}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => { setSubmitted(null); setImgFile(null); setPreview(null); setAiResult(null); setNotes(""); setLocation({ address: "", ward: "" }); }} style={{
              padding: "9px 18px", background: C.white,
              border: `1px solid ${C.border}`, borderRadius: "var(--radius-sm)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text,
            }}>
              Report Another
            </button>
            <button onClick={() => setActiveNav("issues")} style={{
              padding: "9px 18px", background: C.navy,
              border: "none", borderRadius: "var(--radius-sm)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.white,
            }}>
              View All Issues →
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "clamp(300px, 35%, 420px) 1fr",
      gap: 16, height: "100%",
      animation: "fadeIn 0.2s ease",
    }}>
      {/* ── LEFT: Form ── */}
      <div style={{ overflowY: "auto", paddingRight: 2 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>📸</span> Report a Civic Issue
          </div>

          {/* Not logged in warning */}
          {!user && (
            <div style={{
              background: C.orangeLight, border: `1px solid ${C.orange}`,
              borderRadius: "var(--radius-sm)", padding: "8px 12px",
              fontSize: 11, color: C.orange, fontWeight: 600, marginBottom: 14,
            }}>
              ⚠️ Sign in to submit a report. You can still run AI analysis.
            </div>
          )}

          {/* Upload */}
          <UploadBox onFileSelect={handleFile} preview={preview} />

          {/* AI Analyze button */}
          <button onClick={handleAnalyze} disabled={!imgFile || analyzing} style={{
            marginTop: 10, width: "100%", padding: "9px",
            borderRadius: "var(--radius-sm)", border: "none",
            background: (!imgFile || analyzing) ? C.textLight : C.navy,
            color: C.white, cursor: (!imgFile || analyzing) ? "not-allowed" : "pointer",
            fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "var(--transition)",
          }}>
            {analyzing ? <><Spinner size={14} color="#fff" /> Analyzing with Claude AI…</> : "🤖 Run AI Analysis"}
          </button>

          {/* AI Result */}
          {aiResult && <AIResultCard result={aiResult} />}

          {/* Manual type fallback */}
          {(!aiResult || aiResult.type === "unknown") && (
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Issue Type {!aiResult && "(required)"}
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ISSUE_TYPES.filter(t => t !== "unknown").map(t => {
                  const d = DEPTS[t];
                  return (
                    <button key={t} onClick={() => setManualType(t)} style={{
                      padding: "5px 12px", borderRadius: 20,
                      border: `1px solid ${manualType === t ? d.color : C.border}`,
                      background: manualType === t ? d.bg : C.white,
                      color: manualType === t ? d.color : C.textMid,
                      cursor: "pointer", fontSize: 11, fontWeight: 600,
                      transition: "var(--transition)",
                    }}>
                      {d.icon} {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location */}
          <LocationPicker value={location} onChange={setLocation} />

          {/* Notes */}
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Additional Notes (optional)
            </label>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any additional context about the issue…"
              rows={3}
              style={{
                width: "100%", padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${C.border}`, fontSize: 12,
                resize: "vertical", fontFamily: "var(--font)",
                outline: "none", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = C.navy}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !user || (!aiResult && !manualType)}
            style={{
              marginTop: 14, width: "100%", padding: "11px",
              borderRadius: "var(--radius-sm)", border: "none",
              background: (submitting || !user || (!aiResult && !manualType)) ? C.textLight : C.teal,
              color: C.white, fontWeight: 700, fontSize: 14,
              cursor: (submitting || !user || (!aiResult && !manualType)) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "var(--transition)",
            }}
          >
            {submitting
              ? <><Spinner size={14} color="#fff" /> Submitting…</>
              : "✅ Submit Report"
            }
          </button>
        </Card>
      </div>

      {/* ── RIGHT: Map ── */}
      <Card style={{ overflow: "hidden" }}>
        <MapPanel issues={[]} />
      </Card>
    </div>
  );
}
