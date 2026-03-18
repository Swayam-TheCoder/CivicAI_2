import { useState } from "react";
import { runAI, toB64 } from "../utils/ai";
import { C } from "../utils/constants";
import Card from "../components/common/Card";
import MapPanel from "../components/map/MapPanel";
import UploadBox from "../components/report/UploadBox";
import AIResultCard from "../components/report/AIResultCard";
import LocationPicker from "../components/report/LocationPicker";
import { generateId } from "../utils/helpers";
import { isDuplicate } from "../utils/helpers";


// NEW COMPONENTS
export default function ReportScreen({
  issues,
  setIssues,
  setActiveNav,
  setSelectedId,
}) {
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");

  // ── FILE HANDLER ──
  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
    setResult(null);
  };

  // ── AI ANALYSIS ──
  const handleAnalyze = async () => {
    if (!imgFile) return;

    setLoading(true);
    try {
      const b64 = await toB64(imgFile);
      const ai = await runAI(b64);
      setResult(ai);
    } catch {
      setResult({
        type: "unknown",
        severity: "medium",
        description: "AI failed. Try again.",
      });
    }
    setLoading(false);
  };

  // ── SUBMIT ──
  const handleSubmit = () => {
    if (!result) return;

    const newIssue = {
      id: generateId("CIV", issues.length),
      type: result.type,
      desc: result.description,
      location: location || "Unknown",
      status: "New",
      priority: result.severity,
      votes: 1,
      reporters: 1,
      coords: { x: 50, y: 50 },
    };

    setIssues((prev) => [newIssue, ...prev]);
    setSelectedId(newIssue.id);
    setActiveNav("map");
    if (isDuplicate(issues, newIssue.coords)) {
      alert("Duplicate issue nearby!");
      return;
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 20,
      }}
    >
      {/* ── LEFT PANEL ── */}
      <Card style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 10 }}>📸 Report Issue</h2>

        {/* Upload */}
        <UploadBox onFileSelect={handleFile} preview={imgPreview} />

        {/* Analyze */}
        <button
          onClick={handleAnalyze}
          disabled={!imgFile || loading}
          style={{
            marginTop: 10,
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "none",
            background: loading ? "#94A3B8" : "#2563EB",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Analyzing..." : "Run AI Analysis"}
        </button>

        {/* AI Result */}
        <AIResultCard result={result} />

        {/* Location */}
        <LocationPicker value={location} onChange={setLocation} />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!result}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: result ? "#10B981" : "#CBD5F5",
            color: "white",
            fontWeight: 700,
            cursor: result ? "pointer" : "not-allowed",
          }}
        >
          Submit Report
        </button>
      </Card>

      {/* ── RIGHT MAP ── */}
      <Card>
        <MapPanel issues={issues} />
      </Card>
    </div>
  );
}
