export const C = {
  navy:        "#1B3F7A",
  navyDark:    "#142E5C",
  navyLight:   "#2451A0",
  teal:        "#2DC8A0",
  tealLight:   "#E8FAF5",
  orange:      "#F97316",
  orangeLight: "#FFF3E8",
  red:         "#EF4444",
  redLight:    "#FEE2E2",
  yellow:      "#F59E0B",
  green:       "#22C55E",
  greenLight:  "#DCFCE7",
  purple:      "#7C3AED",
  purpleLight: "#EDE9FE",
  blue:        "#3B82F6",
  blueLight:   "#EFF6FF",
  white:       "#FFFFFF",
  bg:          "#F0F4F9",
  bgCard:      "#FFFFFF",
  border:      "#E2E8F0",
  borderMid:   "#CBD5E1",
  text:        "#1E293B",
  textMid:     "#475569",
  textLight:   "#94A3B8",
};

export const DEPTS = {
  pothole:     { label: "Roads & Infrastructure",  code: "PWD-01", icon: "🚧", color: C.navy,    bg: C.blueLight,   officer: "Suresh Patil",    eta: "48–72 hrs" },
  garbage:     { label: "Waste Management",         code: "SWM-02", icon: "🗑️", color: C.green,   bg: C.greenLight,  officer: "Meena Sharma",    eta: "24–48 hrs" },
  streetlight: { label: "Electrical Works",         code: "EWD-03", icon: "💡", color: C.yellow,  bg: "#FFFBEB",     officer: "Rajiv Kulkarni",  eta: "24–36 hrs" },
  flooding:    { label: "Drainage & Waterways",     code: "DRN-04", icon: "💧", color: C.blue,    bg: C.blueLight,   officer: "Anjali Nair",     eta: "12–24 hrs" },
  graffiti:    { label: "Public Property",          code: "PPD-05", icon: "🎨", color: C.purple,  bg: C.purpleLight, officer: "Vikram Desai",    eta: "72–96 hrs" },
  unknown:     { label: "General Municipal",        code: "GMD-00", icon: "🏛️", color: C.textMid, bg: "#F8FAFC",     officer: "Municipal Office", eta: "TBD" },
};

export const PRIORITY = {
  critical: { color: C.red,    bg: C.redLight,    label: "CRITICAL" },
  high:     { color: C.orange, bg: C.orangeLight, label: "HIGH" },
  medium:   { color: C.yellow, bg: "#FFFBEB",     label: "MEDIUM" },
  low:      { color: C.green,  bg: C.greenLight,  label: "LOW" },
};

export const STATUS_COLORS = {
  "New":         { dot: C.navy,   bg: C.blueLight,   text: C.navy },
  "Assigned":    { dot: C.orange, bg: C.orangeLight, text: C.orange },
  "In Progress": { dot: C.blue,   bg: C.blueLight,   text: C.blue },
  "Resolved":    { dot: C.green,  bg: C.greenLight,  text: C.green },
  "Critical":    { dot: C.red,    bg: C.redLight,    text: C.red },
  "Closed":      { dot: C.textLight, bg: "#F1F5F9",  text: C.textLight },
};

export const ISSUE_TYPES = ["pothole", "garbage", "streetlight", "flooding", "graffiti", "unknown"];
export const STATUS_LIST = ["New", "Assigned", "In Progress", "Critical", "Resolved", "Closed"];
export const PRIORITY_LIST = ["low", "medium", "high", "critical"];
