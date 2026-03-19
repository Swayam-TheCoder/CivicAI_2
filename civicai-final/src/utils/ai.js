// ─── AI ───────────────────────────────────────────────────────────────────────
export async function runAI(base64Image) {
  const res = await fetch("https://civicai-2-6h8l.onrender.com/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } },
          { type: "text", text: `You are a civic issue detection AI. Analyze the image for public infrastructure problems. Respond ONLY with raw JSON, no markdown:
{"type":"pothole"|"garbage"|"streetlight"|"flooding"|"graffiti"|"unknown","confidence":<0-100>,"severity":"low"|"medium"|"high"|"critical","title":"<short issue title>","description":"<one factual sentence>","action":"<one action sentence>","hazard":true|false}` }
        ]
      }]
    })
  });
  const d = await res.json();
  const raw = (d.content || []).map(b => b.text || "").join("");
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return { type: "unknown", confidence: 50, severity: "medium", title: "Issue Detected", description: "Manual review required.", action: "Submit for inspection.", hazard: false }; }
}

export function toB64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}