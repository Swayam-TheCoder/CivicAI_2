// ─── DESIGN TOKENS (matching the reference image) ────────────────────────────
export const C = {
  navy:       "#1B3F7A",
  navyDark:   "#142E5C",
  navyLight:  "#2451A0",
  teal:       "#2DC8A0",
  tealLight:  "#E8FAF5",
  orange:     "#F97316",
  orangeLight:"#FFF3E8",
  red:        "#EF4444",
  redLight:   "#FEE2E2",
  yellow:     "#F59E0B",
  green:      "#22C55E",
  greenLight: "#DCFCE7",
  purple:     "#7C3AED",
  purpleLight:"#EDE9FE",
  blue:       "#3B82F6",
  blueLight:  "#EFF6FF",
  white:      "#FFFFFF",
  bg:         "#F0F4F9",
  bgCard:     "#FFFFFF",
  border:     "#E2E8F0",
  borderMid:  "#CBD5E1",
  text:       "#1E293B",
  textMid:    "#475569",
  textLight:  "#94A3B8",
  sidebar:    "#1B3F7A",
};


// ─── DEPARTMENT CONFIG ────────────────────────────────────────────────────────
export const DEPTS = {
  pothole:     { label: "Roads Dept.",       code: "PWD-01", icon: "🚧", color: C.navy,   bg: C.blueLight,   officer: "Suresh Patil",   eta: "48–72 hrs" },
  garbage:     { label: "Waste Mgmt.",       code: "SWM-02", icon: "🗑️", color: C.green,  bg: C.greenLight,  officer: "Meena Sharma",   eta: "24–48 hrs" },
  streetlight: { label: "Electrical Works.", code: "EWD-03", icon: "💡", color: C.yellow, bg: "#FFFBEB",     officer: "Rajiv Kulkarni", eta: "24–36 hrs" },
  flooding:    { label: "Drainage Dept.",    code: "DRN-04", icon: "💧", color: C.blue,   bg: C.blueLight,   officer: "Anjali Nair",    eta: "12–24 hrs" },
  graffiti:    { label: "Public Property.",  code: "PPD-05", icon: "🎨", color: C.purple, bg: C.purpleLight, officer: "Vikram Desai",   eta: "72–96 hrs" },
  unknown:     { label: "Municipal Office.", code: "GMD-00", icon: "🏛️", color: C.textMid,bg: "#F8FAFC",     officer: "General Office", eta: "TBD" },
};

export const PRIORITY = {
  critical: { color: C.red,    bg: C.redLight,    label: "CRITICAL" },
  high:     { color: C.orange, bg: C.orangeLight, label: "HIGH" },
  medium:   { color: C.yellow, bg: "#FFFBEB",     label: "MEDIUM" },
  low:      { color: C.green,  bg: C.greenLight,  label: "LOW" },
};

export const STATUS_COLORS = {
  "New":         { dot: C.navy,   bg: C.blueLight },
  "Assigned":    { dot: C.orange, bg: C.orangeLight },
  "In Progress": { dot: C.blue,   bg: C.blueLight },
  "Resolved":    { dot: C.green,  bg: C.greenLight },
  "Critical":    { dot: C.red,    bg: C.redLight },
};

export const SEED_ISSUES = [
  { id: "CIV-104", type: "pothole",     desc: "Large pothole near signal, risk to two-wheelers",   location: "Fergusson College Rd",  ward: "Ward 12", status: "Assigned",    priority: "high",     votes: 14, reporters: 6,  timestamp: "2h ago",  coords: { x: 60, y: 22 }, merged: false },
  { id: "CIV-108", type: "garbage",     desc: "Overflowing municipal bin, uncollected for 3 days", location: "FC Road, Shivajinagar", ward: "Ward 8",  status: "In Progress", priority: "medium",   votes: 9,  reporters: 4,  timestamp: "5h ago",  coords: { x: 38, y: 35 }, merged: false },
  { id: "CIV-112", type: "garbage",     desc: "Garbage dump near residential area — 3 merged",     location: "Karve Road Corner",     ward: "Ward 6",  status: "New",         priority: "high",     votes: 18, reporters: 3,  timestamp: "1d ago",  coords: { x: 55, y: 60 }, merged: true },
  { id: "CIV-115", type: "streetlight", desc: "Three consecutive streetlights non-functional",     location: "Koregaon Park Lane 5",  ward: "Ward 15", status: "New",         priority: "high",     votes: 7,  reporters: 3,  timestamp: "1d ago",  coords: { x: 72, y: 48 }, merged: false },
  { id: "CIV-118", type: "flooding",    desc: "Severe waterlogging during rain, drainage blocked", location: "Karve Road Underpass",  ward: "Ward 6",  status: "Critical",    priority: "critical", votes: 31, reporters: 12, timestamp: "2d ago",  coords: { x: 28, y: 68 }, merged: false },
  { id: "CIV-121", type: "pothole",     desc: "Road cave-in near school entrance",                 location: "Deccan Gymkhana",       ward: "Ward 9",  status: "Resolved",    priority: "low",      votes: 5,  reporters: 2,  timestamp: "4d ago",  coords: { x: 44, y: 52 }, merged: false },
  { id: "CIV-122", type: "graffiti",    desc: "Vandalism on heritage wall boundary",               location: "Aga Khan Palace Rd",    ward: "Ward 21", status: "Resolved",    priority: "low",      votes: 3,  reporters: 2,  timestamp: "4d ago",  coords: { x: 80, y: 30 }, merged: false },
];