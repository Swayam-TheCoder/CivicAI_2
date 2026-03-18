// ─────────────────────────────────────────────
// 🆔 Generate Unique Issue ID
// ─────────────────────────────────────────────
export const generateId = (prefix = "CIV", count = 0) => {
  return `${prefix}-${100 + count + Math.floor(Math.random() * 900)}`;
};

// ─────────────────────────────────────────────
// 📅 Format Date
// ─────────────────────────────────────────────
export const formatDate = (date = new Date()) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─────────────────────────────────────────────
// 🔤 Capitalize First Letter
// ─────────────────────────────────────────────
export const capitalize = (str = "") => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ─────────────────────────────────────────────
// 📍 Distance Between Two Points (simple)
// ─────────────────────────────────────────────
export const getDistance = (a, b) => {
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// ─────────────────────────────────────────────
// 🔁 Check Duplicate Issue (same location)
// ─────────────────────────────────────────────
export const isDuplicate = (issues, newCoords, threshold = 10) => {
  return issues.some((issue) => {
    const dist = getDistance(issue.coords, newCoords);
    return dist < threshold;
  });
};

// ─────────────────────────────────────────────
// 🔢 Sort Issues by Priority
// ─────────────────────────────────────────────
export const sortByPriority = (issues) => {
  const order = { high: 3, medium: 2, low: 1 };
  return [...issues].sort(
    (a, b) => order[b.priority] - order[a.priority]
  );
};

// ─────────────────────────────────────────────
// 🔥 Sort Issues by Votes
// ─────────────────────────────────────────────
export const sortByVotes = (issues) => {
  return [...issues].sort((a, b) => b.votes - a.votes);
};

// ─────────────────────────────────────────────
// 📊 Filter Issues by Status
// ─────────────────────────────────────────────
export const filterByStatus = (issues, status) => {
  if (status === "All") return issues;
  return issues.filter((i) => i.status === status);
};

// ─────────────────────────────────────────────
// 🎯 Get Priority Label Safely
// ─────────────────────────────────────────────
export const getPriorityLabel = (priority, PRIORITY) => {
  return PRIORITY[priority]?.label || "Unknown";
};

// ─────────────────────────────────────────────
// 🏢 Get Department Safely
// ─────────────────────────────────────────────
export const getDepartment = (type, DEPTS) => {
  return DEPTS[type] || DEPTS["unknown"];
};