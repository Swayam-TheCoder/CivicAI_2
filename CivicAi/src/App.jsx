import { useState } from "react";

// Layout
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

// Screens
import DashboardScreen from "./screens/DashboardScreen";
import IssuesScreen from "./screens/IssuesScreen";
import ReportScreen from "./screens/ReportScreen";

// Mock Data (you can move to separate file later)
const initialIssues = [
  {
    id: "CIV-101",
    type: "pothole",
    desc: "Large pothole causing traffic",
    location: "Main Road",
    ward: "Ward 12",
    status: "New",
    priority: "high",
    votes: 12,
    reporters: 5,
    coords: { x: 30, y: 40 },
  },
  {
    id: "CIV-102",
    type: "garbage",
    desc: "Garbage not collected",
    location: "Market Area",
    ward: "Ward 8",
    status: "In Progress",
    priority: "medium",
    votes: 8,
    reporters: 3,
    coords: { x: 60, y: 70 },
  },
];

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [issues, setIssues] = useState(initialIssues);
  const [selectedId, setSelectedId] = useState(null);

  // ── HANDLE VOTE ──
  const handleVote = (id) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, votes: issue.votes + 1 }
          : issue
      )
    );
  };

  // ── SCREEN RENDER ──
  const renderScreen = () => {
    switch (activeNav) {
      case "dashboard":
      case "map":
        return (
          <DashboardScreen
            issues={issues}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            handleVote={handleVote}
          />
        );

      case "issues":
        return (
          <IssuesScreen
            issues={issues}
            handleVote={handleVote}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            setActiveNav={setActiveNav}
          />
        );

      case "report":
        return (
          <ReportScreen
            issues={issues}
            setIssues={setIssues}
            setActiveNav={setActiveNav}
            setSelectedId={setSelectedId}
          />
        );

      default:
        return <div>Not Found</div>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#F8FAFC",
      }}
    >
      {/* ── HEADER ── */}
      <Header activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* ── BODY ── */}
      <div style={{ display: "flex", flex: 1 }}>
        
        {/* Sidebar */}
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

        {/* Main Content */}
        <div
          style={{
            flex: 1,
            padding: 16,
            overflowY: "auto",
          }}
        >
          {renderScreen()}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}