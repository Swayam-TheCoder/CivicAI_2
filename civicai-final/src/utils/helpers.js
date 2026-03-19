export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const timeAgo = (date) => {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const getDepartment = (type, DEPTS) => DEPTS[type] || DEPTS.unknown;

export const toB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(file);
});

// Normalise issue from backend (_id → id, description → desc etc.)
export const normaliseIssue = (issue) => ({
  ...issue,
  id:        issue.issueId || issue._id,
  desc:      issue.description || issue.desc || "",
  location:  issue.location?.address || issue.location || "Unknown",
  ward:      issue.location?.ward || issue.ward || "",
  coords:    issue.location?.coords?.coordinates
    ? { x: 50, y: 50 }   // map pin default — backend coords are [lng,lat]
    : (issue.coords || { x: 50, y: 50 }),
  reporters: issue.reporterCount || issue.reporters?.length || 1,
  merged:    issue.isMerged || false,
  timestamp: timeAgo(issue.createdAt),
});
